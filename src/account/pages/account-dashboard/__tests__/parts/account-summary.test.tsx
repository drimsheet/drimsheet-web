import { AccountsSummary } from '@/account/pages/account-dashboard/parts/account-summary';
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

  it.each([
    ['positive', 10000, 'text-success'],
    ['negative', -10000, 'text-destructive'],
    ['zero', 0, 'text-foreground'],
  ])('uses the %s growth color', (_direction, amount, className) => {
    render(
      <AccountsSummary
        summary={summary}
        change={{
          amount: {
            amount,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
          percentageChange: null,
          date: '2026-05-24',
        }}
      />
    );

    expect(screen.getByText('since May 24, 2026').closest('dd')).toHaveClass(
      className
    );
  });
});
