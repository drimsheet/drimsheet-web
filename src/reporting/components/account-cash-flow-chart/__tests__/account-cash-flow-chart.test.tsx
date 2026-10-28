import type {
  IAccountCashFlowDto,
  ILedgerAccountDto,
  TEntityId,
} from '@/shared/lib/api/Api';

const labels = {
  moneyInLabel: 'Money in',
  moneyOutLabel: 'Money out',
  totalInLabel: 'Incoming funds',
  totalOutLabel: 'Outgoing funds',
  dateLabel: 'Date',
  chartLabel: 'Money in and money out by date',
};

const account: ILedgerAccountDto = {
  id: 'account-1' as TEntityId,
  code: '100001',
  materializedPath: '100001',
  accountingEntityId: 'entity-1' as TEntityId,
  type: 'asset',
  normalBalance: 'debit',
  subType: 'cash_and_cash_equivalent',
  behavior: 'bank',
  isControlAccount: false,
  name: 'Main business account',
  status: 'active',
  contraAccountRule: 'contra_permitted',
  adjunctAccountRule: 'adjunct_permitted',
  openingBalanceDate: null,
  createdBy: 'user-1' as TEntityId,
  createdAt: '2026-01-14T12:00:00Z',
  updatedAt: '2026-01-14T12:00:00Z',
  balance: { amount: 245000000, currencyCode: 'NGN', isMinorUnit: true },
  functionalBalance: {
    amount: 2450000,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
};

const cashFlow: IAccountCashFlowDto = {
  accountId: account.id,
  currencyCode: 'NGN',
  period: { from: '2026-10-01', to: '2026-10-12' },
  totalMoneyIn: { amount: 120000000, currencyCode: 'NGN', isMinorUnit: true },
  totalMoneyOut: { amount: 780000, currencyCode: 'NGN', isMinorUnit: false },
  buckets: [
    {
      from: '2026-10-01',
      to: '2026-10-07',
      moneyIn: { amount: 60000000, currencyCode: 'NGN', isMinorUnit: true },
      moneyOut: { amount: 280000, currencyCode: 'NGN', isMinorUnit: false },
    },
    {
      from: '2026-10-08',
      to: '2026-10-12',
      moneyIn: { amount: 600000, currencyCode: 'NGN', isMinorUnit: false },
      moneyOut: { amount: 50000000, currencyCode: 'NGN', isMinorUnit: true },
    },
  ],
};

import {
  AccountCashFlowChart,
  AccountCashFlowChartWithState,
} from '@/reporting/components/account-cash-flow-chart';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('AccountCashFlowChart', () => {
  it('renders totals in major units', () => {
    render(<AccountCashFlowChart labels={labels} cashFlow={cashFlow} />);
    expect(screen.getByText('Incoming funds')).toBeInTheDocument();
    expect(screen.getByText('Outgoing funds')).toBeInTheDocument();
    expect(screen.getByText(labels.dateLabel)).toBeInTheDocument();
    expect(screen.getByText(/NGN\s*1,200,000/)).toBeInTheDocument();
    expect(screen.getByText(/NGN\s*780,000/)).toBeInTheDocument();
  });
  it('renders the zero chart without an empty-state message', () => {
    render(
      <AccountCashFlowChart
        labels={labels}
        cashFlow={{
          ...cashFlow,
          buckets: [],
          totalMoneyIn: { ...cashFlow.totalMoneyIn, amount: 0 },
          totalMoneyOut: { ...cashFlow.totalMoneyOut, amount: 0 },
        }}
      />
    );
    expect(
      screen.queryByText('No money moved during this period.')
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Money in and money out by date' })
    ).toBeInTheDocument();
  });
});

const stateLabels = {
  ...labels,
  loadingLabel: 'Loading cash flow',
  errorTitle: 'Cash flow unavailable',
  errorDescription: 'Unable to load this section.',
};

it('owns loading, errors with cached data, and default success', () => {
  const { rerender } = render(
    <AccountCashFlowChartWithState
      state="loading"
      cashFlow={cashFlow}
      labels={stateLabels}
    />
  );

  expect(
    screen.getByRole('status', { name: stateLabels.loadingLabel })
  ).toBeInTheDocument();
  expect(screen.queryByRole('region')).not.toBeInTheDocument();

  rerender(
    <AccountCashFlowChartWithState
      state="error"
      cashFlow={cashFlow}
      labels={stateLabels}
    />
  );
  expect(screen.getByRole('alert')).toHaveTextContent(stateLabels.errorTitle);
  expect(screen.getByRole('alert')).toHaveTextContent(
    stateLabels.errorDescription
  );
  expect(screen.queryByRole('region')).not.toBeInTheDocument();

  rerender(
    <AccountCashFlowChartWithState cashFlow={cashFlow} labels={stateLabels} />
  );
  expect(
    screen.getByRole('region', { name: labels.chartLabel })
  ).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it.each([undefined, null])(
  'shows an error when success has missing data: %s',
  (cashFlow) => {
    render(
      <AccountCashFlowChartWithState cashFlow={cashFlow} labels={stateLabels} />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(stateLabels.errorTitle);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  }
);

it('keeps zero activity as a successful chart', () => {
  render(
    <AccountCashFlowChartWithState
      cashFlow={{
        ...cashFlow,
        buckets: [],
        totalMoneyIn: { ...cashFlow.totalMoneyIn, amount: 0 },
        totalMoneyOut: { ...cashFlow.totalMoneyOut, amount: 0 },
      }}
      labels={stateLabels}
    />
  );
  expect(
    screen.getByRole('region', { name: labels.chartLabel })
  ).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
