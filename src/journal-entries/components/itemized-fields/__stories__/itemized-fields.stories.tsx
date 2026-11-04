import { ItemizedFields } from '@/journal-entries/components/itemized-fields';
import { TooltipProvider } from '@/shared/components/tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

const accounts = [
  {
    id: 'sales',
    code: '4000',
    name: 'Sales revenue',
    type: 'revenue',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
] as never[];

const meta = {
  title: 'Journal Entries/ItemizedFields',
  component: ItemizedFields,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  args: {
    accounts,
    currencyCode: 'NGN',
    defaultValue: [
      {
        id: 'first',
        amount: { amount: 1250, currencyCode: 'NGN', isMinorUnit: false },
        accountId: 'sales',
        description: '',
      },
    ],
    onChange: () => undefined,
  },
} satisfies Meta<typeof ItemizedFields>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NewItem: Story = {
  args: { initialEditItemId: 'first' },
};

export const Empty: Story = {
  args: { defaultValue: [] },
};

export const LongDescription: Story = {
  args: {
    defaultValue: [
      {
        id: 'long-description',
        amount: { amount: 1250, currencyCode: 'NGN', isMinorUnit: false },
        accountId: 'sales',
        description:
          'Consulting work for August covering research, implementation, review, and final delivery.',
      },
    ],
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const CategoryCreation: Story = {
  args: { initialEditItemId: 'first', onAddCategory: () => undefined },
};
