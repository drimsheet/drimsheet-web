import { TransactionsTable } from '@/journal-entries/components/transactions-table';
import {
  ECounterpartyStatus,
  EJournalEntrySourceType,
  EJournalEntryStatus,
  EJournalSide,
  type IJournalEntryListDto,
  type IJournalLineListDto,
  type IMoneyDto,
  type TEntityId,
  type UJournalEntrySourceType,
} from '@/shared/lib/api/Api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const accountNamesById: Record<string, string> = {
  'cash-main': 'Main checking',
  'cash-tax': 'Tax reserve',
  'cash-usd': 'USD account',
  donations: 'Donations',
  gift: 'Gift',
  services: 'Professional services',
};

const counterpartyNamesById: Record<string, string> = {
  'counterparty-1': 'Osahon Oboite',
  'counterparty-2': 'Ada Okafor',
};

function createMoney(amount: number, currencyCode = 'NGN'): IMoneyDto {
  return { amount, currencyCode, isMinorUnit: false };
}

function createLine({
  id,
  entryId,
  accountId,
  counterpartyId = 'counterparty-1',
  sequenceOrder,
  amount,
}: {
  id: string;
  entryId: string;
  accountId: string;
  counterpartyId?: string;
  sequenceOrder: number;
  amount: IMoneyDto;
}): IJournalLineListDto {
  return {
    id,
    entryId,
    account: { id: accountId, name: accountNamesById[accountId] },
    counterparty: {
      id: counterpartyId,
      name: counterpartyNamesById[counterpartyId],
      status: ECounterpartyStatus.Active,
    },
    sequenceOrder,
    amount,
    exchangeRate: null,
    functionalAmount: amount,
    side: EJournalSide.Debit,
    description: null,
    createdAt: '2026-09-16T10:00:00Z',
    updatedAt: '2026-09-16T10:00:00Z',
  };
}

function createEntry({
  id,
  sourceType,
  effectiveDate,
  lines,
}: {
  id: string;
  sourceType: UJournalEntrySourceType;
  effectiveDate: string;
  lines: IJournalLineListDto[];
}): IJournalEntryListDto {
  return {
    id,
    accountingEntityId: 'entity-1',
    sourceType,
    memo: null,
    status: EJournalEntryStatus.Posted,
    effectiveDate,
    postedAt: '2026-09-16T10:00:00Z',
    voidedAt: null,
    voidingEntryId: null,
    createdBy: '00000000-0000-4000-8000-000000000100' as TEntityId,
    createdAt: '2026-09-16T10:00:00Z',
    updatedAt: '2026-09-16T10:00:00Z',
    attachments: [],
    lines,
  };
}

const paymentEntry = createEntry({
  id: 'payment-entry',
  sourceType: EJournalEntrySourceType.Payment,
  effectiveDate: '2026-09-16T00:00:00Z',
  lines: [
    createLine({
      id: 'payment-line-1',
      entryId: 'payment-entry',
      accountId: 'cash-main',
      sequenceOrder: 1,
      amount: createMoney(125_000),
    }),
    createLine({
      id: 'payment-line-2',
      entryId: 'payment-entry',
      accountId: 'gift',
      sequenceOrder: 2,
      amount: createMoney(75_000),
    }),
    createLine({
      id: 'payment-line-3',
      entryId: 'payment-entry',
      accountId: 'donations',
      counterpartyId: 'counterparty-2',
      sequenceOrder: 3,
      amount: createMoney(50_000),
    }),
  ],
});

const receiptEntry = createEntry({
  id: 'receipt-entry',
  sourceType: EJournalEntrySourceType.Receipt,
  effectiveDate: '2026-09-15T00:00:00Z',
  lines: [
    createLine({
      id: 'receipt-line-1',
      entryId: 'receipt-entry',
      accountId: 'services',
      sequenceOrder: 1,
      amount: createMoney(850_000),
    }),
    createLine({
      id: 'receipt-line-2',
      entryId: 'receipt-entry',
      accountId: 'cash-main',
      sequenceOrder: 2,
      amount: createMoney(850_000),
    }),
  ],
});

const sameCurrencyTransferEntry = createEntry({
  id: 'transfer-entry',
  sourceType: EJournalEntrySourceType.Transfer,
  effectiveDate: '2026-09-14T00:00:00Z',
  lines: [
    createLine({
      id: 'transfer-line-1',
      entryId: 'transfer-entry',
      accountId: 'cash-main',
      sequenceOrder: 1,
      amount: createMoney(250_000),
    }),
    createLine({
      id: 'transfer-line-2',
      entryId: 'transfer-entry',
      accountId: 'cash-tax',
      sequenceOrder: 2,
      amount: createMoney(250_000),
    }),
  ],
});

const crossCurrencyTransferEntry = createEntry({
  id: 'cross-currency-transfer-entry',
  sourceType: EJournalEntrySourceType.Transfer,
  effectiveDate: '2026-09-13T00:00:00Z',
  lines: [
    createLine({
      id: 'cross-currency-transfer-line-1',
      entryId: 'cross-currency-transfer-entry',
      accountId: 'cash-usd',
      sequenceOrder: 1,
      amount: createMoney(1_000, 'USD'),
    }),
    createLine({
      id: 'cross-currency-transfer-line-2',
      entryId: 'cross-currency-transfer-entry',
      accountId: 'cash-main',
      sequenceOrder: 2,
      amount: createMoney(1_590_000),
    }),
  ],
});

const meta = {
  title: 'Journal Entries/TransactionsTable',
  component: TransactionsTable,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-6xl p-6 bg-background rounded-2xl border border-border/80 shadow-xs">
        <Story />
      </div>
    ),
  ],
  args: {
    data: [paymentEntry, receiptEntry, sameCurrencyTransferEntry],
    searchValue: '',
    onSearchChange: () => undefined,
    onSortChange: () => undefined,
  },
} satisfies Meta<typeof TransactionsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultiplePartiesAndCategories: Story = {
  args: {
    data: [paymentEntry],
  },
};

export const CrossCurrencyTransfer: Story = {
  args: {
    data: [crossCurrencyTransferEntry],
  },
};

export const Paginated: Story = {
  args: {
    pagination: { page: 1, limit: 10, total: 24, totalPages: 3 },
    onPageChange: () => undefined,
  },
};

export const LoadingState: Story = {
  args: {
    data: [],
    loading: true,
  },
};

export const EmptyState: Story = {
  args: {
    data: [],
    loading: false,
  },
};
