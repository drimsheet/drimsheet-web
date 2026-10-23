import { BalanceTrend } from '@/account/pages/account-dashboard/parts/balance-trend';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('BalanceTrend empty states', () => {
  it('distinguishes missing history from observed zero balances', () => {
    const { rerender } = render(<BalanceTrend points={[]} />);
    expect(screen.getByText('No balance history yet')).toBeInTheDocument();
    rerender(
      <BalanceTrend
        points={['2026-04-23', '2026-10-23'].map((date) => ({
          date,
          amount: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
        }))}
      />
    );
    expect(screen.getByText('No balance activity yet')).toBeInTheDocument();
    expect(
      screen.queryByText('No balance history yet')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('application')).not.toBeInTheDocument();
  });
});
