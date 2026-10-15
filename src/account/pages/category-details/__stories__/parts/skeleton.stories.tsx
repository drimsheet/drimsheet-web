import { CategoryActivitySkeleton } from '@/account/pages/category-details/parts/skeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Account/Category details/Loading',
  component: CategoryActivitySkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof CategoryActivitySkeleton>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
