import { CategoryActions } from '@/account/pages/category-details/parts/category-actions';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Account/Category details/Actions',
  component: CategoryActions,
  tags: ['autodocs'],
  args: {
    accountName: 'Software & subscriptions',
    onEdit: () => undefined,
    onArchive: async () => undefined,
  },
} satisfies Meta<typeof CategoryActions>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Archived: TStory = {
  args: { editDisabled: true, archiveDisabled: true },
};
export const Archiving: TStory = { args: { loading: true } };
