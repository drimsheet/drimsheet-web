import { TotalBalance } from '@/reporting/components/total-balance';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/TotalBalance',
  component: TotalBalance,
  tags: ['autodocs'],
  args: {
    isConverted: true,
    label: 'Total balance',
    balanceLabel: 'Approximate balance in functional currency',
    balance: { amount: 87450000, currencyCode: 'NGN', isMinorUnit: false },
  },
} satisfies Meta<typeof TotalBalance>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
