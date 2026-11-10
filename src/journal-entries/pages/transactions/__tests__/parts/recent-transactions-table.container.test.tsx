import { useArchiveJournalEntry } from '@/journal-entries/hooks/use-archive-journal-entry';
import { useDeleteJournalEntry } from '@/journal-entries/hooks/use-delete-journal-entry';
import { useJournalEntries } from '@/journal-entries/hooks/use-journal-entries';
import { useVoidEntry } from '@/journal-entries/hooks/use-void-entry';
import { RecentTransactionsTableContainer } from '@/journal-entries/pages/transactions/parts/recent-transactions-table.container';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
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
vi.mock('@/shared/hooks/use-api-error-handler');
vi.mock('@/journal-entries/hooks/use-archive-journal-entry');
vi.mock('@/journal-entries/hooks/use-delete-journal-entry');
vi.mock('@/journal-entries/hooks/use-void-entry');

const money = { amount: 125_000, currencyCode: 'NGN', isMinorUnit: false };
const deleteEntry = vi.fn();
const voidEntry = vi.fn();

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
      <RecentTransactionsTableContainer />
      <LocationSearch />
      <LocationPathname />
    </MemoryRouter>
  );
}

function mockEntry(entry: IJournalEntryListDto) {
  vi.mocked(useJournalEntries).mockReturnValue({
    data: {
      data: [entry],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    },
    isPending: false,
  } as never);
}

describe('RecentTransactionsTableContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApiErrorHandler).mockReturnValue(vi.fn());
    vi.mocked(useArchiveJournalEntry).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);
    vi.mocked(useDeleteJournalEntry).mockReturnValue({
      mutateAsync: deleteEntry,
      isPending: false,
    } as never);
    vi.mocked(useVoidEntry).mockReturnValue({
      mutateAsync: voidEntry,
      isPending: false,
    } as never);
    mockEntry(paymentEntry);
  });

  it('requests newest-first entries and opens the resolved transaction details', async () => {
    const user = userEvent.setup();
    renderContainer();

    expect(useJournalEntries).toHaveBeenCalledWith(
      {
        page: 1,
        limit: 15,
        orderBy: 'effectiveDate',
        sortDirection: 'desc',
      },
      { throwOnError: false }
    );
    expect(screen.getByText('Main checking')).toBeInTheDocument();
    expect(screen.getByText('Payment to Osahon Oboite')).toBeInTheDocument();
    expect(screen.getByText('Gift')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open transaction' }));

    expect(
      screen.getByRole('dialog', { name: 'Transaction details' })
    ).toBeInTheDocument();
    expect(screen.getByText('Outflow')).toBeInTheDocument();
  });

  it('shows at most 15 recent entries without pagination or sorting controls', () => {
    vi.mocked(useJournalEntries).mockReturnValue({
      data: {
        data: Array.from({ length: 16 }, (_, index) => ({
          ...paymentEntry,
          id: `payment-${index}`,
        })),
        meta: { page: 1, limit: 15, total: 40, totalPages: 3 },
      },
      isPending: false,
    } as never);
    renderContainer();
    expect(
      screen.getAllByRole('button', { name: 'Open transaction' })
    ).toHaveLength(15);
    expect(
      screen.queryByRole('button', { name: 'Sort by Date' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByText(/rows per page/i)).not.toBeInTheDocument();
  });

  it('shows a translated error when fetching transactions fails', () => {
    vi.mocked(useJournalEntries).mockReturnValue({
      isPending: false,
      isError: true,
    } as never);
    renderContainer();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Couldn’t load transactions'
    );
  });

  it('renders the table empty state without pagination when there are no transactions', () => {
    vi.mocked(useJournalEntries).mockReturnValue({
      data: { data: [], meta: { page: 1, limit: 15, total: 0, totalPages: 0 } },
      isPending: false,
    } as never);
    renderContainer();
    expect(
      screen.queryByRole('button', { name: 'Open transaction' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
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

  it.each([
    [EJournalEntryStatus.Draft, deleteEntry, voidEntry],
    [EJournalEntryStatus.Posted, voidEntry, deleteEntry],
  ])(
    'uses the matching mutation for a %s entry',
    async (status, expectedMutation, otherMutation) => {
      const user = userEvent.setup();
      mockEntry({
        ...paymentEntry,
        status,
        postedAt:
          status === EJournalEntryStatus.Draft ? null : paymentEntry.postedAt,
      });
      renderContainer();

      await user.click(
        screen.getByRole('button', { name: 'Open transaction' })
      );
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

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(expectedMutation).toHaveBeenCalledExactlyOnceWith('payment-entry');
      expect(otherMutation).not.toHaveBeenCalled();
    }
  );

  it.each([EJournalEntryStatus.Archived, EJournalEntryStatus.Voided])(
    'disables deletion for a %s entry',
    async (status) => {
      const user = userEvent.setup();
      mockEntry({ ...paymentEntry, status });
      renderContainer();

      await user.click(
        screen.getByRole('button', { name: 'Open transaction' })
      );

      expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    }
  );

  it('archives the selected entry and clears the same-page search only on success', async () => {
    const user = userEvent.setup();
    const archive = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useArchiveJournalEntry).mockReturnValue({
      mutateAsync: archive,
      isPending: false,
    } as never);
    renderContainer('/transactions?q=gift');
    await user.click(screen.getByRole('button', { name: 'Open transaction' }));
    await user.click(screen.getByRole('button', { name: 'Archive' }));

    const confirmation = screen.getByRole('alertdialog', {
      name: 'Archive this transaction?',
    });

    await user.click(
      within(confirmation).getByRole('button', { name: 'Archive' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    expect(archive).toHaveBeenCalledExactlyOnceWith('payment-entry');
    expect(screen.getByLabelText('Location search')).toBeEmptyDOMElement();
  });

  it('reports a failed archive without clearing the current search', async () => {
    const user = userEvent.setup();
    const error = new Error('unavailable');
    const handleError = vi.fn();
    vi.mocked(useApiErrorHandler).mockReturnValue(handleError);
    vi.mocked(useArchiveJournalEntry).mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(error),
      isPending: false,
    } as never);
    renderContainer('/transactions?q=gift');
    await user.click(screen.getByRole('button', { name: 'Open transaction' }));
    await user.click(screen.getByRole('button', { name: 'Archive' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Archive',
      })
    );
    await waitFor(() =>
      expect(handleError).toHaveBeenCalledWith(error, { showToast: true })
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    expect(screen.getByLabelText('Location search')).toHaveTextContent(
      '?q=gift'
    );
  });

  it('keeps the delete confirmation and entered confirmation text when voiding fails', async () => {
    const user = userEvent.setup();
    const error = new Error('unavailable');
    const handleError = vi.fn();
    vi.mocked(useApiErrorHandler).mockReturnValue(handleError);
    vi.mocked(useVoidEntry).mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(error),
      isPending: false,
    } as never);
    renderContainer();
    await user.click(screen.getByRole('button', { name: 'Open transaction' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    const confirmation = screen.getByRole('alertdialog', {
      name: 'Delete this transaction?',
    });

    await user.type(
      within(confirmation).getByLabelText('Type "delete" to confirm'),
      'delete'
    );
    await user.click(
      within(confirmation).getByRole('button', { name: 'Delete' })
    );
    await waitFor(() =>
      expect(handleError).toHaveBeenCalledWith(error, { showToast: true })
    );
    expect(confirmation).toBeInTheDocument();
    expect(
      within(confirmation).getByLabelText('Type "delete" to confirm')
    ).toHaveValue('delete');
    expect(
      within(confirmation).getByRole('button', { name: 'Delete' })
    ).toBeEnabled();
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
