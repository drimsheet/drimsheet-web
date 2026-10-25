import { TotalBalanceSkeleton } from '@/reporting/components/total-balance';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Reporting/TotalBalance/Skeleton',
  component: TotalBalanceSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof TotalBalanceSkeleton>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
