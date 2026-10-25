import {
  AccountsSummary,
  AccountsSummaryError,
  AccountsSummaryWithState,
} from '@/account/pages/account-dashboard/parts/account-summary';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const summary = {
  totalFunctionalBalance: {
    amount: 87450000,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
  balancesByCurrency: [
    { amount: 71250000, currencyCode: 'NGN', isMinorUnit: false },
    { amount: 820000, currencyCode: 'USD', isMinorUnit: true },
  ],
};

describe('AccountsSummary', () => {
  it.each([undefined, null])(
    'shows its error when successful data is %s',
    (data) => {
      const { rerender } = render(<AccountsSummaryWithState summary={data} />);
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Couldn’t load balances'
      );

      rerender(<AccountsSummaryWithState state="success" summary={data} />);
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Couldn’t load balances'
      );
    }
  );

  it('keeps loading and error authoritative even when cached data exists, then renders success', () => {
    const { rerender } = render(<AccountsSummaryWithState state="loading" />);
    expect(
      screen.getByRole('status', { name: 'Loading account balances' })
    ).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(<AccountsSummaryWithState state="loading" summary={summary} />);
    expect(
      screen.getByRole('status', { name: 'Loading account balances' })
    ).toBeVisible();
    expect(screen.queryByText('₦87,450,000')).not.toBeInTheDocument();

    rerender(<AccountsSummaryWithState state="error" summary={summary} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Couldn’t load balances'
    );
    expect(screen.queryByText('₦87,450,000')).not.toBeInTheDocument();

    rerender(<AccountsSummaryWithState summary={summary} />);
    expect(screen.getByText('₦87,450,000')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders its translated error without showing balance values', () => {
    render(<AccountsSummaryError />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Couldn’t load balances'
    );
    expect(screen.queryByText('₦87,450,000')).not.toBeInTheDocument();
  });

  it('shows the approximate functional total and original currency balances without liabilities', () => {
    render(
      <AccountsSummary
        summary={summary}
        change={{
          amount: {
            amount: 10000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
          percentageChange: null,
          date: '2026-05-24',
        }}
      />
    );

    expect(screen.getByText('≈')).toBeVisible();
    expect(screen.getByText('₦87,450,000')).toBeVisible();
    expect(screen.getByText('₦10,000')).toBeVisible();
    expect(screen.getByText('since May 24, 2026')).toBeVisible();
    expect(
      screen.queryByText('Percentage unavailable')
    ).not.toBeInTheDocument();

    const currency_section = screen.getByRole('region', {
      name: 'Balances by currency',
    });

    expect(within(currency_section).getByText('NGN')).toHaveClass('sr-only');
    expect(within(currency_section).getByText('USD')).toHaveClass('sr-only');
    expect(within(currency_section).getByText('₦71,250,000')).toBeVisible();
    expect(within(currency_section).getByText('$8,200')).toBeVisible();
    expect(screen.queryByText(/liabilit/i)).not.toBeInTheDocument();
  });
});
