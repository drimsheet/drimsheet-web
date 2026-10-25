import { BalanceTrendError } from '@/reporting/components/balance-trend';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/BalanceTrend/error',
  component: BalanceTrendError,
  tags: ['autodocs'],
  args: {
    title: 'Couldn’t load balance history',
    description: 'Refresh the page to try again.',
  },
} satisfies Meta<typeof BalanceTrendError>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
