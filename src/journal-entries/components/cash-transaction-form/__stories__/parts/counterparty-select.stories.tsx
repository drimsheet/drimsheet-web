import { CounterpartySelect } from '@/journal-entries/components/cash-transaction-form/parts/counterparty-select';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Journal Entries/CashTransactionForm/CounterpartySelect',
  component: CounterpartySelect,
  tags: ['autodocs'],
  args: {
    value: { id: '', name: '' },
    options: [
      { id: 'person', name: 'Jordan Taylor' },
      { id: 'business', name: 'Acme Consulting' },
    ],
    label: 'Payer',
    placeholder: 'Select a payer',
    emptyMessage: 'No payers found.',
    createLabel: 'Add new counterparty',
    onBlur: () => undefined,
    onChange: () => undefined,
    onCreate: () => undefined,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return (
      <CounterpartySelect
        {...args}
        value={value}
        onChange={(next) => setValue(next ?? { id: '', name: '' })}
      />
    );
  },
} satisfies Meta<typeof CounterpartySelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = {
  args: { value: { id: 'person', name: 'Jordan Taylor' } },
};
export const Empty: Story = { args: { options: [] } };
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = {
  args: { error: [{ message: 'Payer is required' }] },
};
