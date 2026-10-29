import { JournalEntryTableFilter } from '@/journal-entries/components/transactions-table/parts/filter';
import type { JournalEntryTableFilterProps } from '@/journal-entries/components/transactions-table/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const options = {
  accounts: [{ value: 'cash', label: 'Operating account' }],
  categories: [{ value: 'rent', label: 'Office rent' }],
  counterparties: [],
  currencies: [{ value: 'NGN', label: 'NGN' }],
};

function setup(props: Partial<JournalEntryTableFilterProps> = {}) {
  const onApply = vi.fn();
  render(
    <JournalEntryTableFilter
      value={{}}
      options={options}
      search=""
      onSearchChange={() => {}}
      onApply={onApply}
      {...props}
    />
  );

  return { user: userEvent.setup(), onApply };
}

describe('JournalEntryTableFilter', () => {
  beforeAll(() => {
    HTMLElement.prototype.hasPointerCapture = () => false;
    HTMLElement.prototype.setPointerCapture = () => {};

    HTMLElement.prototype.releasePointerCapture = () => {};

    HTMLElement.prototype.scrollIntoView = () => {};
  });
  it.each([
    ['Inflow', 'receipt'],
    ['Outflow', 'payment'],
    ['Transfer', 'transfer'],
  ])('applies %s only on explicit Apply', async (label, sourceType) => {
    const { user, onApply } = setup();
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('button', { name: 'Transaction type' }));
    await user.click(
      screen.getByRole('combobox', { name: 'Transaction type' })
    );
    await user.click(screen.getByRole('option', { name: label }));
    expect(onApply).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(onApply).toHaveBeenCalledWith({ sourceType });
    expect(screen.getByRole('button', { name: 'Filters' })).toHaveFocus();
  });
  it('discards cancelled changes, retains applied filters on reopening, and clears only on Apply', async () => {
    const { user, onApply } = setup({
      value: { accountId: 'cash', effectiveDateFrom: '2026-10-02' },
    });

    await user.click(screen.getByRole('button', { name: /Filters/ }));
    await user.click(screen.getByLabelText('From'));
    await user.click(
      screen.getByRole('button', { name: /Thursday, October 1st, 2026/ })
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: /Filters/ }));
    expect(screen.getByLabelText('From')).toHaveTextContent('2 Oct 2026');
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onApply).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(onApply).toHaveBeenCalledWith({});
  });
  it.each([
    ['Transaction date', 'effectiveDateFrom', 'effectiveDateTo'],
    ['Recorded date', 'recordedDateFrom', 'recordedDateTo'],
  ])(
    'applies %s through the shared calendar',
    async (label, fromKey, toKey) => {
      const { user, onApply } = setup({
        value: { [fromKey]: '2026-10-02', [toKey]: '2026-10-02' },
      });

      await user.click(screen.getByRole('button', { name: /Filters/ }));
      await user.click(screen.getByRole('button', { name: label }));
      await user.click(screen.getByLabelText('From'));
      await user.click(
        screen.getByRole('button', { name: /Thursday, October 1st, 2026/ })
      );
      expect(screen.getByLabelText('From')).toHaveFocus();
      await user.click(screen.getByLabelText('To'));
      await user.click(
        screen.getByRole('button', { name: /Saturday, October 3rd, 2026/ })
      );
      expect(onApply).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Apply filters' }));
      expect(onApply).toHaveBeenCalledWith({
        [fromKey]: '2026-10-01',
        [toKey]: '2026-10-03',
      });
    }
  );
  it('replaces the selected cash account when applying a category', async () => {
    const { user, onApply } = setup({
      value: { accountId: 'cash', currencyCode: 'NGN' },
    });

    await user.click(screen.getByRole('button', { name: /Filters/ }));
    await user.click(screen.getByRole('button', { name: 'Category' }));
    await user.click(screen.getByRole('combobox', { name: 'Category' }));
    await user.click(
      await screen.findByRole('option', { name: 'Office rent' })
    );
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(onApply).toHaveBeenCalledWith({
      accountId: undefined,
      categoryId: 'rent',
      currencyCode: 'NGN',
    });
  });
  it('blocks reversed ranges and keeps the translated error visible across fields', async () => {
    const { user, onApply } = setup({
      value: { effectiveDateFrom: '2026-10-29', effectiveDateTo: '2026-10-01' },
    });

    await user.click(screen.getByRole('button', { name: /Filters/ }));
    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The end date must be on or after the start date.'
    );
    expect(
      screen.getByRole('button', { name: 'Apply filters' })
    ).toBeDisabled();
    expect(onApply).not.toHaveBeenCalled();
  });
  it('shows the applied count without values and clears all applied filters immediately', async () => {
    const { user, onApply } = setup({
      value: {
        sourceType: 'payment',
        currencyCode: 'NGN',
        effectiveDateFrom: '2026-10-01',
        effectiveDateTo: '2026-10-29',
      },
    });

    expect(screen.getByRole('button', { name: /Filters\s*3/ })).toHaveAttribute(
      'data-variant',
      'secondary'
    );
    expect(screen.queryByText(/NGN|Outflow|2026-10/)).not.toBeInTheDocument();
    const clearButton = screen.getByRole('button', { name: 'Clear filters' });
    expect(clearButton).toHaveAttribute('data-variant', 'ghost');
    await user.click(clearButton);
    expect(onApply).toHaveBeenCalledWith({});
  });
  it('shows an outline filter button without a badge or clear action when no filters are applied', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Filters' })).toHaveAttribute(
      'data-variant',
      'outline'
    );
    expect(
      screen.queryByRole('button', { name: 'Clear filters' })
    ).not.toBeInTheDocument();
  });
});
