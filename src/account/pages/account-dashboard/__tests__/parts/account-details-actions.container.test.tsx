import type { IAccountsTableRow } from '@/account/components/accounts-table';
import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { AccountDetailsActionsContainer } from '@/account/pages/account-dashboard/parts/account-details-actions.container';
import type { TLedgerAccountDeletionEligibilityDto } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/account/lib/services/ledger-account.service', () => ({
  ledgerAccountService: {
    getLedgerAccountDeletionEligibility: vi.fn(),
    archiveLedgerAccount: vi.fn(),
    deleteLedgerAccount: vi.fn(),
  },
}));

const account: IAccountsTableRow = {
  id: 'operating',
  name: 'Operating account',
  behavior: 'bank',
  status: 'active',
  balance: { amount: 0, currencyCode: 'USD', isMinorUnit: true },
};

function setup(row = account) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <AccountDetailsActionsContainer account={row} />
    </QueryClientProvider>
  );

  return { user: userEvent.setup(), client };
}

beforeEach(() => vi.resetAllMocks());

describe('Account row actions', () => {
  it('checks eligibility on opening and hides a previously eligible delete action during a fresh check', async () => {
    const check = vi.mocked(
      ledgerAccountService.getLedgerAccountDeletionEligibility
    );

    check.mockResolvedValueOnce({ canDelete: true });
    const { user } = setup();
    expect(check).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole('button', { name: 'Open account actions' })
    );
    expect(
      await screen.findByRole('menuitem', { name: 'Delete' })
    ).toBeVisible();
    expect(check).toHaveBeenCalledWith('operating');
    await user.keyboard('{Escape}');
    let finish!: (value: TLedgerAccountDeletionEligibilityDto) => void;
    check.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    await user.click(
      screen.getByRole('button', { name: 'Open account actions' })
    );
    expect(
      screen.queryByRole('menuitem', { name: 'Delete' })
    ).not.toBeInTheDocument();
    await act(async () =>
      finish({ canDelete: false, reason: 'has_journal_entries' })
    );
    await waitFor(() =>
      expect(
        screen.queryByText(/Checking deletion eligibility/i)
      ).not.toBeInTheDocument()
    );
    expect(
      screen.queryByRole('menuitem', { name: 'Delete' })
    ).not.toBeInTheDocument();
  });

  it('shows a translated error and no delete action when eligibility fails', async () => {
    vi.mocked(
      ledgerAccountService.getLedgerAccountDeletionEligibility
    ).mockRejectedValue(new Error('Unavailable'));
    const { user } = setup();
    await user.click(
      screen.getByRole('button', { name: 'Open account actions' })
    );
    expect(
      await screen.findByText(/unable to check|could not check|couldn’t check/i)
    ).toBeVisible();
    expect(
      screen.queryByRole('menuitem', { name: 'Delete' })
    ).not.toBeInTheDocument();
  });

  it('disables edit and archive for archived accounts', async () => {
    vi.mocked(
      ledgerAccountService.getLedgerAccountDeletionEligibility
    ).mockResolvedValue({ canDelete: false, reason: 'has_journal_entries' });
    const { user } = setup({ ...account, status: 'archived' });
    await user.click(
      screen.getByRole('button', { name: 'Open account actions' })
    );
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('archives only after confirmation', async () => {
    vi.mocked(
      ledgerAccountService.getLedgerAccountDeletionEligibility
    ).mockResolvedValue({ canDelete: false, reason: 'has_journal_entries' });
    vi.mocked(ledgerAccountService.archiveLedgerAccount).mockResolvedValue(
      undefined
    );
    const { user } = setup();
    await user.click(
      screen.getByRole('button', { name: 'Open account actions' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Archive' }));
    expect(ledgerAccountService.archiveLedgerAccount).not.toHaveBeenCalled();
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Archive account',
      })
    );
    await waitFor(() =>
      expect(ledgerAccountService.archiveLedgerAccount).toHaveBeenCalledWith(
        'operating'
      )
    );
  });

  it('requires confirmation and refreshes active dashboard queries after deleting', async () => {
    vi.mocked(
      ledgerAccountService.getLedgerAccountDeletionEligibility
    ).mockResolvedValue({ canDelete: true });
    vi.mocked(ledgerAccountService.deleteLedgerAccount).mockResolvedValue(
      undefined
    );
    const { user, client } = setup();
    const refresh = vi.spyOn(client, 'refetchQueries');
    await user.click(
      screen.getByRole('button', { name: 'Open account actions' })
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    const dialog = screen.getByRole('alertdialog');
    const confirm = within(dialog).getByRole('button', { name: 'Delete' });
    expect(confirm).toBeDisabled();
    expect(ledgerAccountService.deleteLedgerAccount).not.toHaveBeenCalled();
    await user.type(within(dialog).getByRole('textbox'), 'delete');
    await user.click(confirm);
    await waitFor(() =>
      expect(ledgerAccountService.deleteLedgerAccount).toHaveBeenCalledWith(
        'operating'
      )
    );
    await waitFor(() =>
      expect(refresh).toHaveBeenCalledWith({
        queryKey: ['ledgerAccountService'],
        type: 'active',
      })
    );
    await waitFor(() =>
      expect(refresh).toHaveBeenCalledWith({
        queryKey: ['reportingService'],
        type: 'active',
      })
    );
  });
});
