import { BankDetailsFormSkeleton } from '@/account/components/bank-details-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/BankDetailsForm/Skeleton',
  component: BankDetailsFormSkeleton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[min(42rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BankDetailsFormSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Loading: Story = {};
export const Update: Story = {
  args: { mode: 'update', showCancel: true, showSkipOpeningBalance: false },
};
export const UpdateWithForeignOpeningBalance: Story = {
  args: { mode: 'update', showCancel: true, showExchangeRate: true },
};
