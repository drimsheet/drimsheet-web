import {
  ReportingIntervalSelectError,
  ReportingIntervalSelectSkeleton,
} from '@/reporting/components/reporting-interval-select';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/ReportingIntervalSelect/State',
  component: ReportingIntervalSelectSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof ReportingIntervalSelectSkeleton>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Loading: TStory = {};

export const Error: TStory = { render: () => <ReportingIntervalSelectError /> };
