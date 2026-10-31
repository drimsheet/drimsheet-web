import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { CategoryRowActionsContainer } from '@/account/pages/categories/parts/category-row-actions.container';
import type { TCategoryAccount } from '@/account/pages/categories/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/account/lib/services/ledger-account.service', () => ({
  ledgerAccountService: {
    getLedgerAccountDeletionEligibility: vi.fn(),
    deleteLedgerAccount: vi.fn(),
  },
}));

const account: TCategoryAccount = {
  accountId: 'consulting',
  accountName: 'Consulting services',
  code: '40001',
  type: 'revenue',
  subType: 'operating_revenue',
  status: 'active',
  amount: { amount: 100, currencyCode: 'NGN', isMinorUnit: false },
};

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <CategoryRowActionsContainer
        account={account}
        onViewAccount={vi.fn()}
        onEditAccount={vi.fn()}
        onArchiveAccount={vi.fn()}
      />
    </QueryClientProvider>
  );

  return userEvent.setup();
}

beforeEach(() => vi.resetAllMocks());

describe('Category row actions', () => {
  it('omits the redundant view action and offers delete only when eligible', async () => {
    vi.mocked(
      ledgerAccountService.getLedgerAccountDeletionEligibility
    ).mockResolvedValue({ canDelete: true });
    vi.mocked(ledgerAccountService.deleteLedgerAccount).mockResolvedValue(
      undefined
    );

    const user = setup();
    expect(
      ledgerAccountService.getLedgerAccountDeletionEligibility
    ).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole('button', { name: 'Actions for Consulting services' })
    );

    expect(
      screen.queryByRole('menuitem', { name: 'View category' })
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole('menuitem', { name: 'Delete' })
    ).toBeVisible();
    expect(
      ledgerAccountService.getLedgerAccountDeletionEligibility
    ).toHaveBeenCalledWith('consulting');

    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeVisible();
    expect(ledgerAccountService.deleteLedgerAccount).not.toHaveBeenCalled();

    await user.type(within(dialog).getByRole('textbox'), 'delete');
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() =>
      expect(ledgerAccountService.deleteLedgerAccount).toHaveBeenCalledWith(
        'consulting'
      )
    );
  });

  it('hides delete when the category is ineligible', async () => {
    vi.mocked(
      ledgerAccountService.getLedgerAccountDeletionEligibility
    ).mockResolvedValue({ canDelete: false, reason: 'has_journal_entries' });

    const user = setup();
    await user.click(
      screen.getByRole('button', { name: 'Actions for Consulting services' })
    );

    await waitFor(() =>
      expect(
        ledgerAccountService.getLedgerAccountDeletionEligibility
      ).toHaveBeenCalledWith('consulting')
    );
    await waitFor(() =>
      expect(
        screen.queryByLabelText('Checking deletion availability')
      ).not.toBeInTheDocument()
    );
    expect(
      screen.queryByRole('menuitem', { name: 'Delete' })
    ).not.toBeInTheDocument();
  });
});
