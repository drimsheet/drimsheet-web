import { CategoryHelp } from '@/account/pages/categories/parts/category-help';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/Categories/Help',
  component: CategoryHelp,
  tags: ['autodocs'],
  args: {
    label: 'About category balances and counts',
    children: (
      <p>Current accumulated balances, independent of the reporting month.</p>
    ),
  },
} satisfies Meta<typeof CategoryHelp>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
