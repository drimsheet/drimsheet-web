import { AccountActions } from '@/account/pages/account-details/parts/account-actions';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Ledger Accounts/AccountActions',
  component: AccountActions,
  tags: ['autodocs'],
  args: {
    onArchive: async () => undefined,
    onDelete: () => undefined,
    onEdit: () => undefined,
  },
} satisfies Meta<typeof AccountActions>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};
export const ArchivedOrHeader: TStory = { args: { archiveDisabled: true } };
export const Archiving: TStory = { args: { loading: true } };
export const ControlAccount: TStory = { args: { isControlAccount: true } };
export const Deletable: TStory = { args: { deletable: true } };
export const CheckingDeletion: TStory = {
  args: { deleteEligibilityChecking: true },
};
export const DeletionCheckFailed: TStory = {
  args: { deleteEligibilityFailed: true },
};
