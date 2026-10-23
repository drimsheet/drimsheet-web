import { LedgerAccountsTableContainer } from '@/account/components/accounts-table';
import { useLedgerAccounts } from '@/account/hooks/use-ledger-accounts';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/account/hooks/use-ledger-accounts', () => ({
  useLedgerAccounts: vi.fn(() => ({
    data: { data: [], meta: { page: 2, limit: 10, total: 20, totalPages: 2 } },
    isLoading: false,
  })),
}));

describe('LedgerAccountsTableContainer', () => {
  it('requests status filtering from the server and resets the page when applying a new status', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={[
          '/accounts?status=archived&page=2&sort=name&order=asc',
        ]}
      >
        <LedgerAccountsTableContainer onAddAccount={() => {}} />
      </MemoryRouter>
    );
    expect(useLedgerAccounts).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: 'archived',
        page: 2,
        orderBy: 'accountName',
        sortDirection: 'asc',
      })
    );
    await user.click(
      screen.getByRole('button', { name: 'Filter by Status, 1 active' })
    );
    await user.click(screen.getByRole('checkbox', { name: 'Active' }));
    expect(
      screen.getByRole('checkbox', { name: 'Archived' })
    ).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() =>
      expect(useLedgerAccounts).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: 'active',
          page: 1,
          orderBy: 'accountName',
          sortDirection: 'asc',
        })
      )
    );
  });
});
