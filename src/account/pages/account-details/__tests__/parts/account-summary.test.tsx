import { LedgerAccountSummary } from '@/account/pages/account-details/parts/account-summary';
import type { ILedgerAccountDto, TEntityId } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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

describe('LedgerAccountSummary', () => {
  it('shows account details and formats the balance from minor units', () => {
    render(<LedgerAccountSummary account={account} />);

    expect(
      screen.getByRole('heading', { name: account.name })
    ).toBeInTheDocument();
    expect(screen.getByText('Bank account')).toBeInTheDocument();
    expect(screen.getByText('Created 14 January 2026')).toHaveAttribute(
      'datetime',
      account.createdAt
    );
    expect(screen.getByText('Current balance')).toBeInTheDocument();
    expect(screen.getByText(/₦2,450,000/)).toBeInTheDocument();
  });

  it.each(['active', 'archived', 'draft'] as const)(
    'labels the %s status',
    (status) => {
      render(<LedgerAccountSummary account={{ ...account, status }} />);

      expect(
        screen.getByText(new RegExp(`^${status}$`, 'i'))
      ).toBeInTheDocument();
    }
  );

  it('shows an approximate functional balance for a foreign currency account', () => {
    render(
      <LedgerAccountSummary
        account={{
          ...account,
          balance: { amount: 150000, currencyCode: 'USD', isMinorUnit: true },
        }}
      />
    );

    expect(screen.getByText(/1,500/)).toBeInTheDocument();
    expect(screen.getByText('≈')).toBeInTheDocument();
    expect(
      screen.getByText('Approximate balance in functional currency')
    ).toBeInTheDocument();
    expect(screen.getByText(/₦2,450,000/)).toBeInTheDocument();
  });

  it('does not repeat a same-currency balance, even with different currency-code casing', () => {
    render(
      <LedgerAccountSummary
        account={{
          ...account,
          functionalBalance: {
            ...account.functionalBalance,
            currencyCode: 'ngn',
          },
        }}
      />
    );

    expect(screen.queryByText('≈')).not.toBeInTheDocument();
    expect(screen.getAllByText(/2,450,000/)).toHaveLength(1);
  });
});
