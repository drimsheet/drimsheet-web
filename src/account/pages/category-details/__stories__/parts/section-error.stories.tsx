import { CategoryDetailsError } from '@/account/pages/category-details/parts/section-error';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Account/Category details/Error',
  component: CategoryDetailsError,
  tags: ['autodocs'],
  args: {},
} satisfies Meta<typeof CategoryDetailsError>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
