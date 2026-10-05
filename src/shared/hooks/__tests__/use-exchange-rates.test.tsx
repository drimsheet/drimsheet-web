import { useExchangeRates } from '@/shared/hooks/use-exchange-rates';
import {
  EExchangeRateType,
  type IExchangeRate,
  type IExchangeRateQueryParam,
} from '@/shared/lib/api/Api';
import { currencyService } from '@/shared/lib/services/currency.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/services/currency.service', () => ({
  currencyService: {
    getExchangeRates: vi.fn(),
  },
}));

const query = {
  currencyPair: 'USD/NGN',
  type: EExchangeRateType.Official,
  asOf: '2026-08-10',
  limit: 1,
} satisfies IExchangeRateQueryParam;

const officialRate = {
  currencyPair: 'USD/NGN',
  baseCurrencyCode: 'USD',
  targetCurrencyCode: 'NGN',
  rate: 1500,
  type: EExchangeRateType.Official,
  asOf: '2026-08-10T00:00:00.000Z',
  source: 'central-bank',
  createdAt: '2026-08-10T01:00:00.000Z',
} satisfies IExchangeRate;

describe('useExchangeRates', () => {
  it('waits for a complete query and caches the returned rate by query', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    vi.mocked(currencyService.getExchangeRates).mockResolvedValue([
      officialRate,
    ]);

    const { rerender, result } = renderHook(
      ({
        exchangeRateQuery,
      }: {
        exchangeRateQuery?: IExchangeRateQueryParam;
      }) => useExchangeRates(exchangeRateQuery),
      {
        initialProps: { exchangeRateQuery: undefined } as {
          exchangeRateQuery?: IExchangeRateQueryParam;
        },
        wrapper,
      }
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(currencyService.getExchangeRates).not.toHaveBeenCalled();

    rerender({ exchangeRateQuery: query });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(currencyService.getExchangeRates).toHaveBeenCalledOnce();
    expect(currencyService.getExchangeRates).toHaveBeenCalledWith(query);
    expect(
      queryClient.getQueryData(['currencyService', 'getExchangeRates', query])
    ).toEqual([officialRate]);
  });
});
