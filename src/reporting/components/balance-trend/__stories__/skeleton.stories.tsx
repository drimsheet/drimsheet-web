import { BalanceTrendSkeleton } from '@/reporting/components/balance-trend';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/BalanceTrend/skeleton',
  component: BalanceTrendSkeleton,
  tags: ['autodocs'],
  args: { label: 'Loading balance history' },
} satisfies Meta<typeof BalanceTrendSkeleton>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
