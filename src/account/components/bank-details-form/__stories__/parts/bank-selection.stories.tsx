import {
  BankSelection,
  BankSelectionSkeleton,
} from '@/account/components/bank-details-form/parts/bank-selection';
import type { IBankDirectoryDto } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const mockLocations = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'US', name: 'United States' },
];

const mockBanks: IBankDirectoryDto[] = [
  { countryCode: 'NG', bankCode: 'GTB', bankName: 'Guaranty Trust Bank' },
  { countryCode: 'NG', bankCode: 'ACCESS', bankName: 'Access Bank' },
  { countryCode: 'NG', bankCode: 'ZENITH', bankName: 'Zenith Bank' },
];

const meta = {
  title: 'Ledger Accounts/BankSelection',
  component: BankSelection,
  tags: ['autodocs'],
  args: {
    bankLocation: 'NG',
    bankName: '',
    bankLocations: mockLocations,
    banks: mockBanks,
    isBanksLoading: false,
    disabled: false,
    onLocationChange: () => {},
    onBankNameChange: () => {},
  },
} satisfies Meta<typeof BankSelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    bankName: 'Access Bank',
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

export const Skeleton: Story = {
  render: () => <BankSelectionSkeleton />,
};
