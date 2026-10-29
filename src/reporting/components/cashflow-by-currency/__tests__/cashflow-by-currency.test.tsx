import {
  CashflowByCurrency,
  CashflowByCurrencyWithState,
} from '@/reporting/components/cashflow-by-currency';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

const moneyIn = { amount: 827000, currencyCode: 'USD', isMinorUnit: true };
const moneyOut = { amount: 3275, currencyCode: 'USD', isMinorUnit: false };

it('formats signed flows using each DTO’s units and financial colors', () => {
  render(<CashflowByCurrency in={moneyIn} out={moneyOut} />);
  expect(screen.getByLabelText('USD')).toBeInTheDocument();
  expect(screen.getByText('$8,270').parentElement).toHaveTextContent('+$8,270');
  expect(screen.getByText('$8,270').parentElement).toHaveClass(
    'text-financial-income'
  );
  expect(screen.getByText('-$3,275')).toHaveClass('text-financial-expense');
});

it('renders zero flows neutrally without positive or negative signs', () => {
  render(
    <CashflowByCurrency
      in={{ ...moneyIn, amount: 0 }}
      out={{ ...moneyOut, amount: 0 }}
    />
  );
  const amounts = screen.getAllByText('$0');
  expect(amounts[0].parentElement).toHaveClass('text-financial-neutral');
  expect(amounts[0].parentElement).toHaveTextContent(/^\$0$/);
  expect(amounts[1]).toHaveClass('text-financial-neutral');
});

it('shows an error instead of displaying mismatched currencies', () => {
  render(
    <CashflowByCurrency
      in={moneyIn}
      out={{ ...moneyOut, currencyCode: 'GBP' }}
    />
  );
  expect(screen.getByRole('alert')).toBeVisible();
  expect(screen.queryByText('$8,270')).not.toBeInTheDocument();
});

it('transitions from loading to loaded data and error', () => {
  const props = {
    in: moneyIn,
    out: moneyOut,
    loadingLabel: 'Loading cash flow',
  };

  const { rerender } = render(
    <CashflowByCurrencyWithState {...props} state="loading" />
  );

  expect(screen.getByRole('status')).toHaveTextContent('Loading cash flow');
  expect(screen.queryByText('$8,270')).not.toBeInTheDocument();
  rerender(<CashflowByCurrencyWithState {...props} />);
  expect(screen.getByText('$8,270')).toBeVisible();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  rerender(<CashflowByCurrencyWithState {...props} state="error" />);
  expect(screen.getByRole('alert')).toBeVisible();
  expect(screen.queryByText('$8,270')).not.toBeInTheDocument();
});

it.each([{ in: moneyIn }, { out: moneyOut }, {}])(
  'rejects missing success data: %j',
  (data) => {
    render(
      <CashflowByCurrencyWithState {...data} loadingLabel="Loading cash flow" />
    );
    expect(screen.getByRole('alert')).toBeVisible();
  }
);
