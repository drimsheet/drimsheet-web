import { IncomeCategoriesForm } from '@/accounting/components/income-categories-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Income Categories Form',
  component: IncomeCategoriesForm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-[620px] p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof IncomeCategoriesForm>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Disabled: TStory = { args: { disabled: true } };
export const CustomCategory: TStory = {
  args: {
    initialValues: {
      categories: [
        {
          id: 'consulting',
          name: 'Consulting',
          parentId: 'services',
          selected: true,
        },
        {
          id: 'gifts-default',
          name: 'Gifts (Default)',
          parentId: 'gifts',
          selected: false,
        },
      ],
    },
  },
};
