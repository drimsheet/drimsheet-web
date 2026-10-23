import { CreateCategoryForm } from '@/accounting/components/categories-form/parts/create-category-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Categories Form/Create Category',
  component: CreateCategoryForm,
  tags: ['autodocs'],
  args: {
    kind: 'income',
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
} satisfies Meta<typeof CreateCategoryForm>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Disabled: TStory = { args: { disabled: true } };
