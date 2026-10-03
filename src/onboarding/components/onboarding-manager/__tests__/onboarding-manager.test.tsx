import { useAccountingEntities } from '@/accounting/hooks/use-accounting-entities';
import locale from '@/accounting/i18n/locales/en/accounting.json';
import { OnboardingManagerContainer } from '@/onboarding/components/onboarding-manager';
import type { IAccountingEntity } from '@/shared/lib/api/Api';
import type { UseQueryResult } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const completion = vi.hoisted(() => ({ callback: async () => {} }));

vi.mock('@/accounting/dialogs/accounting-entity-creation', () => {
  return {
    __esModule: true,
    AccountingEntityCreationDialog: ({
      open,
      done,
      initialOnboarding,
    }: {
      open: boolean;
      done: () => Promise<void>;
      initialOnboarding: boolean;
    }) => {
      completion.callback = done;
      return (
        <div
          data-testid="accounting-onboarding-form"
          data-open={open}
          data-initial-onboarding={initialOnboarding}
        >
          <button type="button" onClick={() => void done()}>
            Complete
          </button>
        </div>
      );
    },
  };
});

vi.mock('@/accounting/hooks/use-accounting-entities', () => {
  return {
    __esModule: true,
    useAccountingEntities: vi.fn(),
  };
});

describe('OnboardingManagerContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when entities are loading', () => {
    vi.mocked(useAccountingEntities).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as UseQueryResult<IAccountingEntity[], Error>);

    const { container } = render(<OnboardingManagerContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('opens AccountingEntityCreationDialog when loading completes and entities are empty', () => {
    vi.mocked(useAccountingEntities).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as UseQueryResult<IAccountingEntity[], Error>);

    render(<OnboardingManagerContainer />);

    const form = screen.getByTestId('accounting-onboarding-form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('data-open', 'true');
    expect(form).toHaveAttribute('data-initial-onboarding', 'true');
  });

  it('does not open AccountingEntityCreationDialog when loading completes and entities exist', () => {
    vi.mocked(useAccountingEntities).mockReturnValue({
      data: [{ id: 'entity-1', name: 'My Entity' }],
      isLoading: false,
    } as unknown as UseQueryResult<IAccountingEntity[], Error>);

    render(<OnboardingManagerContainer />);

    const form = screen.getByTestId('accounting-onboarding-form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('data-open', 'false');
  });

  it('awaits an authoritative non-empty refetch when onboarding completes', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn().mockResolvedValue({
      data: [{ id: 'entity-1', name: 'My Entity' }],
      error: null,
    });
    vi.mocked(useAccountingEntities).mockReturnValue({
      data: [],
      isLoading: false,
      refetch,
    } as unknown as UseQueryResult<IAccountingEntity[], Error>);

    render(<OnboardingManagerContainer />);
    await user.click(screen.getByRole('button', { name: 'Complete' }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
  it('rejects a failed completion refresh even when it returns cached entities', async () => {
    const error = new Error('Refresh failed');
    const refetch = vi.fn().mockResolvedValue({
      data: [{ id: 'entity-1', name: 'My Entity' }],
      error,
    });
    vi.mocked(useAccountingEntities).mockReturnValue({
      data: [],
      isLoading: false,
      refetch,
    } as unknown as UseQueryResult<IAccountingEntity[], Error>);
    render(<OnboardingManagerContainer />);
    await expect(completion.callback()).rejects.toBe(error);
  });
  it('translates the empty completion refresh error', async () => {
    const refetch = vi.fn().mockResolvedValue({ data: [], error: null });
    vi.mocked(useAccountingEntities).mockReturnValue({
      data: [],
      isLoading: false,
      refetch,
    } as unknown as UseQueryResult<IAccountingEntity[], Error>);
    render(<OnboardingManagerContainer />);
    await expect(completion.callback()).rejects.toThrow(
      locale.onboarding_entity_refresh_error
    );
  });
});
