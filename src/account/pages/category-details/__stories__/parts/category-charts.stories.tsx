import {
  CategoryCharts,
  CategoryChartsSkeleton,
} from '@/account/pages/category-details/parts/category-charts';
import { CategoryTrendSkeleton } from '@/account/pages/category-details/parts/category-trend';
import { CounterpartyShareSkeleton } from '@/account/pages/category-details/parts/counterparty-share';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Account/Category details/Charts',
  component: CategoryCharts,
  tags: ['autodocs'],
  args: {
    children: (
      <>
        <CategoryTrendSkeleton />
        <CounterpartyShareSkeleton />
      </>
    ),
  },
} satisfies Meta<typeof CategoryCharts>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Loading: TStory = { render: () => <CategoryChartsSkeleton /> };
