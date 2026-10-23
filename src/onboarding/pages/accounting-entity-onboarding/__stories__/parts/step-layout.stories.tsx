import { StepLayout } from '@/onboarding/pages/accounting-entity-onboarding/parts/step-layout';
import { Button } from '@/shared/components/button';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Onboarding/Accounting Entity/Step Layout',
  component: StepLayout,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex h-[500px] flex-col overflow-y-auto pt-6">
        <Story />
      </div>
    ),
  ],
  args: {
    titleId: 'step-title',
    children: (
      <div className="flex flex-col gap-6">
        <h1 id="step-title" className="m-0 text-2xl font-semibold">
          Set up your reports
        </h1>
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index}>Reporting period {index + 1}</p>
        ))}
      </div>
    ),
    actions: (
      <>
        <Button type="button" variant="outline">
          Back
        </Button>
        <Button type="button">Continue to income categories</Button>
      </>
    ),
  },
} satisfies Meta<typeof StepLayout>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const ScrollableContent: TStory = {};
