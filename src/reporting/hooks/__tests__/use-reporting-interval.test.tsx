import { accountingService } from '@/accounting/lib/services/accounting.service';
import { useReportingInterval } from '@/reporting/hooks/use-reporting-interval';
import type { IFiscalYear, IReportingInterval } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useState, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/accounting/lib/services/accounting.service', () => ({
  accountingService: {
    getAccountingEntityId: vi.fn(),
    getCurrentFiscalYear: vi.fn(),
    getReportingInterval: vi.fn(),
  },
}));

const year: IFiscalYear = {
  id: 'year',
  createdBy: 'user',
  name: '2024',
  status: 'open',
  accountingEntityId: 'entity',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2025-12-31T00:00:00Z',
  closedAt: null,
  updatedAt: '2024-01-01T00:00:00Z',
};

const interval: IReportingInterval = {
  id: 'interval',
  accountingEntityId: 'entity',
  fiscalYearId: 'year',
  createdBy: 'user',
  createdAt: year.updatedAt,
  updatedAt: year.updatedAt,
  startDate: year.startDate,
  endDate: '2026-01-01T00:00:00Z',
  nextPeriodStartDate: '2024-02-01T00:00:00Z',
  count: 1,
  unit: 'month',
  currentPeriodOrdinal: 0,
  periods: [
    {
      id: 'january',
      accountingEntityId: 'entity',
      intervalId: 'interval',
      ordinal: 0,
      name: 'January',
      startDate: year.startDate,
      endDate: '2024-02-01T00:00:00Z',
      createdBy: 'user',
      createdAt: year.updatedAt,
      updatedAt: year.updatedAt,
    },
  ],
};

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useReportingInterval', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(accountingService.getAccountingEntityId).mockReturnValue(
      'entity'
    );
    vi.mocked(accountingService.getCurrentFiscalYear).mockResolvedValue(year);
    vi.mocked(accountingService.getReportingInterval).mockResolvedValue(
      interval
    );
  });

  it('loads reporting periods for the current fiscal year and waits for an applied selection', async () => {
    const { result } = renderHook(() => useReportingInterval(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.interval).toEqual(interval));
    expect(accountingService.getReportingInterval).toHaveBeenCalledWith(
      'year',
      expect.any(AbortSignal)
    );
    expect(result.current.range).toBeUndefined();
    act(() =>
      result.current.onChange({
        type: 'period',
        ordinal: 0,
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
      })
    );
    expect(result.current.range).toEqual({
      from: '2024-01-01',
      to: '2024-01-31',
    });
    expect(result.current.bucketDays).toBe(3);
  });

  it('does not load disabled reports', () => {
    renderHook(() => useReportingInterval(false), { wrapper: Wrapper });
    expect(accountingService.getCurrentFiscalYear).not.toHaveBeenCalled();
    expect(accountingService.getReportingInterval).not.toHaveBeenCalled();
  });

  it('reports a fiscal-year failure without leaving the control pending', async () => {
    vi.mocked(accountingService.getCurrentFiscalYear).mockRejectedValue(
      new Error('Unavailable')
    );

    const { result } = renderHook(() => useReportingInterval(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isPending).toBe(false);
    expect(accountingService.getReportingInterval).not.toHaveBeenCalled();
  });

  it('blocks overlong ranges and accepts a subsequent shorter selection', async () => {
    const { result } = renderHook(() => useReportingInterval(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.interval).toEqual(interval));
    act(() =>
      result.current.onChange({
        type: 'all-time',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2025, 11, 31),
      })
    );
    expect(result.current.isRangeTooLong).toBe(true);
    expect(result.current.range).toBeUndefined();
    act(() =>
      result.current.onChange({
        type: 'custom',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 11, 31),
      })
    );
    expect(result.current.isRangeTooLong).toBe(false);
    expect(result.current.range).toEqual({
      from: '2024-01-01',
      to: '2024-12-31',
    });
  });

  it('reports an interval load failure without constructing a report range', async () => {
    vi.mocked(accountingService.getReportingInterval).mockRejectedValue(
      new Error('Unavailable')
    );
    const { result } = renderHook(() => useReportingInterval(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isPending).toBe(false);
    expect(result.current.range).toBeUndefined();
  });

  it('does not reuse the applied range when the active entity changes', async () => {
    const { result, rerender } = renderHook(() => useReportingInterval(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.interval).toEqual(interval));
    act(() =>
      result.current.onChange({
        type: 'period',
        ordinal: 0,
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
      })
    );
    vi.mocked(accountingService.getAccountingEntityId).mockReturnValue(
      'another-entity'
    );
    vi.mocked(accountingService.getReportingInterval).mockResolvedValue({
      ...interval,
      accountingEntityId: 'another-entity',
    });
    rerender();
    expect(result.current.range).toBeUndefined();
    await waitFor(() =>
      expect(result.current.interval?.accountingEntityId).toBe('another-entity')
    );
    expect(result.current.range).toBeUndefined();
  });
});
