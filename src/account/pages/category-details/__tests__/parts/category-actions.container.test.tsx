import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { CategoryActionsContainer } from '@/account/pages/category-details/parts/category-actions.container';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import type {
  ILedgerAccountDto,
  TLedgerAccountDeletionEligibilityDto,
} from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/account/lib/services/ledger-account.service', () => ({
  ledgerAccountService: {
    getLedgerAccountDeletionEligibility: vi.fn(),
    deleteLedgerAccount: vi.fn(),
  },
}));
vi.mock('@/shared/hooks/use-api-error-handler');
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const account: ILedgerAccountDto = {
  id: 'account',
  name: 'Operating account',
  code: '1000',
  materializedPath: '1000',
  accountingEntityId: 'entity',
  controlAccountId: 'parent',
  type: 'expense',
  subType: 'admin_and_general',
  behavior: 'admin_and_general',
  normalBalance: 'debit',
  isControlAccount: false,
  status: 'active',
  contraAccountRule: 'contra_permitted',
  adjunctAccountRule: 'adjunct_permitted',
  openingBalanceDate: null,
  createdBy: 'user',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  functionalBalance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
};

const handleError = vi.fn();

function setup(value = account) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <CategoryActionsContainer account={value} />
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { user: userEvent.setup() };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useApiErrorHandler).mockReturnValue(handleError);
  vi.mocked(
    ledgerAccountService.getLedgerAccountDeletionEligibility
  ).mockResolvedValue({ canDelete: false, reason: 'has_journal_entries' });
});

describe('CategoryActionsContainer', () => {
  it('rechecks eligibility and hides stale permission while pending or failed', async () => {
    const check = vi.mocked(
      ledgerAccountService.getLedgerAccountDeletionEligibility
    );

    check.mockResolvedValueOnce({ canDelete: true });
    const { user } = setup();

    const actions = screen.getByRole('button', {
      name: 'Open category actions',
    });

    expect(check).not.toHaveBeenCalled();
    await user.click(actions);
    expect(
      await screen.findByRole('menuitem', { name: 'Delete' })
    ).toBeVisible();
    await user.keyboard('{Escape}');
    let finish!: (value: TLedgerAccountDeletionEligibilityDto) => void;
    check.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    await user.click(actions);
    expect(
      screen.queryByRole('menuitem', { name: 'Delete' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Checking deletion availability' })
    ).toBeVisible();
    await act(async () =>
      finish({ canDelete: false, reason: 'has_journal_entries' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    );
    expect(
      screen.queryByRole('menuitem', { name: 'Delete' })
    ).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    check.mockRejectedValueOnce(new Error('Unavailable'));
    await user.click(actions);
    expect(
      await screen.findByText(
        'Unable to check deletion availability. Reopen the menu to try again.'
      )
    ).toBeVisible();
    expect(
      screen.queryByRole('menuitem', { name: 'Delete' })
    ).not.toBeInTheDocument();
  });

  it('enforces the owner-specific edit and archive restrictions', async () => {
    const { user } = setup({ ...account, status: 'archived' });
    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
    await user.click(
      screen.getByRole('button', { name: 'Open category actions' })
    );
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('closes the confirmation and retains the owner when deletion is rejected', async () => {
    const error = new Error('Referenced by transactions');
    vi.mocked(
      ledgerAccountService.getLedgerAccountDeletionEligibility
    ).mockResolvedValueOnce({ canDelete: true });
    vi.mocked(ledgerAccountService.deleteLedgerAccount).mockRejectedValue(
      error
    );
    const { user } = setup();

    const actions = screen.getByRole('button', {
      name: 'Open category actions',
    });

    await user.click(actions);
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    const dialog = screen.getByRole('alertdialog');
    await user.type(within(dialog).getByRole('textbox'), 'delete');
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() =>
      expect(handleError).toHaveBeenCalledWith(error, { showToast: true })
    );
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    );
    expect(ledgerAccountService.deleteLedgerAccount).toHaveBeenCalledWith(
      account.id
    );
    await user.click(actions);
    await waitFor(() =>
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    );
    expect(
      screen.queryByRole('menuitem', { name: 'Delete' })
    ).not.toBeInTheDocument();
  });
});
