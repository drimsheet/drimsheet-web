import { useCounterpartiesQueryKey } from '@/counterparty/hooks/use-counterparties';
import { useCreateCounterparty } from '@/counterparty/hooks/use-create-counterparty';
import { drimsheetApi } from '@/shared/lib/api';
import type {
  ICounterpartyCreateReq,
  ICounterpartyDto,
} from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/api', () => ({
  drimsheetApi: { counterparties: { createCounterparty: vi.fn() } },
}));

it('sends roleDetails through the create service and invalidates counterparty lists', async () => {
  const request: ICounterpartyCreateReq = {
    name: 'Example vendor',
    type: 'organization',
    status: 'active',
    roleDetails: { vendor: { address: null } },
  };

  const created: ICounterpartyDto = {
    id: 'party',
    name: request.name,
    type: request.type,
    status: request.status,
    roles: ['vendor'],
    roleDetails: { vendor: { address: null } },
    accountingEntityId: 'entity',
    createdBy: 'user',
    createdAt: '2026-11-03T00:00:00Z',
    updatedAt: '2026-11-03T00:00:00Z',
  };

  vi.mocked(drimsheetApi.counterparties.createCounterparty).mockResolvedValue({
    data: created,
  } as Awaited<
    ReturnType<typeof drimsheetApi.counterparties.createCounterparty>
  >);
  const client = new QueryClient();
  const listKey = [...useCounterpartiesQueryKey, { page: 1 }];
  client.setQueryData(listKey, []);

  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useCreateCounterparty(), { wrapper });

  await act(async () => {
    expect(await result.current.mutateAsync(request)).toEqual(created);
  });

  expect(
    drimsheetApi.counterparties.createCounterparty
  ).toHaveBeenCalledExactlyOnceWith(request);
  expect(client.getQueryState(listKey)?.isInvalidated).toBe(true);
  client.clear();
});
