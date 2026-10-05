import { MoneyInput } from '@/shared/components/money-input';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Shared UI/MoneyInput',
  component: MoneyInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  render: (args) => {
    const [val, setVal] = useState(args.value || '');

    return (
      <MoneyInput
        {...args}
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          if (args.onChange) args.onChange(e);
        }}
      />
    );
  },
} satisfies Meta<typeof MoneyInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: 'Amount' } };

export const WithCurrencyCode: Story = {
  args: { currencyCode: 'USD', placeholder: 'Amount in USD' },
};

export const WithLocale: Story = {
  args: {
    currencyCode: 'EUR',
    locale: 'de-DE',
    placeholder: 'Amount in EUR (German locale)',
  },
};

export const NumberDecimals: Story = {
  args: {
    currencyCode: 'USD',
    decimalType: 'number',
    placeholder: 'Numeric value',
  },
};

export const WithInitialValue: Story = {
  args: { value: 1234.56, currencyCode: 'GBP' },
};

export const NegativeValue: Story = {
  args: { value: -1000, currencyCode: 'JPY' },
};
