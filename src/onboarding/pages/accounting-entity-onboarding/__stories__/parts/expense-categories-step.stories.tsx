import { ExpenseCategoriesStep } from '@/onboarding/pages/accounting-entity-onboarding/parts/expense-categories-step';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Onboarding/Accounting Entity/Expense Categories Step',
  component: ExpenseCategoriesStep,
  tags: ['autodocs'],
  args: {
    onBack: () => {},
  },
  decorators: [
    (Story) => (
      <div className="flex h-dvh flex-col overflow-y-auto pt-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExpenseCategoriesStep>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
