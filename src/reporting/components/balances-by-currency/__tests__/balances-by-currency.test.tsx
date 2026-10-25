import { BalancesByCurrency } from '@/reporting/components/balances-by-currency';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
it('labels original currency balances without marking them converted', () => {
  render(
    <dl>
      <BalancesByCurrency
        balances={[{ amount: 820000, currencyCode: 'USD', isMinorUnit: true }]}
      />
    </dl>
  );
  expect(screen.getByText('USD')).toBeInTheDocument();
  expect(screen.getByText('$8,200')).toBeVisible();
  expect(screen.queryByText('≈')).not.toBeInTheDocument();
  expect(screen.queryByRole('heading')).not.toBeInTheDocument();
});
