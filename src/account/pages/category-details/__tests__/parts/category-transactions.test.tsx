import {
  CategoryTransactions,
  CategoryTransactionsWithState,
} from '@/account/pages/category-details/parts/category-transactions';
import type { ICategoryTransaction } from '@/account/pages/category-details/types';
import type { IJournalEntryListDto, TEntityId } from '@/shared/lib/api/Api';
import { render as baseRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const render = (ui: import('react').ReactNode) =>
  baseRender(ui, { wrapper: MemoryRouter });

const transactions: ICategoryTransaction[] = Array.from(
  { length: 11 },
  (_, i) => ({
    id: `${i}`,
    effectiveDate: `2026-10-${String(i + 1).padStart(2, '0')}`,
    description: `Subscription ${i}`,
    counterparties: [{ id: 'google', name: 'Google' }],
    amount: { amount: 1000, currencyCode: 'NGN', isMinorUnit: false },
    status: 'posted',
  })
);

const entries: IJournalEntryListDto[] = transactions.map((row) => ({
  id: row.id,
  accountingEntityId: 'entity',
  sourceType: 'expense',
  status: 'posted',
  memo: row.description,
  effectiveDate: row.effectiveDate,
  postedAt: row.effectiveDate,
  voidedAt: null,
  voidingEntryId: null,
  createdBy: 'user' as TEntityId,
  createdAt: row.effectiveDate,
  updatedAt: row.effectiveDate,
  attachments: [],
  lines: [],
}));

describe('CategoryTransactions', () => {
  it('shows a view-all link only when more than ten entries exist, without search or pagination', () => {
    const { rerender } = render(
      <CategoryTransactions
        entries={entries.slice(0, 10)}
        total={11}
        selectedCounterparty={null}
        onClearCounterparty={() => {}}
        transactionsHref="/transactions/list"
      />
    );

    expect(
      screen.getByRole('link', { name: 'View all transactions' })
    ).toHaveAttribute('href', '/transactions/list');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Next page' })
    ).not.toBeInTheDocument();
    rerender(
      <CategoryTransactions
        entries={entries.slice(0, 10)}
        total={10}
        selectedCounterparty={null}
        onClearCounterparty={() => {}}
        transactionsHref="/transactions/list"
      />
    );
    expect(
      screen.queryByRole('link', { name: 'View all transactions' })
    ).not.toBeInTheDocument();
  });

  it('emits a clear-filter request without changing the data itself', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <CategoryTransactions
        total={11}
        entries={entries}
        selectedCounterparty="Google"
        onClearCounterparty={onClear}
      />
    );
    await user.click(
      screen.getByRole('button', { name: 'Clear filter: Google' })
    );
    expect(onClear).toHaveBeenCalledOnce();
  });
});

it('hides transaction rows until loading and error states are cleared', () => {
  const content = (
    <CategoryTransactions
      entries={entries}
      total={11}
      selectedCounterparty={null}
      onClearCounterparty={() => {}}
      transactionsHref="/transactions/list"
    />
  );

  const { rerender } = render(
    <CategoryTransactionsWithState loading error>
      {content}
    </CategoryTransactionsWithState>
  );

  expect(screen.getByText('Loading transactions')).toBeInTheDocument();
  expect(screen.queryByText('Subscription 0')).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();

  rerender(
    <CategoryTransactionsWithState loading={false} error>
      {content}
    </CategoryTransactionsWithState>
  );
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Category details unavailable'
  );
  expect(screen.queryByText('Loading transactions')).not.toBeInTheDocument();
  expect(screen.queryByText('Subscription 0')).not.toBeInTheDocument();

  rerender(
    <CategoryTransactionsWithState loading={false}>
      {content}
    </CategoryTransactionsWithState>
  );
  expect(screen.getByText('Subscription 0')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
