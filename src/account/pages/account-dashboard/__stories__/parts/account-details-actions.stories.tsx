import { AccountDetailsActions } from '@/account/pages/account-dashboard/parts/account-details-actions';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

const meta = {
  title: 'Ledger Accounts/Accounts dashboard/AccountDetailsActions',
  component: AccountDetailsActions,
  tags: ['autodocs'],
  args: {
    account: {
      id: 'bank',
      name: 'Operating account',
      behavior: 'bank',
      status: 'active',
      balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: true },
    },
    canDelete: true,
    onOpenChange: fn(),
    onEdit: fn(),
    onArchive: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof AccountDetailsActions>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Checking: TStory = { args: { checking: true } };
export const Ineligible: TStory = { args: { canDelete: false } };
export const Failed: TStory = { args: { eligibilityFailed: true } };
