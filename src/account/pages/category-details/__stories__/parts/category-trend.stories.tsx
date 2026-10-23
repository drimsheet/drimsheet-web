import {
  CategoryTrend,
  CategoryTrendSkeleton,
} from '@/account/pages/category-details/parts/category-trend';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Account/Category details/Trend',
  component: CategoryTrend,
  tags: ['autodocs'],
  args: {
    type: 'expense',
    currencyCode: 'NGN',
    months: [240000, 320000, 280000, 400000, 520000, 640000].map(
      (amount, i) => ({ month: `2026-0${i + 1}`, amount })
    ),
  },
} satisfies Meta<typeof CategoryTrend>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Revenue: TStory = { args: { type: 'revenue' } };
export const Empty: TStory = { args: { months: [] } };
export const Refunds: TStory = {
  args: {
    months: [
      { month: '2026-05', amount: -200000 },
      { month: '2026-06', amount: 400000 },
    ],
  },
};

export const Skeleton: TStory = { render: () => <CategoryTrendSkeleton /> };
