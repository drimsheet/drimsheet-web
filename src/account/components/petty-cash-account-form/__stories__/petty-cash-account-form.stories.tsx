import { PettyCashAccountForm } from '@/account/components/petty-cash-account-form';
import type { ICurrencyDto } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const currencies: ICurrencyDto[] = [
  {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    minorUnit: 2,
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    minorUnit: 2,
  },
];

const meta = {
  title: 'Ledger Accounts/PettyCashAccountForm',
  component: PettyCashAccountForm,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[min(42rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  args: {
    accountingCurrencyCode: 'NGN',
    currencies,
    onExchangeRateContextChange: () => {},
    onSubmit: () => {},
  },
  argTypes: {
    onExchangeRateContextChange: { action: 'exchange context changed' },
    onSubmit: { action: 'submitted' },
  },
} satisfies Meta<typeof PettyCashAccountForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ForeignCurrency: Story = {
  args: {
    initialValues: {
      name: 'Travel Cash',
      currencyCode: 'USD',
      openingBalance: 100,
      openingDate: '2026-07-01',
      exchangeRate: { value: 1500, inverted: false },
    },
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Update: Story = {
  args: {
    mode: 'update',
    hasExistingOpeningBalance: true,
    canUpdateCurrency: false,
    initialValues: {
      name: 'Office petty cash',
      currencyCode: 'NGN',
      createWithoutOpeningBalance: true,
      openingBalance: 100,
      openingDate: '2026-10-01',
    },
    onCancel: () => undefined,
  },
};

export const UpdateWithoutOpeningBalance: Story = {
  args: {
    ...Update.args,
    hasExistingOpeningBalance: false,
    canUpdateCurrency: true,
    initialValues: {
      ...Update.args?.initialValues,
      createWithoutOpeningBalance: false,
      openingBalance: '',
      openingDate: '',
    },
  },
};

export const UpdateWithCurrencyLocked: Story = {
  args: {
    ...UpdateWithoutOpeningBalance.args,
    canUpdateCurrency: false,
  },
};
