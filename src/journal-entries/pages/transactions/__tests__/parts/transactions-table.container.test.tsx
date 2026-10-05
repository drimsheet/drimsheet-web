import { useArchiveJournalEntry } from '@/journal-entries/hooks/use-archive-journal-entry';
import { useDeleteJournalEntry } from '@/journal-entries/hooks/use-delete-journal-entry';
import { useJournalEntries } from '@/journal-entries/hooks/use-journal-entries';
import { TransactionsTableContainer } from '@/journal-entries/pages/transactions/parts/transactions-table.container';
import {
  ECounterpartyStatus,
  EJournalEntrySourceType,
  EJournalEntryStatus,
  EJournalSide,
  type IJournalEntryListDto,
  type TEntityId,
} from '@/shared/lib/api/Api';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/journal-entries/hooks/use-journal-entries');
vi.mock('@/journal-entries/hooks/use-archive-journal-entry');
vi.mock('@/journal-entries/hooks/use-delete-journal-entry');

const money = { amount: 125_000, currencyCode: 'NGN', isMinorUnit: false };

const paymentEntry = {
  id: 'payment-entry',
  accountingEntityId: 'entity-1',
  sourceType: EJournalEntrySourceType.Payment,
  memo: null,
  status: EJournalEntryStatus.Posted,
  effectiveDate: '2026-09-16T00:00:00Z',
  postedAt: '2026-09-16T10:00:00Z',
  voidedAt: null,
  voidingEntryId: null,
  version: 1,
  createdBy: '00000000-0000-4000-8000-000000000100' as TEntityId,
  createdAt: '2026-09-16T10:00:00Z',
  updatedAt: '2026-09-16T10:00:00Z',
  attachments: [],
  lines: [
    {
      id: 'cash-line',
      entryId: 'payment-entry',
      account: { id: 'cash-main', name: 'Main checking' },
      counterparty: {
        id: 'counterparty-1',
        name: 'Osahon Oboite',
        status: ECounterpartyStatus.Active,
      },
      sequenceOrder: 1,
      amount: money,
      exchangeRate: null,
      functionalAmount: money,
      side: EJournalSide.Credit,
      description: null,
      version: 1,
      createdAt: '2026-09-16T10:00:00Z',
      updatedAt: '2026-09-16T10:00:00Z',
    },
    {
      id: 'category-line',
      entryId: 'payment-entry',
      account: { id: 'gift', name: 'Gift' },
      counterparty: {
        id: 'counterparty-1',
        name: 'Osahon Oboite',
        status: ECounterpartyStatus.Active,
      },
      sequenceOrder: 2,
      amount: money,
      exchangeRate: null,
      functionalAmount: money,
      side: EJournalSide.Debit,
      description: null,
      version: 1,
      createdAt: '2026-09-16T10:00:00Z',
      updatedAt: '2026-09-16T10:00:00Z',
    },
  ],
} satisfies IJournalEntryListDto;

function LocationSearch() {
  return <div aria-label="Location search">{useLocation().search}</div>;
}

function LocationPathname() {
  return <div aria-label="Location pathname">{useLocation().pathname}</div>;
}

function renderContainer(initialEntry = '/transactions') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <TransactionsTableContainer />
      <LocationSearch />
      <LocationPathname />
    </MemoryRouter>
  );
}

describe('TransactionsTableContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useArchiveJournalEntry).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);
    vi.mocked(useDeleteJournalEntry).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);
    vi.mocked(useJournalEntries).mockReturnValue({
      data: {
        data: [paymentEntry],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
      isPending: false,
    } as never);
  });

  it('requests newest-first entries and opens the resolved transaction details', async () => {
    const user = userEvent.setup();
    renderContainer();

    expect(useJournalEntries).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      orderBy: 'effectiveDate',
      sortDirection: 'desc',
    });
    expect(screen.getByText('Main checking')).toBeInTheDocument();
    expect(screen.getByText('Payment to Osahon Oboite')).toBeInTheDocument();
    expect(screen.getByText('Gift')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open transaction' }));

    expect(
      screen.getByRole('dialog', { name: 'Transaction details' })
    ).toBeInTheDocument();
    expect(screen.getByText('Outflow')).toBeInTheDocument();
  });

  it('keeps search and reversible date sorting in URL-backed query state', async () => {
    const user = userEvent.setup();
    renderContainer();

    await user.type(
      screen.getByPlaceholderText('Search transactions...'),
      'gift'
    );
    await user.click(screen.getByRole('columnheader', { name: 'Date' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Location search')).toHaveTextContent(
        'q=gift'
      );
      expect(screen.getByLabelText('Location search')).toHaveTextContent(
        'order=asc'
      );
      expect(useJournalEntries).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'gift', sortDirection: 'asc' })
      );
    });
  });

  it('navigates from the details drawer to the canonical edit route', async () => {
    const user = userEvent.setup();
    renderContainer();

    await user.click(screen.getByRole('button', { name: 'Open transaction' }));
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByLabelText('Location pathname')).toHaveTextContent(
      '/transactions/outflow/payment-entry/edit'
    );
  });

  it('deletes the selected transaction at its current version', async () => {
    const user = userEvent.setup();
    const deleteEntry = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useDeleteJournalEntry).mockReturnValue({
      mutateAsync: deleteEntry,
      isPending: false,
    } as never);
    renderContainer();

    await user.click(screen.getByRole('button', { name: 'Open transaction' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    const confirmationDialog = screen.getByRole('alertdialog', {
      name: 'Delete this transaction?',
    });

    await user.type(
      within(confirmationDialog).getByLabelText('Type "delete" to confirm'),
      'delete'
    );
    await user.click(
      within(confirmationDialog).getByRole('button', { name: 'Delete' })
    );

    expect(deleteEntry).toHaveBeenCalledWith({
      id: 'payment-entry',
      payload: { expectedVersion: 1 },
    });
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('keeps the skeleton visible until journal entries are ready', () => {
    vi.mocked(useJournalEntries).mockReturnValue({
      data: undefined,
      isPending: true,
    } as never);

    renderContainer();

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading transactions'
    );
  });
});
