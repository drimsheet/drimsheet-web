import {
  VendorFormSkeleton,
  VendorFormUpdateContainer,
} from '@/counterparty/components/vendor-form';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { jurisdictionService } from '@/shared/lib/services/jurisdiction.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

it('fetches by ID and PATCHes changes instead of creating', async () => {
  const baseline: ICounterpartyDto = {
    id: '00000000-0000-4000-8000-000000000100',
    name: 'Original',
    type: 'organization',
    status: 'active',
    roles: ['vendor'],
    meta: {
      vendor: {
        address: {
          line1: '14 Marina Road',
          line2: '',
          city: 'Lagos',
          region: '',
          countryCode: 'NG',
          postalCode: '100001',
        },
      },
    },
    createdBy: 'user',
    accountingEntityId: 'entity',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  vi.mocked(jurisdictionService.getJurisdictions).mockResolvedValue([
    {
      code: 'NG',
      name: 'Nigeria',
      currencyCode: 'NGN',
      maxFiscalMonths: 12,
      accountingStandards: {
        individual: ['IFRS'],
        sole_trader: ['IFRS'],
        private_company: ['IFRS'],
      },
    },
  ]);
  vi.mocked(counterpartyService.getCounterparty).mockResolvedValue(baseline);
  vi.mocked(counterpartyService.getCounterpartyTransactions).mockResolvedValue({
    data: [],
    meta: { page: 1, limit: 1, total: 0, totalPages: 0 },
  });
  vi.mocked(counterpartyService.updateCounterparty).mockResolvedValue({
    ...baseline,
    name: 'Changed',
  });
  vi.mocked(counterpartyService.createCounterparty).mockClear();

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const onSuccess = vi.fn();
  render(
    <QueryClientProvider client={client}>
      <VendorFormUpdateContainer
        loadingFallback={<VendorFormSkeleton />}
        counterpartyId={baseline.id}
        onSuccess={onSuccess}
      />
    </QueryClientProvider>
  );
  const name = await screen.findByLabelText('Legal name');
  expect(name).toHaveValue('Original');
  const user = userEvent.setup();
  await user.clear(name);
  await user.type(name, 'Changed');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  expect(counterpartyService.getCounterparty).toHaveBeenCalledWith(baseline.id);
  expect(
    counterpartyService.updateCounterparty
  ).toHaveBeenCalledExactlyOnceWith(baseline.id, {
    name: 'Changed',
  });
  expect(counterpartyService.createCounterparty).not.toHaveBeenCalled();
  client.clear();
});
