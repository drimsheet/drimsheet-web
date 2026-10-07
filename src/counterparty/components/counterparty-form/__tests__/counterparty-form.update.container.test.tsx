import {
  CounterpartyFormSkeleton,
  CounterpartyFormUpdateContainer,
} from '@/counterparty/components/counterparty-form';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';

vi.mock('@/counterparty/lib/services/counterparty.service', () => ({
  counterpartyService: {
    createCounterparty: vi.fn(),
    getCounterparty: vi.fn(),
    getCounterpartyTransactions: vi.fn(),
    updateCounterparty: vi.fn(),
  },
}));
vi.mock('@/shared/lib/services/observability.service', () => ({
  observabilityService: { addApiFailureBreadcrumb: vi.fn(), report: vi.fn() },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const created: ICounterpartyDto = {
  id: 'counterparty',
  name: 'Example',
  type: 'individual',
  status: 'active',
  roles: [],
  meta: {},
  createdBy: 'user',
  accountingEntityId: 'entity',
  createdAt: '2026-10-05T00:00:00Z',
  updatedAt: '2026-10-05T00:00:00Z',
};

beforeEach(() => vi.resetAllMocks());

it('fetches by ID and PATCHes changes instead of creating', async () => {
  const baseline: ICounterpartyDto = {
    id: '00000000-0000-4000-8000-000000000100',
    name: 'Original',
    type: 'organization',
    status: 'active',
    roles: [],
    meta: {},
    createdBy: 'user',
    accountingEntityId: 'entity',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

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
      <CounterpartyFormUpdateContainer
        loadingFallback={<CounterpartyFormSkeleton />}
        counterpartyId={baseline.id}
        onSuccess={onSuccess}
      />
    </QueryClientProvider>
  );
  const name = await screen.findByLabelText('Name');
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

it('starts a fresh edit session when its counterparty ID changes', async () => {
  const first = {
    ...created,
    id: '00000000-0000-4000-8000-000000000100',
  };

  const second = {
    ...created,
    id: '00000000-0000-4000-8000-000000000101',
    name: 'Second',
  };

  vi.mocked(counterpartyService.getCounterparty).mockImplementation(
    async (id) => (id === first.id ? first : second)
  );
  vi.mocked(counterpartyService.getCounterpartyTransactions).mockResolvedValue({
    data: [],
    meta: { page: 1, limit: 1, total: 0, totalPages: 0 },
  });
  vi.mocked(counterpartyService.updateCounterparty).mockResolvedValue({
    ...second,
    name: 'Changed',
  });

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  const onSuccess = vi.fn();

  const { rerender } = render(
    <CounterpartyFormUpdateContainer
      loadingFallback={<CounterpartyFormSkeleton />}
      counterpartyId={first.id}
      onSuccess={onSuccess}
    />,
    { wrapper }
  );

  await waitFor(() =>
    expect(screen.getByLabelText('Name')).toHaveValue('Example')
  );
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Name'), ' unsaved');
  rerender(
    <CounterpartyFormUpdateContainer
      loadingFallback={<CounterpartyFormSkeleton />}
      counterpartyId={second.id}
      onSuccess={onSuccess}
    />
  );
  await waitFor(() =>
    expect(screen.getByLabelText('Name')).toHaveValue('Second')
  );
  await user.clear(screen.getByLabelText('Name'));
  await user.type(screen.getByLabelText('Name'), 'Changed');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  expect(
    counterpartyService.updateCounterparty
  ).toHaveBeenCalledExactlyOnceWith(second.id, {
    name: 'Changed',
  });
  client.clear();
});
