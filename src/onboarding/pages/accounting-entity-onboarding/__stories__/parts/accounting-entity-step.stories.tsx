import { AccountingEntityStep } from '@/onboarding/pages/accounting-entity-onboarding/parts/accounting-entity-step';
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
  title: 'Onboarding/Accounting Entity/Accounting Entity Step',
  component: AccountingEntityStep,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex h-dvh flex-col overflow-y-auto pt-6">
        <Story />
      </div>
    ),
  ],
  args: { currencies, jurisdictions },
} satisfies Meta<typeof AccountingEntityStep>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Loading: TStory = {
  args: { currencies: [], jurisdictions: [], isLoading: true },
};
export const Error: TStory = {
  args: { currencies: [], jurisdictions: [], hasError: true },
};
