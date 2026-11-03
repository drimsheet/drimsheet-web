import { RecentTransactions } from '@/counterparty/pages/counterparty-details/parts/recent-transactions';
import type { RecentTransactionsProps } from '@/counterparty/pages/counterparty-details/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const props: RecentTransactionsProps = {
  counterpartyName: 'Adenike Supplies Ltd',
  empty: true,
  transactions: [],
  loading: false,
  search: '',
  sortDirection: 'desc',
  total: 0,
  transactionsHref: '/transactions?counterpartyId=one',
  onSearchChange: vi.fn(),
  onSortChange: vi.fn(),
};

describe('RecentTransactions', () => {
  it('uses the shared table empty state and preserves search', () => {
    render(
      <MemoryRouter>
        <RecentTransactions {...props} />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: 'No transactions yet' })
    ).toBeVisible();
    expect(screen.getByRole('searchbox')).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'View all transactions' })
    ).not.toBeInTheDocument();
  });
  it('keeps navigation beneath filtered results and emits search changes', async () => {
    render(
      <MemoryRouter>
        <RecentTransactions {...props} empty={false} />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: 'View all transactions' });
    expect(link).toHaveAttribute('href', props.transactionsHref);
    expect(
      screen.getByText('No records found').compareDocumentPosition(link) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    await userEvent.setup().type(screen.getByRole('searchbox'), 's');
    expect(props.onSearchChange).toHaveBeenCalledWith('s');
  });
});
