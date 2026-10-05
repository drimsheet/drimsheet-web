import { CountryComboBox } from '@/shared/components/country-combobox';
import uiCountries from '@/shared/configs/countries.json' with { type: 'json' };
import type { IAccountingStandardDto } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const dummyjurisdictions = uiCountries.map((c) => ({
  code: c.code,
  name: c.name,
  currencyCode: c.currencyCode,
  maxFiscalMonths: 12,
  accountingStandards: {} as IAccountingStandardDto,
}));

const meta = {
  title: 'Shared UI/CountryComboBox',
  component: CountryComboBox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { onChange: () => {} },
} satisfies Meta<typeof CountryComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Country', value: '', jurisdictions: dummyjurisdictions },
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true, value: 'NG' },
};
export const Clearable: Story = {
  args: { ...Default.args, value: 'NG', clearable: true },
};
