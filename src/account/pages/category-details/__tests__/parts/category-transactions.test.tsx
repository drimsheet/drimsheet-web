import { CategoryTransactions } from '@/account/pages/category-details/parts/category-transactions';
import type { ICategoryTransaction } from '@/account/pages/category-details/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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

describe('CategoryTransactions', () => {
  it('paginates, searches beyond the visible page, and resets pagination after search', async () => {
    const user = userEvent.setup();
    render(
      <CategoryTransactions
        transactions={transactions}
        selectedCounterparty={null}
        onClearCounterparty={() => {}}
      />
    );
    expect(
      screen.queryByText('Subscription 0', { exact: true })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /^2$/ }));
    expect(
      screen.getByText('Subscription 0', { exact: true })
    ).toBeInTheDocument();
    await user.type(
      screen.getByRole('textbox', { name: 'Search transactions…' }),
      'Subscription 10'
    );
    expect(
      screen.getByText('Subscription 10', { exact: true })
    ).toBeInTheDocument();
    expect(screen.getByText('1 transaction')).toBeInTheDocument();
  });

  it('emits a clear-filter request without changing the data itself', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <CategoryTransactions
        transactions={transactions}
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
