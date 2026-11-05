import {
  CashTransactionForm,
  type ICashTransactionFormValues,
} from '@/journal-entries/components/cash-transaction-form';
import type { IExchangeRate, ILedgerAccountDto } from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const accounts = [
  {
    id: 'ngn-bank',
    code: '1000',
    name: 'Main bank account',
    type: 'asset',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
  {
    id: 'usd-bank',
    code: '1010',
    name: 'USD bank account',
    type: 'asset',
    balance: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
  },
] as unknown as ILedgerAccountDto[];

const categories = [
  {
    id: 'sales',
    code: '4000',
    name: 'Sales revenue',
    type: 'revenue',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
] as unknown as ILedgerAccountDto[];

const counterpartyOptions: ICashTransactionFormValues['counterparty'][] = [
  {
    id: 'counterparty-1',
    name: 'Acme Consulting',
    type: 'organization',
    roles: ['vendor', 'employer'],
  },
  {
    id: 'counterparty-2',
    name: 'Jordan Taylor',
    type: 'individual',
    roles: ['contractor'],
  },
];

const meta = {
  title: 'Journal Entries/CashTransactionForm',
  component: CashTransactionForm,
  tags: ['autodocs'],
  args: {
    accounts,
    categories,
    counterpartyOptions,
    functionalCurrencyCode: 'NGN',
    onCurrencyContextChange: () => undefined,
    onSaveDraft: () => undefined,
    onSubmit: () => undefined,
  },
} satisfies Meta<typeof CashTransactionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScreenshotLayout: Story = {};

export const InflowCounterpartyText: Story = {
  args: {
    variant: 'inflow',
  },
};

export const OutflowCounterpartyText: Story = {
  args: {
    variant: 'outflow',
  },
};

export const ForeignCurrencyAccount: Story = {
  args: {
    initialValues: {
      accountId: 'usd-bank',
      categoryId: 'sales',
      amount: { amount: 1250 },
      exchangeRate: { value: 1500, inverted: false },
      counterparty: counterpartyOptions[0],
      description: 'August consulting retainer',
    } as ICashTransactionFormValues,
    officialExchangeRate: {
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      rate: 1500,
      asOf: new Date().toISOString(),
    } as IExchangeRate,
  },
};

export const Itemized: Story = {
  args: {
    initialValues: {
      accountId: 'ngn-bank',
      amount: { amount: 125000 },
      isItemized: true,
      items: [
        {
          id: 'story-item-1',
          amount: {
            amount: 125000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
          accountId: 'sales',
          description: '',
        },
      ],
      counterparty: counterpartyOptions[0],
    } as ICashTransactionFormValues,
  },
};

export const FunctionalCurrencyAccount: Story = {
  args: {
    initialValues: {
      accountId: 'ngn-bank',
      categoryId: 'sales',
      amount: { amount: 125000 },
      counterparty: counterpartyOptions[1],
    } as ICashTransactionFormValues,
  },
};

export const NarrowViewport: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export const NewPayer: Story = {
  args: {
    variant: 'inflow',
    counterpartyOptions: [],
    onAddCounterparty: () => undefined,
  },
};

export const NewPayee: Story = {
  args: {
    ...NewPayer.args,
    variant: 'outflow',
  },
};
