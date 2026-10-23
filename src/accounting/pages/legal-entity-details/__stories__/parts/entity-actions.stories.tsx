import { EntityActions } from '@/accounting/pages/legal-entity-details/parts/entity-actions';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Legal Entity Details/EntityActions',
  component: EntityActions,
  tags: ['autodocs'],
  args: {
    isCurrent: false,
    archived: false,
    pending: false,
    onEdit: () => {},
    onSwitch: () => {},
    onArchive: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof EntityActions>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Current: TStory = { args: { isCurrent: true } };
export const Archived: TStory = { args: { archived: true } };
export const Pending: TStory = { args: { pending: true } };
