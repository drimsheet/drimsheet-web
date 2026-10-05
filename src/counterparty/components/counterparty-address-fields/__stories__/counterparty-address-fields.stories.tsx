import { CounterpartyAddressFields } from '@/counterparty/components/counterparty-address-fields';
import uiCountries from '@/shared/configs/countries.json' with { type: 'json' };
import type {
  IAccountingStandardDto,
  IJurisdictionDto,
} from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const dummyJurisdictions: IJurisdictionDto[] = uiCountries.map((c) => ({
  code: c.code,
  name: c.name,
  currencyCode: c.currencyCode,
  maxFiscalMonths: 12,
  accountingStandards: {} as IAccountingStandardDto,
}));

const meta = {
  title: 'Counterparty/CounterpartyAddressFields',
  component: CounterpartyAddressFields,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[min(32rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  args: {
    values: {},
    errors: {},
    touched: {},
    jurisdictions: dummyJurisdictions,
    onChange: () => {},
    onBlur: () => {},
  },
} satisfies Meta<typeof CounterpartyAddressFields>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Prefilled: Story = {
  args: {
    values: {
      line1: '123 Tech Lane',
      line2: 'Floor 2',
      city: 'Yaba',
      region: 'Lagos',
      countryCode: 'NG',
    },
  },
};

export const CountryRequired: Story = {
  args: {
    countryRequired: true,
  },
};
export const UpdateAddress: Story = {
  args: {
    showPostalCode: true,
    values: {
      line1: '123 Tech Lane',
      city: 'Yaba',
      countryCode: 'NG',
      postalCode: '100001',
    },
  },
};
