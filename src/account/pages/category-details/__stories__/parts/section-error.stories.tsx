import { CategoryDetailsError } from '@/account/pages/category-details/parts/section-error';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

const meta = {
  title: 'Account/Category details/Error',
  component: CategoryDetailsError,
  tags: ['autodocs'],
  args: { onRetry: fn() },
} satisfies Meta<typeof CategoryDetailsError>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
