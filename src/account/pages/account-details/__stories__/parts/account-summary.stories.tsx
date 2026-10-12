import { LedgerAccountSummary } from '@/account/pages/account-details/parts/account-summary';
import type { ILedgerAccountDto, TEntityId } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

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
  balance: { amount: 2450000, currencyCode: 'NGN', isMinorUnit: false },
  functionalBalance: {
    amount: 2450000,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
};

const meta = {
  title: 'Ledger Accounts/LedgerAccountSummary',
  component: LedgerAccountSummary,
  parameters: {
    layout: 'fullscreen',
  },
  args: { account },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl p-6 sm:p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LedgerAccountSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ForeignCurrency: Story = {
  args: {
    account: {
      ...account,
      name: 'US dollar account',
      balance: { amount: 150000, currencyCode: 'USD', isMinorUnit: true },
    },
  },
};

export const PettyCash: Story = {
  args: {
    account: {
      ...account,
      behavior: 'petty_cash',
      name: 'Office petty cash',
      balance: { amount: 85000, currencyCode: 'NGN', isMinorUnit: false },
      functionalBalance: {
        amount: 85000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
    },
  },
};

export const Archived: Story = {
  args: { account: { ...account, status: 'archived' } },
};

export const DraftWithZeroBalance: Story = {
  args: {
    account: {
      ...account,
      status: 'draft',
      balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
      functionalBalance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
    },
  },
};

export const NarrowWithLongName: Story = {
  args: {
    account: {
      ...account,
      name: 'International operations and regional supplier payments account',
      balance: { amount: -150000, currencyCode: 'USD', isMinorUnit: true },
      functionalBalance: {
        amount: -2450000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-72">
        <Story />
      </div>
    ),
  ],
};
