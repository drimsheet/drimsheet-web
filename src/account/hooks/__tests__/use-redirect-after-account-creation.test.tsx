import { useRedirectAfterAccountCreation } from '@/account/hooks/use-redirect-after-account-creation';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}));

function setup(params: Record<string, string> = {}, defaultRedirect?: string) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter
        initialEntries={[`/accounts/new/bank?${new URLSearchParams(params)}`]}
      >
        {children}
      </MemoryRouter>
    );
  }

  return renderHook(() => useRedirectAfterAccountCreation(defaultRedirect), {
    wrapper: Wrapper,
  });
}

describe('useRedirectAfterAccountCreation', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    {
      alias: 'categoryId',
      redirect:
        '/transactions/inflow?continuationKey=draft&categoryItemId=row-1',
      expected:
        '/transactions/inflow?continuationKey=draft&categoryItemId=row-1&categoryId=new-account',
    },
    {
      alias: 'accountId',
      redirect: '/transactions/inflow?continuationKey=draft',
      expected:
        '/transactions/inflow?continuationKey=draft&accountId=new-account',
    },
    {
      alias: 'destinationAccountId',
      redirect:
        '/transactions/transfer?continuationKey=draft&sourceAccountId=existing',
      expected:
        '/transactions/transfer?continuationKey=draft&sourceAccountId=existing&destinationAccountId=new-account',
    },
    {
      alias: 'sourceAccountId',
      redirect:
        '/transactions/transfer?continuationKey=draft&sourceAccountId=old#form',
      expected:
        '/transactions/transfer?continuationKey=draft&sourceAccountId=new-account#form',
    },
  ])(
    'injects the created account using the explicit $alias alias',
    async ({ alias, redirect, expected }) => {
      const { result } = setup({ redirect, redirectAccountAlias: alias });

      await result.current.redirectAfterCreation('new-account');

      expect(navigate).toHaveBeenCalledExactlyOnceWith(expected, {
        replace: true,
      });
    }
  );

  it('preserves the return URL on cancellation', async () => {
    const redirect =
      '/transactions/transfer?continuationKey=draft&sourceAccountId=existing#form';

    const { result } = setup({
      redirect,
      redirectAccountAlias: 'destinationAccountId',
    });

    await result.current.redirectAfterCancellation();

    expect(navigate).toHaveBeenCalledExactlyOnceWith(redirect, {
      replace: true,
    });
  });

  it('does not infer an account alias from parameters in the return URL', async () => {
    const redirect =
      '/transactions/transfer?continuationKey=draft&sourceAccountId=';

    const { result } = setup({ redirect });

    await result.current.redirectAfterCreation('new-account');

    expect(navigate).toHaveBeenCalledExactlyOnceWith(redirect, {
      replace: true,
    });
  });

  it('returns standalone account creation to the accounts dashboard', async () => {
    const { result } = setup();
    expect(result.current.hasRedirect).toBe(false);

    await result.current.redirectAfterCreation('new-account');

    expect(navigate).toHaveBeenCalledExactlyOnceWith('/accounts', {
      replace: true,
    });
  });

  it('keeps redirects within the application', async () => {
    const { result } = setup({
      redirect: 'https://example.com',
      redirectAccountAlias: 'accountId',
    });

    await result.current.redirectAfterCreation('new-account');

    expect(navigate).toHaveBeenCalledExactlyOnceWith('/accounts', {
      replace: true,
    });
  });
  it('returns standalone category creation to the category list', async () => {
    const { result } = setup({}, '/categories');
    await result.current.redirectAfterCancellation();
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/categories', {
      replace: true,
    });
  });
});
