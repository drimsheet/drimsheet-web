import { useJurisdictions } from '@/shared/hooks/use-jurisdictions';
import { jurisdictionService } from '@/shared/lib/services/jurisdiction.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/services/jurisdiction.service', () => ({
  jurisdictionService: { getJurisdictions: vi.fn() },
}));

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return { wrapper, client };
}

beforeEach(() => vi.resetAllMocks());

it('defers jurisdiction transport until requested', async () => {
  vi.mocked(jurisdictionService.getJurisdictions).mockResolvedValue([]);

  const { result, rerender } = renderHook(
    ({ enabled }) => useJurisdictions({ enabled }),
    { ...setup(), initialProps: { enabled: false } }
  );

  expect(jurisdictionService.getJurisdictions).not.toHaveBeenCalled();
  rerender({ enabled: true });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(jurisdictionService.getJurisdictions).toHaveBeenCalledOnce();
});

it('lets a dialog handle read failures locally when requested', async () => {
  const error = new Error('offline');
  const { client, wrapper } = setup();
  const key = ['jurisdictionService', 'getJurisdictions'];
  client.setQueryData(key, []);
  vi.mocked(jurisdictionService.getJurisdictions).mockRejectedValue(error);

  const { result } = renderHook(
    () => useJurisdictions({ throwOnError: false, scope: 'dialog' }),
    { wrapper }
  );

  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.error).toBe(error);
  expect(client.getQueryData(key)).toEqual([]);
  expect(client.getQueryState(key)?.status).toBe('success');
});
