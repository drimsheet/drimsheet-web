import { EntityDetailsSkeleton } from '@/accounting/pages/legal-entity-details/parts/skeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Legal Entity Details/EntityDetailsSkeleton',
  component: EntityDetailsSkeleton,
  tags: ['autodocs'],
  args: {},
} satisfies Meta<typeof EntityDetailsSkeleton>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
