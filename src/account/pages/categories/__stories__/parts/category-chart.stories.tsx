import { CategoryChart } from '@/account/pages/categories/parts/category-chart';
import type {
  IRevenueExpenseAccountDto,
  IRevenueExpenseSummaryDto,
} from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const categoryAccount: IRevenueExpenseAccountDto = {
  accountId: 'services',
  accountName: 'Consulting services',
  code: '40001',
  type: 'revenue',
  subType: 'operating_revenue',
  status: 'active',
  amount: { amount: 840000000, currencyCode: 'NGN', isMinorUnit: true },
  sharePercentage: 70,
  transactionCount: 128,
};

const categorySummary: IRevenueExpenseSummaryDto = {
  currencyCode: 'NGN',
  period: { from: '2026-10-01', to: '2026-10-14' },
  comparisonPeriod: { from: '2026-09-17', to: '2026-09-30' },
  revenue: {
    total: { amount: 12000000, currencyCode: 'NGN', isMinorUnit: false },
    previousTotal: {
      amount: 10000000,
      currencyCode: 'NGN',
      isMinorUnit: false,
    },
    percentageChange: 20,
    accounts: [
      {
        accountId: 'services',
        accountName: 'Consulting services',
        amount: categoryAccount.amount,
        sharePercentage: 70,
      },
      {
        accountId: 'employment',
        accountName: 'Employment income',
        amount: { amount: 3600000, currencyCode: 'NGN', isMinorUnit: false },
        sharePercentage: 30,
      },
    ],
  },
  expenses: {
    total: { amount: 8100000, currencyCode: 'NGN', isMinorUnit: false },
    previousTotal: { amount: 9000000, currencyCode: 'NGN', isMinorUnit: false },
    percentageChange: -10,
    accounts: [
      {
        accountId: 'rent',
        accountName: 'Rent and utilities',
        amount: { amount: 8100000, currencyCode: 'NGN', isMinorUnit: false },
        sharePercentage: 100,
      },
    ],
  },
  suspense: {
    amount: { amount: 450000, currencyCode: 'NGN', isMinorUnit: false },
    transactionCount: 12,
  },
};

const meta = {
  title: 'Ledger Accounts/Categories/Chart',
  component: CategoryChart,
  tags: ['autodocs'],
  args: {
    title: 'Revenue by category',
    description: 'Net revenue and share of total revenue for this period',
    section: categorySummary.revenue,
    onViewAccount: () => {},
  },
} satisfies Meta<typeof CategoryChart>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = {
  args: { section: { ...categorySummary.revenue, accounts: [] } },
};
export const Overflow: Story = {
  args: {
    section: {
      ...categorySummary.revenue,
      accounts: Array.from({ length: 18 }, (_, index) => ({
        ...categorySummary.revenue.accounts[0],
        accountId: String(index),
        accountName: `Service category ${index + 1}`,
      })),
    },
  },
};
export const SignedAmounts: Story = {
  args: {
    section: {
      ...categorySummary.revenue,
      accounts: [
        ...categorySummary.revenue.accounts,
        {
          accountId: 'adjustment',
          accountName: 'Revenue adjustments',
          amount: { amount: -1200000, currencyCode: 'NGN', isMinorUnit: false },
          sharePercentage: -10,
        },
      ],
    },
  },
};
