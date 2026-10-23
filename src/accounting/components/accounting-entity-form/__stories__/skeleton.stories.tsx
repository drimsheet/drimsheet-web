import { AccountingEntityFormSkeleton } from '@/accounting/components/accounting-entity-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Accounting Entity Form/Skeleton',
  component: AccountingEntityFormSkeleton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-[620px] p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountingEntityFormSkeleton>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Loading: TStory = {};
