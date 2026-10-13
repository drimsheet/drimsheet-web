import { OpeningBalanceFields } from '@/account/components/opening-balance-fields';
import type { IExchangeRate } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/OpeningBalanceFields',
  component: OpeningBalanceFields,
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
    currencyCode: 'NGN',
    createWithoutOpeningBalance: false,
    openingBalance: '',
    openingDate: '',
    exchangeRate: null,
    onCreateWithoutOpeningBalanceChange: () => {},
    onOpeningBalanceChange: () => {},
    onOpeningDateChange: () => {},
    onExchangeRateChange: () => {},
  },
  argTypes: {
    onCreateWithoutOpeningBalanceChange: { action: 'opening toggled' },
    onOpeningBalanceChange: { action: 'balance changed' },
    onOpeningDateChange: { action: 'date changed' },
    onExchangeRateChange: { action: 'exchange rate changed' },
  },
} satisfies Meta<typeof OpeningBalanceFields>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ForeignCurrency: Story = {
  args: {
    currencyCode: 'USD',
    openingBalance: 1,
    openingDate: '2026-07-01',
    exchangeRate: { value: 1500, inverted: false },
  },
};

export const ForeignCurrencyWithOfficialRate: Story = {
  args: {
    currencyCode: 'USD',
    openingBalance: 1,
    openingDate: '2026-07-01',
    officialExchangeRate: {
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      rate: 1500,
      asOf: '2026-07-01T00:00:00.000Z',
    } as IExchangeRate,
  },
};

export const WithoutOpeningBalance: Story = {
  args: {
    createWithoutOpeningBalance: true,
  },
};

export const Invalid: Story = {
  args: {
    currencyCode: 'USD',
    openingBalanceError: [{ message: 'Opening balance is required' }],
    openingDateError: [{ message: 'Opening date is required' }],
    exchangeRateError: [{ message: 'Exchange rate is required' }],
  },
};

export const LockedOpeningBalance: Story = {
  args: {
    showSkipOpeningBalance: false,
    disabled: true,
    createWithoutOpeningBalance: true,
    openingBalance: 100,
    openingDate: '2026-10-01',
  },
};
