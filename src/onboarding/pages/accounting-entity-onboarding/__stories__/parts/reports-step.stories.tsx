import { ReportsStep } from '@/onboarding/pages/accounting-entity-onboarding/parts/reports-step';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Onboarding/Accounting Entity/Reports Step',
  component: ReportsStep,
  tags: ['autodocs'],
  args: {
    currentDate: '2026-10-22',
    officialCurrencyCode: 'NGN',
    financialYear: {
      name: 'FY 2026',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    },
    currencies: [
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
    ],
    onBack: () => {},
  },
  decorators: [
    (Story) => (
      <div className="flex h-dvh flex-col overflow-y-auto pt-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReportsStep>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
