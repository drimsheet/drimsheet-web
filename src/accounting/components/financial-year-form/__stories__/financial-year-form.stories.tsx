import { FinancialYearForm } from '@/accounting/components/financial-year-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Financial Year Form',
  component: FinancialYearForm,
  tags: ['autodocs'],
  args: { currentDate: '2026-10-22' },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[620px] p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FinancialYearForm>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Monthly: TStory = {
  args: { initialValues: { name: 'FY 2026', unit: 'month' } },
};
export const Daily: TStory = { args: { initialValues: { unit: 'day' } } };
export const Disabled: TStory = { args: { disabled: true } };
export const InvalidDates: TStory = {
  args: { initialValues: { startDate: '2026-06-01', endDate: '2026-01-01' } },
};
