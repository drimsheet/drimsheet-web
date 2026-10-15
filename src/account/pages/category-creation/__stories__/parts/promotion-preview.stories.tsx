import { PromotionPreview } from '@/account/pages/category-creation/parts/promotion-preview';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Category Creation/Promotion Preview',
  component: PromotionPreview,
  tags: ['autodocs'],
  args: {
    parentName: 'Utilities',
    postingAccountName: 'General utilities',
    categoryName: 'Internet',
  },
} satisfies Meta<typeof PromotionPreview>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = {};
export const EmptyNames: Story = {
  args: { postingAccountName: '', categoryName: '' },
};
