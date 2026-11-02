import {
  CategorySummary,
  CategorySummaryWithState,
} from '@/account/pages/category-details/parts/category-summary';
import type { ILedgerAccountDto, TEntityId } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

const category: ILedgerAccountDto = {
  id: 'software' as TEntityId,
  accountingEntityId: 'entity' as TEntityId,
  code: '500001',
  materializedPath: '500001',
  type: 'expense',
  normalBalance: 'debit',
  subType: 'admin_and_general',
  behavior: 'admin_and_general',
  isControlAccount: false,
  name: 'Software & subscriptions',
  status: 'active',
  contraAccountRule: 'contra_permitted',
  adjunctAccountRule: 'adjunct_permitted',
  openingBalanceDate: null,
  createdBy: 'user' as TEntityId,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-06-28T00:00:00Z',
  balance: { amount: 2400000, currencyCode: 'NGN', isMinorUnit: false },
  functionalBalance: {
    amount: 2400000,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
};

it('hides loaded controls while pending or failed and reveals them on success', () => {
  const content = (
    <CategorySummary
      account={category}
      period="6"
      balance={category.functionalBalance}
      transactionCount={48}
    />
  );

  const { rerender } = render(
    <CategorySummaryWithState loading error showPeriod>
      {content}
    </CategorySummaryWithState>
  );

  expect(
    screen.getByRole('status', { name: 'Loading account summary' })
  ).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('combobox', { name: 'Period' })
  ).not.toBeInTheDocument();

  rerender(
    <CategorySummaryWithState loading={false} error showPeriod>
      {content}
    </CategorySummaryWithState>
  );
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Category details unavailable'
  );
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('combobox', { name: 'Period' })
  ).not.toBeInTheDocument();

  rerender(
    <CategorySummaryWithState loading={false} showPeriod>
      {content}
    </CategorySummaryWithState>
  );
  expect(screen.getByRole('combobox', { name: 'Period' })).toHaveTextContent(
    'Last 6 months'
  );
  expect(screen.getByText('48')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
