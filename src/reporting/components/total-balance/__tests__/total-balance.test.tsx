import { TotalBalance } from '@/reporting/components/total-balance';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
const balance = { amount: 87450000, currencyCode: 'NGN', isMinorUnit: false };
describe('TotalBalance', () => {
  it.each([
    ['positive', 10000, 'text-success'],
    ['negative', -10000, 'text-destructive'],
    ['zero', 0, 'text-foreground'],
  ])('uses the %s growth color', (_direction, amount, className) => {
    render(
      <TotalBalance
        label="Available funds"
        balanceLabel="Converted funds"
        comparisonLabel="compared with opening balance"
        balance={balance}
        change={{
          amount: {
            amount,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
          percentageChange: null,
        }}
      />
    );

    expect(
      screen.getByText('compared with opening balance').closest('dd')
    ).toHaveClass(className);
  });
  it('renders the total without a comparison when none is supplied', () => {
    render(
      <TotalBalance
        balance={balance}
        label="Available funds"
        balanceLabel="Converted funds"
      />
    );
    expect(screen.getByText('₦87,450,000')).toBeVisible();
    expect(screen.queryByText('≈')).not.toBeInTheDocument();
    expect(screen.getByText('Available funds')).toBeVisible();
    expect(screen.getByText('Converted funds')).toHaveClass('sr-only');
    expect(screen.queryByText('Total balance')).not.toBeInTheDocument();
    expect(screen.queryByText(/since/)).not.toBeInTheDocument();
  });
  it.each([true, false])('honors isConverted=%s', (isConverted) => {
    render(
      <TotalBalance
        balance={balance}
        label="Available funds"
        balanceLabel="Balance"
        isConverted={isConverted}
      />
    );

    if (isConverted) {
      expect(screen.getByText('≈')).toBeVisible();
    } else {
      expect(screen.queryByText('≈')).not.toBeInTheDocument();
    }
  });
});
