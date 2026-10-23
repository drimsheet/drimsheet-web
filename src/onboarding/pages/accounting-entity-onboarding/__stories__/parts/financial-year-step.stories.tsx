import { FinancialYearStep } from '@/onboarding/pages/accounting-entity-onboarding/parts/financial-year-step';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Onboarding/Accounting Entity/Financial Year Step',
  component: FinancialYearStep,
  tags: ['autodocs'],
  args: { currentDate: '2026-10-22', maxFiscalMonths: 23, onBack: () => {} },
  decorators: [
    (Story) => (
      <div className="flex h-dvh flex-col overflow-y-auto pt-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FinancialYearStep>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
