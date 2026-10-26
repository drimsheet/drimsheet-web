import { RecentTransactionsContainer } from '@/account/pages/account-details/parts/recent-transactions.container';
import journalEntryService from '@/journal-entries/lib/services/journal-entry.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, it, vi } from 'vitest';

vi.mock('@/journal-entries/lib/services/journal-entry.service', () => ({
  default: { getJournalEntries: vi.fn() },
}));

it('waits for the account before fetching and retains loading until transactions arrive', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  const response = {
    data: [],
    meta: { page: 1, limit: 5, total: 0, totalPages: 0 },
  };

  let resolve!: (value: typeof response) => void;
  vi.mocked(journalEntryService.getJournalEntries).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    })
  );

  const { rerender, container } = render(
    <RecentTransactionsContainer loading />,
    { wrapper }
  );

  expect(
    screen.getByRole('status', { name: 'Loading recent transactions' })
  ).toBeInTheDocument();
  expect(journalEntryService.getJournalEntries).not.toHaveBeenCalled();

  rerender(<RecentTransactionsContainer />);
  expect(container).toBeEmptyDOMElement();
  expect(journalEntryService.getJournalEntries).not.toHaveBeenCalled();

  rerender(<RecentTransactionsContainer accountId="account-1" loading />);
  expect(
    screen.getByRole('status', { name: 'Loading recent transactions' })
  ).toBeInTheDocument();
  expect(journalEntryService.getJournalEntries).not.toHaveBeenCalled();

  rerender(<RecentTransactionsContainer accountId="account-1" />);
  await waitFor(() =>
    expect(
      journalEntryService.getJournalEntries
    ).toHaveBeenCalledExactlyOnceWith({
      accountId: 'account-1',
      page: 1,
      limit: 5,
      orderBy: 'effectiveDate',
      sortDirection: 'desc',
    })
  );
  expect(
    screen.getByRole('status', { name: 'Loading recent transactions' })
  ).toBeInTheDocument();
  resolve(response);
  expect(await screen.findByText('No transactions yet.')).toBeInTheDocument();
  expect(screen.getByRole('searchbox')).toBeInTheDocument();
  expect(
    screen.queryByRole('status', { name: 'Loading recent transactions' })
  ).not.toBeInTheDocument();
});
