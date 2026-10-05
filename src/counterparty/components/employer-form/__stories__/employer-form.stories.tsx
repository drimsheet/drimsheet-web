import { EmployerForm } from '@/counterparty/components/employer-form';
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
  title: 'Counterparty/EmployerForm',
  component: EmployerForm,
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
} satisfies Meta<typeof EmployerForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Prefilled: Story = {
  args: {
    initialValues: {
      name: 'MegaCorp Inc',
      type: 'organization',
      displayName: 'MegaCorp',
      address: {
        line1: '100 corporate towers',
        city: 'Enugu',
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
      name: 'Defunct Employer',
      type: 'organization',
    },
  },
};

export const Update: Story = {
  args: {
    showPostalCode: true,
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
