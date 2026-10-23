import { CreateIncomeCategoryForm } from '@/accounting/components/income-categories-form/parts/create-income-category-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Income Categories Form/Create Category',
  component: CreateIncomeCategoryForm,
  tags: ['autodocs'],
  args: {
    groups: [
      { id: 'services', name: 'Services' },
      { id: 'gifts', name: 'Gifts' },
    ],
    categories: [],
    onSubmit: () => {},
    onCancel: () => {},
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[620px] p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CreateIncomeCategoryForm>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Disabled: TStory = { args: { disabled: true } };
