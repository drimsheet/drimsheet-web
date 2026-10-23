import { IncomeCategoriesStep } from '@/onboarding/pages/accounting-entity-onboarding/parts/income-categories-step';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Onboarding/Accounting Entity/Income Categories Step',
  component: IncomeCategoriesStep,
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
} satisfies Meta<typeof IncomeCategoriesStep>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
