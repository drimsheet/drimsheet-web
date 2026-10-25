import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

import { LedgerAccountsTable } from '@/account/components/ledger-accounts-table';
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
    name: 'Main Bank Vault Cash',
    type: ELedgerType.Asset,
    normalBalance: 'debit' as UNormalBalance,
    subType: 'cash_and_cash_equivalent',
    behavior: 'petty_cash',
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
    name: 'Trade Payables Control',
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
    name: 'SaaS Subscription Revenue',
    type: ELedgerType.Revenue,
    normalBalance: 'credit' as UNormalBalance,
    subType: 'subscriptions',
    behavior: 'subscriptions',
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
  {
    id: '5' as TEntityId,
    code: '3000',
    name: 'Retained Earnings - Archived',
    type: ELedgerType.Equity,
    normalBalance: 'credit' as UNormalBalance,
    subType: 'retained_earnings',
    behavior: 'retained_earnings',
    isControlAccount: false,
    status: ELedgerAccountStatus.Archived,
    contraAccountRule: 'contra_not_applicable' as UContraAccountRule,
    adjunctAccountRule: 'adjunct_not_applicable' as UAdjunctAccountRule,
    balance: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
    functionalBalance: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-05-20T10:00:00Z',
    createdBy: 'user-1' as TEntityId,
    materializedPath: '',
    accountingEntityId: 'entity-1' as TEntityId,
    openingBalanceDate: null,
  },
];

const meta = {
  title: 'Ledger Accounts/LedgerAccountsTable',
  component: LedgerAccountsTable,
  tags: ['autodocs'],
  args: {
    onSortChange: (key, direction) =>
      console.log('Sort changed:', key, direction),
    onFilterChange: (filters) => console.log('Filter changed:', filters),
    onAddAccount: () => console.log('Add account clicked'),
    onSearchChange: (value) => console.log('Search changed:', value),
    filters: {},
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-full max-w-5xl p-6 bg-background rounded-2xl border border-border/80 shadow-xs">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof LedgerAccountsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: mockAccounts,
    selectable: true,
    stickyHeader: true,
    searchValue: '',
    onSearchChange: (value) => console.log('Search changed:', value),
  },
};

export const LoadingState: Story = {
  args: {
    data: [],
    loading: true,
  },
};

export const EmptyState: Story = {
  args: {
    data: [],
    loading: false,
  },
};
