import { BankDetailsForm } from '@/account/components/bank-details-form';
import type { IBankDirectoryDto, ICurrencyDto } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const mockCurrencies: ICurrencyDto[] = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
  { code: 'USD', name: 'US Dollar', symbol: '$', minorUnit: 2 },
];

const mockBankLocations = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'US', name: 'United States' },
];

const mockBanks: IBankDirectoryDto[] = [
  { countryCode: 'NG', bankCode: 'GTB', bankName: 'Guaranty Trust Bank' },
  { countryCode: 'NG', bankCode: 'ACCESS', bankName: 'Access Bank' },
];

const meta = {
  title: 'Ledger Accounts/BankDetailsForm',
  component: BankDetailsForm,
  tags: ['autodocs'],
  args: {
    accountingCurrencyCode: 'NGN',
    currencies: mockCurrencies,
    bankLocations: mockBankLocations,
    banks: mockBanks,
    isBanksLoading: false,
    onBankLocationChange: () => {},
    onExchangeRateContextChange: () => {},
    onSubmit: () => {},
  },
} satisfies Meta<typeof BankDetailsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialValues: {
      currencyCode: 'NGN',
      bankLocation: 'NG',
    },
  },
};

export const ForeignCurrency: Story = {
  args: {
    initialValues: {
      currencyCode: 'USD',
      bankLocation: 'US',
    },
  },
};

export const LoadingBanks: Story = {
  args: {
    isBanksLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
