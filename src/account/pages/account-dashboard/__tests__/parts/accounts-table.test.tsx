import { AccountsTable } from '@/account/pages/account-dashboard/parts/accounts-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('AccountsTable', () => {
  it('shows cash-account filters and emits the selected behavior', async () => {
    const onTypeChange = vi.fn();

    render(
      <AccountsTable
        accounts={{
          data: [
            {
              id: 'operating',
              name: 'Operating account',
              behavior: 'bank',
              balance: {
                amount: 820000,
                currencyCode: 'USD',
                isMinorUnit: true,
              },
              status: 'active',
            },
          ],
          meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
        }}
        loading={false}
        error={false}
        search=""
        type="all"
        onSearchChange={() => {}}
        onTypeChange={onTypeChange}
        onPageChange={() => {}}
        onAddAccount={() => {}}
        onViewAccount={() => {}}
      />
    );

    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tab', { name: 'All' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Bank' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Petty Cash' })).toBeVisible();
    expect(screen.queryByRole('tab', { name: /liabilit/i })).toBeNull();
    expect(screen.getByText('$8,200')).toBeVisible();
    expect(screen.getByText('Active')).toHaveClass('bg-lozenge-success');

    await userEvent.click(screen.getByRole('tab', { name: 'Petty Cash' }));

    expect(onTypeChange).toHaveBeenCalledWith('petty_cash');
  });
});
