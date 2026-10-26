import { RecentTransactions } from '@/account/pages/account-details/parts/recent-transactions';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('RecentTransactions', () => {
  it('shows the account empty state when there are no transactions', () => {
    render(
      <RecentTransactions
        accountId="cash-main"
        transactions={[]}
        empty
        search=""
        sortDirection="desc"
        onSearchChange={vi.fn()}
        onSortChange={vi.fn()}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText('No transactions yet.')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(6);
    expect(
      screen.getByRole('columnheader', { name: 'Account' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Summary' })
    ).toBeInTheDocument();
  });

  it('keeps search available when no results match the query', async () => {
    const onSearchChange = vi.fn();
    render(
      <RecentTransactions
        accountId="cash-main"
        transactions={[]}
        empty={false}
        search="Unmatched"
        sortDirection="desc"
        onSearchChange={onSearchChange}
        onSortChange={vi.fn()}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.queryByText('No transactions yet.')).not.toBeInTheDocument();
    await userEvent.clear(screen.getByRole('searchbox'));
    expect(onSearchChange).toHaveBeenCalledWith('');
  });
});
