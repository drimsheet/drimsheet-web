import { CounterpartyForm } from '@/counterparty/components/counterparty-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/CounterpartyForm',
  component: CounterpartyForm,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[min(32rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
  args: {
    onSubmit: () => {},
  },
} satisfies Meta<typeof CounterpartyForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Prefilled: Story = {
  args: {
    initialValues: {
      name: 'John Doe Enterprise',
      type: 'organization',
    },
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    initialValues: {
      name: 'Disabled Client',
      type: 'individual',
    },
  },
};

export const Update: Story = {
  args: {
    submitLabel: 'Save changes',
    onCancel: () => {},
    initialValues: { name: 'Existing counterparty', type: 'organization' },
  },
};
export const TypeLocked: Story = {
  args: {
    ...Update.args,
    typeRestriction: {
      value: 'organization',
      description:
        'This counterparty’s type cannot be changed because it has been used in a transaction. Create a new counterparty if a different type is required.',
    },
  },
};
