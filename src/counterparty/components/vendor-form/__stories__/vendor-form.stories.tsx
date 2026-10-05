import { VendorForm } from '@/counterparty/components/vendor-form';
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
  title: 'Counterparty/VendorForm',
  component: VendorForm,
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
    jurisdictions: dummyJurisdictions,
  },
} satisfies Meta<typeof VendorForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Prefilled: Story = {
  args: {
    initialValues: {
      name: 'Acme Supply Co.',
      type: 'organization',
      displayName: 'Acme',
      address: {
        line1: '123 Warehouse Rd',
        city: 'Lagos',
        countryCode: 'NG',
      },
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
      name: 'Old Vendor Ltd',
      type: 'organization',
    },
  },
};

export const Update: Story = {
  args: {
    showPostalCode: true,
    showDisplayName: false,
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
