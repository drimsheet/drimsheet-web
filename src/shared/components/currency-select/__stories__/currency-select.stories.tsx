import { CurrencySelect } from '@/shared/components/currency-select';
import uiCurrencies from '@/shared/configs/currencies.json' with { type: 'json' };
import type { Meta, StoryObj } from '@storybook/react-vite';

const dummycurrencies = uiCurrencies.map((c) => ({
  code: c.code,
  symbol: c.symbol,
  name: c.name,
  minorUnit: c.minorUnit,
}));

const meta = {
  title: 'Shared UI/CurrencySelect',
  component: CurrencySelect,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { onChange: () => {} },
} satisfies Meta<typeof CurrencySelect>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { label: 'Currency', value: '', currencies: dummycurrencies },
};
