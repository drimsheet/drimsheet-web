import { useCounterpartiesQueryKey } from '@/counterparty/hooks/use-counterparties';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import { CounterpartyOverviewContainer } from '@/counterparty/pages/counterparties/parts/counterparty-overview.container';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

function renderOverview() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <CounterpartyOverviewContainer />
    </QueryClientProvider>
  );

  return client;
}

afterEach(() => vi.restoreAllMocks());

describe('CounterpartyOverviewContainer', () => {
  it('uses independent role totals and refreshes them when counterparties change', async () => {
    let vendorTotal = 42;

    const request = vi
      .spyOn(counterpartyService, 'getCounterparties')
      .mockImplementation(async (query) => ({
        data: [],
        meta: {
          page: 1,
          limit: 1,
          total: query.roles?.[0] === 'vendor' ? vendorTotal : 7,
          totalPages: 42,
        },
      }));

    const client = renderOverview();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading people and businesses overview'
    );
    expect(await screen.findByText('42')).toBeVisible();
    expect(screen.getAllByText('7')).toHaveLength(2);
    for (const role of ['employer', 'vendor', 'contractor']) {
      expect(request).toHaveBeenCalledWith({
        page: 1,
        limit: 1,
        roles: [role],
      });
    }

    vendorTotal = 43;
    await act(() =>
      client.invalidateQueries({ queryKey: useCounterpartiesQueryKey })
    );
    expect(await screen.findByText('43')).toBeVisible();
  });

  it('renders zero totals after a successful empty response', async () => {
    vi.spyOn(counterpartyService, 'getCounterparties').mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 1, total: 0, totalPages: 0 },
    });
    renderOverview();
    await waitFor(() => expect(screen.getAllByText('0')).toHaveLength(3));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an error rather than partial or fabricated totals when one role fails', async () => {
    vi.spyOn(counterpartyService, 'getCounterparties').mockImplementation(
      async (query) => {
        if (query.roles?.[0] === 'vendor') {
          throw new Error('Unavailable');
        }

        return {
          data: [],
          meta: { page: 1, limit: 1, total: 7, totalPages: 7 },
        };
      }
    );
    renderOverview();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load people and business totals.'
    );
    expect(screen.queryByText('7')).not.toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
