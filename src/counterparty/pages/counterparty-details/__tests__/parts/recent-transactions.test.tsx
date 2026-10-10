import { RecentTransactions } from '@/counterparty/pages/counterparty-details/parts/recent-transactions';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('RecentTransactions', () => {
  it('replaces table controls with a contextual empty state', () => {
    render(
      <RecentTransactions counterpartyName="Odion Oboite" empty>
        <p>Table controls</p>
      </RecentTransactions>
    );
    expect(
      screen.getByRole('heading', { name: 'No transactions yet' })
    ).toBeVisible();
    expect(
      screen.getByText('Transactions involving Odion Oboite will appear here.')
    ).toBeVisible();
    expect(screen.queryByText('Table controls')).not.toBeInTheDocument();
  });

  it('renders supplied table content for populated or filtered results', () => {
    render(
      <RecentTransactions counterpartyName="Odion Oboite" empty={false}>
        <p>Table controls</p>
      </RecentTransactions>
    );
    expect(screen.getByText('Table controls')).toBeVisible();
    expect(screen.queryByText('No transactions yet')).not.toBeInTheDocument();
  });
});
