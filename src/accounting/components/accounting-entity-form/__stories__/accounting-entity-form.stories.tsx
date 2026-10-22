import { AccountingEntityForm } from '@/accounting/components/accounting-entity-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const currencies = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
];

const jurisdictions = [
  {
    code: 'NG',
    name: 'Nigeria',
    currencyCode: 'NGN',
    maxFiscalMonths: 18,
    accountingStandards: {
      individual: [],
      sole_trader: [],
      private_company: [],
    },
  },
];

const meta = {
  title: 'Accounting/Accounting Entity Form',
  component: AccountingEntityForm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl p-6">
        <Story />
      </div>
    ),
  ],
  args: { currencies, jurisdictions },
} satisfies Meta<typeof AccountingEntityForm>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Populated: TStory = {
  args: {
    initialValues: {
      entityType: 'individual',
      name: 'Ada Okafor',
      jurisdictionCode: 'NG',
      functionalCurrencyCode: 'NGN',
    },
  },
};
export const Disabled: TStory = { args: { disabled: true } };
