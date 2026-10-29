import type { ILedgerAccountDto, TEntityId } from '@/shared/lib/api/Api';

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

import { SubAccounts } from '@/account/pages/account-details/parts/sub-accounts';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('SubAccounts', () => {
  it('omits the section when there are no children', () => {
    render(<SubAccounts accounts={[]} onOpenAccount={vi.fn()} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
  it('shows each account currency and requests navigation to the chosen account', async () => {
    const onOpenAccount = vi.fn();
    render(<SubAccounts accounts={[account]} onOpenAccount={onOpenAccount} />);
    expect(screen.getByText(/NGN\s*2,450,000/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: account.name }));
    expect(onOpenAccount).toHaveBeenCalledWith(account.id);
  });
});
