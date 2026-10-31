import { AccountOverview } from '@/account/components/account-overview';
import {
  EAdjunctAccountRule,
  EAssetSubType,
  EContraAccountRule,
  ELedgerAccountStatus,
  ELedgerType,
  ENormalBalance,
  type ILedgerAccountDto,
  type TEntityId,
} from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const baseAccount: ILedgerAccountDto = {
  id: 'account-1' as TEntityId,
  code: '1000',
  materializedPath: '',
  accountingEntityId: 'entity-1' as TEntityId,
  openingBalanceDate: null,
  type: ELedgerType.Asset,
  normalBalance: ENormalBalance.Debit,
  subType: EAssetSubType.CashAndCashEquivalent,
  behavior: 'bank',
  isControlAccount: true,
  name: 'Account name',
  status: ELedgerAccountStatus.Active,
  contraAccountRule: EContraAccountRule.ContraNotApplicable,
  adjunctAccountRule: EAdjunctAccountRule.AdjunctNotApplicable,
  createdBy: 'user-1' as TEntityId,
  createdAt: '2026-06-03T08:00:00Z',
  updatedAt: '2026-06-03T08:00:00Z',
  balance: { amount: 4000, currencyCode: 'USD', isMinorUnit: false },
  functionalBalance: {
    amount: 345000,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
};

const meta = {
  title: 'Ledger Accounts/AccountOverview',
  component: AccountOverview,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="box-border w-full overflow-hidden bg-background p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    account: baseAccount,
    actionButtonText: 'Add transaction',
    onActionButtonClick: () => console.log('Add transaction clicked'),
    onSettingsClick: () => console.log('Account settings clicked'),
  },
};

export const SameFunctionalCurrency: Story = {
  args: {
    account: {
      ...baseAccount,
      name: 'Main Bank Account',
      balance: { amount: 4000, currencyCode: 'USD', isMinorUnit: false },
      functionalBalance: {
        amount: 4000,
        currencyCode: 'USD',
        isMinorUnit: false,
      },
    },
    actionButtonText: 'Add transaction',
  },
};

export const WithoutIcon: Story = {
  args: {
    account: baseAccount,
    actionButtonText: 'Add transaction',
    hideIcon: true,
  },
};

export const LongAccountName: Story = {
  args: {
    account: {
      ...baseAccount,
      name: 'International Operations Petty Cash Account',
      balance: { amount: 1250000, currencyCode: 'GBP', isMinorUnit: true },
      functionalBalance: {
        amount: 2480000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
    },
    actionButtonText: 'Add transaction',
  },
};
