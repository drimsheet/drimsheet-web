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
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const accountNamesById: Record<string, string> = {
  'cash-main': 'Main checking',
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
  lines,
}: {
  id: string;
  sourceType: UJournalEntrySourceType;
  lines: IJournalLineListDto[];
}): IJournalEntryListDto {
  return {
    id,
    accountingEntityId: 'entity-1',
    sourceType,
    memo: null,
    status: EJournalEntryStatus.Posted,
    effectiveDate: '2026-09-16T00:00:00Z',
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
  lines: [
    createLine({
      id: 'receipt-line-1',
      entryId: 'receipt-entry',
      accountId: 'services',
      sequenceOrder: 1,
      amount: createMoney(85_000),
    }),
    createLine({
      id: 'receipt-line-2',
      entryId: 'receipt-entry',
      accountId: 'cash-main',
      sequenceOrder: 2,
      amount: createMoney(85_000),
    }),
  ],
});

const transferEntry = createEntry({
  id: 'transfer-entry',
  sourceType: EJournalEntrySourceType.Transfer,
  lines: [
    createLine({
      id: 'transfer-line-1',
      entryId: 'transfer-entry',
      accountId: 'cash-usd',
      sequenceOrder: 1,
      amount: createMoney(1_000, 'USD'),
    }),
    createLine({
      id: 'transfer-line-2',
      entryId: 'transfer-entry',
      accountId: 'cash-main',
      sequenceOrder: 2,
      amount: createMoney(1_590_000),
    }),
  ],
});

const defaultProps = {
  data: [paymentEntry, receiptEntry, transferEntry],
  onSearchChange: vi.fn(),
};

describe('TransactionsTable', () => {
  it('renders direction, date, account, summary, and amount without a Type column', () => {
    render(<TransactionsTable {...defaultProps} />);

    expect(
      screen.getByRole('columnheader', { name: 'Direction' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Date' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Account' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Summary' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Amount' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: 'Type' })
    ).not.toBeInTheDocument();

    expect(screen.getByRole('img', { name: 'Money out' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Money in' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Transfer' })).toBeInTheDocument();
  });

  it('renders counterparty and category summaries with unique additional counts', () => {
    render(<TransactionsTable {...defaultProps} />);

    expect(
      screen.getByText('Payment to Osahon Oboite & 1 other')
    ).toBeInTheDocument();
    expect(screen.getByText('Gift & 1 other')).toBeInTheDocument();
    expect(screen.getByText('Receipt from Osahon Oboite')).toBeInTheDocument();
    expect(screen.getByText('Professional services')).toBeInTheDocument();
    expect(screen.getByText('USD account → Main checking')).toBeInTheDocument();
  });

  it('renders the selected cash account in its standalone column', () => {
    render(<TransactionsTable {...defaultProps} />);

    const paymentRow = screen
      .getByText('Payment to Osahon Oboite & 1 other')
      .closest('tr');

    const receiptRow = screen
      .getByText('Receipt from Osahon Oboite')
      .closest('tr');

    const transferRow = screen
      .getByText('USD account → Main checking')
      .closest('tr');

    expect(paymentRow).not.toBeNull();
    expect(receiptRow).not.toBeNull();
    expect(transferRow).not.toBeNull();

    expect(within(paymentRow!).getAllByRole('cell')[2]).toHaveTextContent(
      'Main checking'
    );
    expect(within(receiptRow!).getAllByRole('cell')[2]).toHaveTextContent(
      'Main checking'
    );
    expect(within(transferRow!).getAllByRole('cell')[2]).toHaveTextContent(
      'USD account'
    );
  });

  it('formats amounts with Money and shows only the transfer source amount', () => {
    render(<TransactionsTable {...defaultProps} />);

    const transferRow = screen
      .getByText('USD account → Main checking')
      .closest('tr');

    expect(transferRow).not.toBeNull();
    expect(within(transferRow!).getByText(/\$1,000/)).toBeInTheDocument();
    expect(
      within(transferRow!).queryByText(/1,590,000/)
    ).not.toBeInTheDocument();
  });

  it('emits search, effective-date sort, and page intents', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onSortChange = vi.fn();
    const onPageChange = vi.fn();

    render(
      <TransactionsTable
        {...defaultProps}
        onSearchChange={onSearchChange}
        onSortChange={onSortChange}
        onPageChange={onPageChange}
        pagination={{ page: 1, limit: 10, total: 12, totalPages: 2 }}
      />
    );

    await user.type(
      screen.getByPlaceholderText('Search transactions...'),
      'gift'
    );
    await user.click(screen.getByRole('columnheader', { name: 'Date' }));
    await user.click(screen.getByRole('link', { name: '2' }));

    expect(onSearchChange).toHaveBeenCalled();
    expect(onSortChange).toHaveBeenCalledWith('effectiveDate', 'asc');
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('renders the shared empty state when there are no transactions', () => {
    render(<TransactionsTable {...defaultProps} data={[]} />);

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('renders its skeleton while transactions are loading', () => {
    render(<TransactionsTable {...defaultProps} loading />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading transactions'
    );
    expect(
      screen.queryByPlaceholderText('Search transactions...')
    ).not.toBeInTheDocument();
  });

  it('renders an open action for every supported transaction', () => {
    render(<TransactionsTable {...defaultProps} />);

    expect(
      screen.getAllByRole('button', { name: 'Open transaction' })
    ).toHaveLength(3);
  });

  it('opens the matching transaction details and closes the drawer', async () => {
    const user = userEvent.setup();

    render(<TransactionsTable {...defaultProps} />);

    const openButtons = screen.getAllByRole('button', {
      name: 'Open transaction',
    });

    await user.click(openButtons[0]);

    const outflowDrawer = screen.getByRole('dialog', {
      name: 'Transaction details',
    });

    expect(within(outflowDrawer).getByText('Outflow')).toBeInTheDocument();
    expect(
      within(outflowDrawer).getByText('Main checking')
    ).toBeInTheDocument();
    expect(within(outflowDrawer).getByText('Gift')).toBeInTheDocument();
    expect(within(outflowDrawer).getByText('Donations')).toBeInTheDocument();

    await user.click(
      within(outflowDrawer).getByRole('button', {
        name: 'Close transaction details',
      })
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(openButtons[1]);

    const inflowDrawer = screen.getByRole('dialog', {
      name: 'Transaction details',
    });

    expect(within(inflowDrawer).getByText('Inflow')).toBeInTheDocument();
    expect(
      within(inflowDrawer).getByText('Professional services')
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(openButtons[2]);

    const transferDrawer = screen.getByRole('dialog', {
      name: 'Transaction details',
    });

    expect(within(transferDrawer).getByText('Transfer')).toBeInTheDocument();
    expect(within(transferDrawer).getByText('USD account')).toBeInTheDocument();
    expect(
      within(transferDrawer).getByText('Main checking')
    ).toBeInTheDocument();
  });

  it('emits edit intent for the selected transaction', async () => {
    const user = userEvent.setup();
    const onEditTransaction = vi.fn();

    render(
      <TransactionsTable
        {...defaultProps}
        onEditTransaction={onEditTransaction}
      />
    );

    await user.click(
      screen.getAllByRole('button', { name: 'Open transaction' })[0]
    );
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(onEditTransaction).toHaveBeenCalledWith(paymentEntry);
  });

  it('renders an optional action button alongside the search field', () => {
    render(
      <TransactionsTable
        {...defaultProps}
        actionButton={<button type="button">New transaction</button>}
      />
    );

    expect(
      screen.getByRole('button', { name: 'New transaction' })
    ).toBeInTheDocument();
  });
});
