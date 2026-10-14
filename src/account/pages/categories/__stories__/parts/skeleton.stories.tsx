import { CategoriesSkeleton } from '@/account/pages/categories/parts/skeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Categories/Skeleton',
  component: CategoriesSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof CategoriesSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
