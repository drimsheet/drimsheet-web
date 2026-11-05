import { CounterpartyOption } from '@/journal-entries/components/cash-transaction-form/parts/counterparty-option';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Journal Entries/CashTransactionForm/CounterpartyOption',
  component: CounterpartyOption,
  tags: ['autodocs'],
  args: {
    counterparty: {
      id: 'business',
      name: 'Acme Consulting',
      type: 'organization',
      roles: ['vendor', 'contractor'],
    },
  },
  decorators: [
    (Story) => (
      <div className="flex w-80 items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CounterpartyOption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Organization: Story = {};
export const Individual: Story = {
  args: {
    counterparty: {
      id: 'person',
      name: 'Jordan Taylor',
      type: 'individual',
      roles: ['contractor'],
    },
  },
};
export const NoRelationships: Story = {
  args: {
    counterparty: {
      id: 'person',
      name: 'Jordan Taylor',
      type: 'individual',
      roles: [],
    },
  },
};
export const LongNameAndAllRelationships: Story = {
  args: {
    counterparty: {
      id: 'business',
      name: 'Acme International Consulting and Professional Services',
      type: 'organization',
      roles: ['vendor', 'contractor', 'employer'],
    },
  },
};
