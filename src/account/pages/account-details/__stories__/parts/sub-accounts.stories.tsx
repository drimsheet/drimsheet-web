import { SubAccountsSkeleton } from '@/account/pages/account-details/parts/sub-accounts';
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
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountDetails/SubAccounts',
  component: SubAccounts,
  tags: ['autodocs'],
  args: {
    accounts: [
      { ...account, name: 'Payroll account' },
      {
        ...account,
        id: 'account-2' as typeof account.id,
        name: 'Tax account',
        status: 'archived',
      },
    ],
    onOpenAccount: () => {},
  },
} satisfies Meta<typeof SubAccounts>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { accounts: [] } };

export const Skeleton: Story = { render: () => <SubAccountsSkeleton /> };
