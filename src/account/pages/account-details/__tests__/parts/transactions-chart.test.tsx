import type {
  IAccountCashFlowDto,
  ILedgerAccountDto,
  TEntityId,
} from '@/shared/lib/api/Api';

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

import { TransactionsChart } from '@/account/pages/account-details/parts/transactions-chart';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('TransactionsChart', () => {
  it('renders totals in major units', () => {
    render(<TransactionsChart cashFlow={cashFlow} />);
    expect(screen.getByText(/₦1,200,000/)).toBeInTheDocument();
    expect(screen.getByText(/₦780,000/)).toBeInTheDocument();
  });
  it('renders an explicit zero activity state', () => {
    render(
      <TransactionsChart
        cashFlow={{
          ...cashFlow,
          buckets: [],
          totalMoneyIn: { ...cashFlow.totalMoneyIn, amount: 0 },
          totalMoneyOut: { ...cashFlow.totalMoneyOut, amount: 0 },
        }}
      />
    );
    expect(
      screen.getByText('No money moved during this period.')
    ).toBeInTheDocument();
  });
});
