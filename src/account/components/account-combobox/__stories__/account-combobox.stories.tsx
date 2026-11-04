import type { Meta, StoryObj } from '@storybook/react-vite';

import { AccountCombobox } from '@/account/components/account-combobox';
import {
  ELedgerAccountStatus,
  ELedgerType,
  type ILedgerAccountDto,
  type TEntityId,
  type UAdjunctAccountRule,
  type UContraAccountRule,
  type UNormalBalance,
} from '@/shared/lib/api/Api';

const mockAccounts: ILedgerAccountDto[] = [
  {
    id: '1' as TEntityId,
    code: '1000',
    name: 'Main Bank Account',
    type: ELedgerType.Asset,
    normalBalance: 'debit' as UNormalBalance,
    subType: 'cash_and_cash_equivalent',
    behavior: 'bank',
    isControlAccount: true,
    status: ELedgerAccountStatus.Active,
    contraAccountRule: 'contra_not_applicable' as UContraAccountRule,
    adjunctAccountRule: 'adjunct_not_applicable' as UAdjunctAccountRule,
    balance: { amount: 1500000, currencyCode: 'NGN', isMinorUnit: false },
    functionalBalance: {
      amount: 1500000,
      currencyCode: 'NGN',
      isMinorUnit: false,
    },
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z',
    createdBy: 'user-1' as TEntityId,
    materializedPath: '',
    accountingEntityId: 'entity-1' as TEntityId,
    openingBalanceDate: null,
  },
  {
    id: '2' as TEntityId,
    code: '2100',
    name: 'Trade Payables',
    type: ELedgerType.Liability,
    normalBalance: 'credit' as UNormalBalance,
    subType: 'payable',
    behavior: 'trade_payable',
    isControlAccount: true,
    status: ELedgerAccountStatus.Active,
    contraAccountRule: 'contra_not_applicable' as UContraAccountRule,
    adjunctAccountRule: 'adjunct_not_applicable' as UAdjunctAccountRule,
    balance: { amount: 4800, currencyCode: 'USD', isMinorUnit: false },
    functionalBalance: {
      amount: 4800,
      currencyCode: 'USD',
      isMinorUnit: false,
    },
    createdAt: '2026-05-10T12:30:00Z',
    updatedAt: '2026-05-10T12:30:00Z',
    createdBy: 'user-1' as TEntityId,
    materializedPath: '',
    accountingEntityId: 'entity-1' as TEntityId,
    openingBalanceDate: null,
  },
  {
    id: '3' as TEntityId,
    code: '4000',
    name: 'Consulting Revenue',
    type: ELedgerType.Revenue,
    normalBalance: 'credit' as UNormalBalance,
    subType: 'services',
    behavior: 'services',
    isControlAccount: false,
    status: ELedgerAccountStatus.Active,
    contraAccountRule: 'contra_not_applicable' as UContraAccountRule,
    adjunctAccountRule: 'adjunct_not_applicable' as UAdjunctAccountRule,
    balance: { amount: 95400, currencyCode: 'USD', isMinorUnit: false },
    functionalBalance: {
      amount: 95400,
      currencyCode: 'USD',
      isMinorUnit: false,
    },
    createdAt: '2026-05-15T09:15:00Z',
    updatedAt: '2026-05-15T09:15:00Z',
    createdBy: 'user-1' as TEntityId,
    materializedPath: '',
    accountingEntityId: 'entity-1' as TEntityId,
    openingBalanceDate: null,
  },
  {
    id: '4' as TEntityId,
    code: '5100',
    name: 'Office Rent and Utilities',
    type: ELedgerType.Expense,
    normalBalance: 'debit' as UNormalBalance,
    subType: 'rent_and_utilities',
    behavior: 'rent_and_utilities',
    isControlAccount: false,
    status: ELedgerAccountStatus.Active,
    contraAccountRule: 'contra_not_applicable' as UContraAccountRule,
    adjunctAccountRule: 'adjunct_not_applicable' as UAdjunctAccountRule,
    balance: { amount: 3200, currencyCode: 'GBP', isMinorUnit: false },
    functionalBalance: {
      amount: 3200,
      currencyCode: 'GBP',
      isMinorUnit: false,
    },
    createdAt: '2026-05-18T16:45:00Z',
    updatedAt: '2026-05-18T16:45:00Z',
    createdBy: 'user-1' as TEntityId,
    materializedPath: '',
    accountingEntityId: 'entity-1' as TEntityId,
    openingBalanceDate: null,
  },
];

const meta = {
  title: 'Ledger Accounts/AccountCombobox',
  component: AccountCombobox,
  tags: ['autodocs'],
  args: { onAddAccount: () => undefined },
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Account',
    value: '',
    accounts: mockAccounts,
    onChange: (value) => console.log('Account changed:', value),
  },
};

export const Selected: Story = {
  args: {
    label: 'Account',
    value: '1',
    accounts: mockAccounts,
    onChange: (value) => console.log('Account changed:', value),
  },
};

export const WithError: Story = {
  args: {
    label: 'Account',
    value: '',
    accounts: mockAccounts,
    onChange: (value) => console.log('Account changed:', value),
    error: [{ message: 'Account is required' }],
  },
};

export const Empty: Story = {
  args: {
    label: 'Account',
    value: '',
    accounts: [],
    onChange: () => undefined,
  },
};
