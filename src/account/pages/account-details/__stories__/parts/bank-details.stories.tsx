import { BankDetails } from '@/account/pages/account-details/parts/bank-details';
import type { IBankDetails } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const bankDetails: IBankDetails = {
  bankName: 'Example Bank',
  accountName: 'Acme Studio Ltd',
  accountNumber: '0123456789',
  countryCode: 'NG',
};

const meta = {
  title: 'Ledger Accounts/BankDetails',
  component: BankDetails,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { bankDetails },
  decorators: [
    (Story) => (
      <div className="max-w-3xl bg-background p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BankDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-72">
        <Story />
      </div>
    ),
  ],
};

export const LongDetails: Story = {
  args: {
    bankDetails: {
      bankName: 'International Commercial and Development Bank',
      accountName: 'Acme Studio International Operations and Consulting Ltd',
      accountNumber: '0012345678901234567890',
      countryCode: 'GB',
    },
  },
};
