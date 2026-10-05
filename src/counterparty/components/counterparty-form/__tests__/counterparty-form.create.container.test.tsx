import { CounterpartyFormCreateContainer } from '@/counterparty/components/counterparty-form';
import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
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
  version: 1,
  createdBy: 'user',
  accountingEntityId: 'entity',
  createdAt: '2026-10-05T00:00:00Z',
  updatedAt: '2026-10-05T00:00:00Z',
};

function setup() {
  const onSuccess = vi.fn();

  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <CounterpartyFormCreateContainer onSuccess={onSuccess} />
    </QueryClientProvider>
  );

  return { onSuccess, client, user: userEvent.setup() };
}

beforeEach(() => vi.resetAllMocks());

it('waits for persistence before completing and prevents another submit while saving', async () => {
  let resolve!: (party: ICounterpartyDto) => void;
  vi.mocked(counterpartyService.createCounterparty).mockReturnValue(
    new Promise((complete) => {
      resolve = complete;
    })
  );
  const { onSuccess, client, user } = setup();
  await user.type(screen.getByLabelText('Name'), 'Example');
  await user.click(screen.getByRole('button', { name: 'Create' }));
  await waitFor(() => expect(screen.getByLabelText('Name')).toBeDisabled());
  expect(onSuccess).not.toHaveBeenCalled();
  expect(
    counterpartyService.createCounterparty
  ).toHaveBeenCalledExactlyOnceWith({
    name: 'Example',
    type: 'individual',
    status: 'active',
  });
  expect(counterpartyService.getCounterparty).not.toHaveBeenCalled();
  expect(counterpartyService.updateCounterparty).not.toHaveBeenCalled();
  await act(async () => resolve(created));
  await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  expect(toast.success).toHaveBeenCalledWith(
    'Counterparty created successfully'
  );
  client.clear();
});

it('retains input and reports a failed create without closing the owner', async () => {
  vi.mocked(counterpartyService.createCounterparty).mockRejectedValue(
    new Error('offline')
  );
  const { onSuccess, client, user } = setup();
  await user.type(screen.getByLabelText('Name'), 'Example');
  await user.click(screen.getByRole('button', { name: 'Create' }));
  await waitFor(() => expect(toast.error).toHaveBeenCalled());
  expect(screen.getByLabelText('Name')).toHaveValue('Example');
  expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
  expect(onSuccess).not.toHaveBeenCalled();
  client.clear();
});
