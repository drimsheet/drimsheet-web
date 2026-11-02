import { CounterpartiesTableContainer } from '@/counterparty/components/counterparties-table';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

function renderTable() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter
        initialEntries={[
          '/counterparties?page=2&status=active&sort=name&order=desc',
        ]}
      >
        <CounterpartiesTableContainer />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

afterEach(() => vi.restoreAllMocks());

describe('CounterpartiesTableContainer', () => {
  it('paginates and resets search to page one while retaining sorting and filters', async () => {
    const user = userEvent.setup();

    const request = vi
      .spyOn(counterpartyService, 'getCounterparties')
      .mockImplementation(async (query) => ({
        data: [],
        meta: {
          page: query.page ?? 1,
          limit: query.limit ?? 10,
          total: 60,
          totalPages: Math.ceil(60 / (query.limit ?? 10)),
        },
      }));

    renderTable();
    await screen.findByText('Page 2 of 6');
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await screen.findByText('Page 3 of 6');
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 3,
        limit: 10,
        status: 'active',
        orderBy: 'name',
        sortDirection: 'desc',
      })
    );
    expect(screen.getByText('21–30 of 60')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    await screen.findByText('Page 2 of 6');
    expect(
      screen.queryByRole('combobox', { name: 'Rows per page' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'First page' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Last page' })
    ).not.toBeInTheDocument();
    await user.type(screen.getByRole('searchbox'), 'Alice');
    await waitFor(() =>
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          search: 'Alice',
          status: 'active',
          orderBy: 'name',
          sortDirection: 'desc',
        })
      )
    );
    expect(
      screen.queryByRole('button', { name: 'Add person or business' })
    ).not.toBeInTheDocument();
  });

  it('shows a failed list request as an error rather than an empty table', async () => {
    vi.spyOn(counterpartyService, 'getCounterparties').mockRejectedValue(
      new Error('Unavailable')
    );
    renderTable();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load people and businesses.'
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
