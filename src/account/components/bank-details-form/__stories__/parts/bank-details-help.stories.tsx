import { BankDetailsHelp } from '@/account/components/bank-details-form/parts/bank-details-help';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/BankDetailsHelp',
  component: BankDetailsHelp,
  tags: ['autodocs'],
  args: {
    triggerLabel: 'Why are we asking for this?',
    description:
      'We collect these details to ensure accurate reconciliation and smooth transaction tracking with your financial institution.',
  },
} satisfies Meta<typeof BankDetailsHelp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
