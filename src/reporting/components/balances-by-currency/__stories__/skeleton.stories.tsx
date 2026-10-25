import { BalancesByCurrencySkeleton } from '@/reporting/components/balances-by-currency';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/BalancesByCurrency/Skeleton',
  component: BalancesByCurrencySkeleton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <dl className="flex flex-wrap gap-x-10 gap-y-4">
        <Story />
      </dl>
    ),
  ],
} satisfies Meta<typeof BalancesByCurrencySkeleton>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
