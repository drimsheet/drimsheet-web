import { ReportsForm } from '@/accounting/components/reports-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Reports Form',
  component: ReportsForm,
  tags: ['autodocs'],
  args: {
    currentDate: '2026-10-22',
    financialYear: {
      name: 'FY 2026',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    },
    currencies: [
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[620px] p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReportsForm>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Populated: TStory = {
  args: { initialValues: { name: 'Board pack', currencyCode: 'NGN' } },
};
export const Monthly: TStory = { args: { initialValues: { unit: 'month' } } };
export const Daily: TStory = { args: { initialValues: { unit: 'day' } } };
export const Disabled: TStory = { args: { disabled: true } };
