import { SectionError } from '@/account/pages/account-details/parts/section-error';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountDetails/SectionError',
  component: SectionError,
  tags: ['autodocs'],
  args: { title: 'Money in & out' },
} satisfies Meta<typeof SectionError>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
