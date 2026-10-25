import { BalancesByCurrency } from '@/reporting/components/balances-by-currency';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/BalancesByCurrency',
  component: BalancesByCurrency,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <dl className="flex flex-wrap gap-x-10 gap-y-4">
        <Story />
      </dl>
    ),
  ],
  args: {
    balances: [
      { amount: 71250000, currencyCode: 'NGN', isMinorUnit: false },
      { amount: 8200, currencyCode: 'USD', isMinorUnit: false },
    ],
  },
} satisfies Meta<typeof BalancesByCurrency>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
