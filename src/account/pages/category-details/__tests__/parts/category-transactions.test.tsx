import { CategoryTransactions } from '@/account/pages/category-details/parts/category-transactions';
import type { IJournalEntryListDto } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';

const entries: IJournalEntryListDto[] = Array.from(
  { length: 10 },
  (_, index) => ({
    id: String(index),
    accountingEntityId: 'entity',
    sourceType: 'expense',
    status: 'posted',
    memo: `Subscription ${index}`,
    effectiveDate: '2026-10-15',
    postedAt: '2026-10-15',
    voidedAt: null,
    voidingEntryId: null,
    createdBy: 'user',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
    attachments: [],
    lines: [],
  })
);

it('shows the view-all link only when the total exceeds the ten-entry preview', () => {
  const props = {
    entries,
    selectedCounterparty: null,
    onClearCounterparty: () => {},
    transactionsHref: '/transactions/list',
  };

  const { rerender } = render(<CategoryTransactions {...props} total={10} />, {
    wrapper: MemoryRouter,
  });

  expect(
    screen.queryByRole('link', { name: 'View all transactions' })
  ).not.toBeInTheDocument();

  rerender(<CategoryTransactions {...props} total={11} />);

  expect(
    screen.getByRole('link', { name: 'View all transactions' })
  ).toBeInTheDocument();
});
