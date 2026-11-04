import { useTransactionContinuation } from '@/journal-entries/hooks/use-transaction-continuation';
import type {
  ITransactionContinuationSearchParams,
  UTransactionAccountField,
} from '@/journal-entries/lib/types/transaction-continuation.types';
import { StorageScopeContext } from '@/shared/hooks/use-scoped-key';
import { ELedgerAccountBehavior } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  navigate: vi.fn(),
  handleError: vi.fn(),
}));

vi.mock('@/journal-entries/lib/services/storage.service', () => ({
  journalEntryStorageService: {
    loadContinuation: mocks.get,
    saveContinuation: mocks.set,
    removeContinuation: mocks.remove,
  },
}));

vi.mock('@/shared/hooks/use-api-error-handler', () => ({
  useApiErrorHandler: () => mocks.handleError,
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mocks.navigate,
}));

interface IValues {
  accountId: string;
  description: string;
  attachment: File | null;
}

function setup(params: ITransactionContinuationSearchParams = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter
        initialEntries={[
          '/transactions/inflow?continuationKey=draft&accountId=new&keep=yes',
        ]}
      >
        <QueryClientProvider client={client}>
          <StorageScopeContext.Provider
            value={{ userId: 'user', accountingEntityId: 'entity' }}
          >
            {children}
          </StorageScopeContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  }

  return renderHook(
    () => ({
      ...useTransactionContinuation<IValues>('inflow', params),
      location: useLocation(),
    }),
    { wrapper: Wrapper }
  );
}

describe('useTransactionContinuation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.get.mockResolvedValue(undefined);
    mocks.set.mockResolvedValue(undefined);
    mocks.remove.mockResolvedValue(undefined);
  });

  it('restores the saved values and attachment, applies the new account, and removes only consumed parameters', async () => {
    const attachment = new File(['receipt'], 'receipt.pdf');
    mocks.get.mockResolvedValue({
      accountId: 'old',
      description: 'Saved values',
      attachment,
    });
    const { result } = setup({ continuationKey: 'draft', accountId: 'new' });

    await waitFor(() => expect(result.current.isRestoring).toBe(false));
    expect(result.current.initialValues).toEqual({
      accountId: 'new',
      description: 'Saved values',
      attachment,
    });
    expect(result.current.location.search).toBe('?keep=yes');
    expect(mocks.remove).not.toHaveBeenCalled();

    await act(() => result.current.handleContinuationComplete());
    expect(mocks.remove).toHaveBeenCalledWith(
      'user:user:entity:entity:journal-entries',
      'inflow',
      'draft'
    );
  });

  it('restores a cancelled creation without requiring an account ID', async () => {
    mocks.get.mockResolvedValue({
      accountId: 'old',
      description: 'Still here',
      attachment: null,
    });
    const { result } = setup({ continuationKey: 'draft' });
    await waitFor(() => expect(result.current.isRestoring).toBe(false));
    expect(result.current.initialValues).toMatchObject({
      accountId: 'old',
      description: 'Still here',
    });
  });

  it('does not read storage without a continuation key and tolerates failed restoration', async () => {
    const first = setup({ accountId: 'new' });
    expect(first.result.current.initialValues).toEqual({ accountId: 'new' });
    expect(mocks.get).not.toHaveBeenCalled();
    first.unmount();

    mocks.get.mockRejectedValue(new Error('Storage unavailable'));
    const { result } = setup({ continuationKey: 'missing', accountId: 'new' });
    await waitFor(() => expect(result.current.isRestoring).toBe(false));
    expect(result.current.initialValues).toEqual({ accountId: 'new' });
  });

  it('persists unfinished values before navigating directly to bank creation with the transfer alias', async () => {
    const { result } = setup();

    const values = {
      accountId: '',
      description: 'Unfinished',
      attachment: new File(['data'], 'receipt.pdf'),
    };

    act(() => result.current.handleAddAccount(values, 'destinationAccountId'));
    expect(result.current.showAccountTypeSelection).toBe(true);
    expect(mocks.set).not.toHaveBeenCalled();

    await act(() =>
      result.current.handleAccountTypeSelected(ELedgerAccountBehavior.Bank)
    );
    const [scope, type, key, saved] = mocks.set.mock.calls[0];
    expect(scope).toBe('user:user:entity:entity:journal-entries');
    expect(type).toBe('inflow');
    expect(saved).toEqual(values);

    const destination = new URL(
      mocks.navigate.mock.calls[0][0],
      'https://example.com'
    );

    expect(destination.pathname).toBe('/accounts/new/bank');
    expect(destination.searchParams.has('accountType')).toBe(false);

    const redirect = new URL(
      destination.searchParams.get('redirect')!,
      destination.origin
    );

    expect(redirect.searchParams.get('continuationKey')).toBe(key);
    expect(destination.searchParams.get('redirectAccountAlias')).toBe(
      'destinationAccountId'
    );
    expect(redirect.searchParams.size).toBe(1);
    expect(mocks.set.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.navigate.mock.invocationCallOrder[0]
    );
  });

  it.each<UTransactionAccountField>([
    'accountId',
    'sourceAccountId',
    'destinationAccountId',
  ])(
    'opens petty cash creation locally and applies the new account to %s',
    async (field) => {
      const { result } = setup();

      const values = {
        accountId: 'original',
        sourceAccountId: 'source',
        destinationAccountId: 'destination',
        description: 'Unfinished transaction',
        attachment: new File(['receipt'], 'receipt.pdf'),
      };

      act(() => result.current.handleAddAccount(values, field));
      await act(() =>
        result.current.handleAccountTypeSelected(
          ELedgerAccountBehavior.PettyCash
        )
      );

      expect(result.current.showAccountTypeSelection).toBe(false);
      expect(result.current.showPettyCashAccountCreation).toBe(true);
      expect(mocks.set).not.toHaveBeenCalled();
      expect(mocks.navigate).not.toHaveBeenCalled();

      act(() => result.current.handlePettyCashAccountCreated('new-petty-cash'));
      expect(result.current.initialValues).toEqual({
        ...values,
        [field]: 'new-petty-cash',
      });
    }
  );

  it('closes petty cash creation without changing the form defaults or navigating', async () => {
    const { result } = setup();
    const initialValues = result.current.initialValues;
    act(() =>
      result.current.handleAddAccount({
        accountId: 'original',
        description: 'Unfinished',
        attachment: null,
      })
    );
    await act(() =>
      result.current.handleAccountTypeSelected(ELedgerAccountBehavior.PettyCash)
    );
    act(() => result.current.handlePettyCashAccountCreationClose());

    expect(result.current.showPettyCashAccountCreation).toBe(false);
    expect(result.current.initialValues).toBe(initialValues);
    expect(mocks.set).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('retains the form when saving the continuation fails', async () => {
    mocks.set.mockRejectedValue(new Error('Storage unavailable'));
    const { result } = setup();
    act(() =>
      result.current.handleAddAccount({
        accountId: '',
        description: 'Unfinished',
        attachment: null,
      })
    );
    await act(() =>
      result.current.handleAccountTypeSelected(ELedgerAccountBehavior.Bank)
    );
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.handleError).toHaveBeenCalled();
    expect(result.current.isSaving).toBe(false);
  });
});
