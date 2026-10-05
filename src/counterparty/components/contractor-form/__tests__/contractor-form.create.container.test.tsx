import { ContractorFormCreateContainer } from '@/counterparty/components/contractor-form';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import type { IJurisdictionDto } from '@/shared/lib/api/Api';
import { jurisdictionService } from '@/shared/lib/services/jurisdiction.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/services/jurisdiction.service', () => ({
  jurisdictionService: { getJurisdictions: vi.fn() },
}));

vi.mock('@/counterparty/lib/services/counterparty.service', () => ({
  counterpartyService: {
    createCounterparty: vi.fn(),
    getCounterparty: vi.fn(),
    getCounterpartyTransactions: vi.fn(),
    updateCounterparty: vi.fn(),
  },
}));

it('shows the contractor skeleton until country options are ready', async () => {
  let resolve!: (data: IJurisdictionDto[]) => void;
  vi.mocked(jurisdictionService.getJurisdictions).mockReturnValue(
    new Promise((complete) => {
      resolve = complete;
    })
  );

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <ContractorFormCreateContainer onSuccess={vi.fn()} />
    </QueryClientProvider>
  );
  expect(screen.getByRole('status')).toHaveAccessibleName(
    'Loading contractor form'
  );
  expect(screen.queryByLabelText(/Legal name/i)).not.toBeInTheDocument();
  await act(async () => resolve([]));
  expect(await screen.findByLabelText(/Legal name/i)).toBeEnabled();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(counterpartyService.getCounterparty).not.toHaveBeenCalled();
  expect(counterpartyService.updateCounterparty).not.toHaveBeenCalled();
  client.clear();
});
