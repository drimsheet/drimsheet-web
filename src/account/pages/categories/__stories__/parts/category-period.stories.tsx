import { CategoryPeriod } from '@/account/pages/categories/parts/category-period';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Categories/Period',
  component: CategoryPeriod,
  tags: ['autodocs'],
  args: {
    period: '2026-10',
    periods: [
      { value: '2026-10', label: 'October 2026' },
      { value: '2026-09', label: 'September 2026' },
    ],
    onPeriodChange: () => {},
  },
} satisfies Meta<typeof CategoryPeriod>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
