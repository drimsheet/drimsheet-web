import { PettyCashAccountFormSkeleton } from '@/account/components/petty-cash-account-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/PettyCashAccountForm/Skeleton',
  component: PettyCashAccountFormSkeleton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[min(42rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PettyCashAccountFormSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Loading: Story = {};
