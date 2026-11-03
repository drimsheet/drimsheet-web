import { accountingService } from '@/accounting/lib/services/accounting.service';
import {
  ReportingIntervalSelectContainer,
  type ReportingIntervalSelectContainerProps,
} from '@/reporting/components/reporting-interval-select';
import type { IFiscalYear, IReportingInterval } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
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

function renderSelect(props: ReportingIntervalSelectContainerProps) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  }

  return render(<ReportingIntervalSelectContainer {...props} />, {
    wrapper: Wrapper,
  });
}

function trigger() {
  return screen.getByRole('button', { name: 'Interval' });
}

describe('ReportingIntervalSelectContainer', () => {
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

  it('owns dependent loading and emits only the initial date range', async () => {
    const onChange = vi.fn();
    let resolveYear!: (value: IFiscalYear) => void;
    let resolveInterval!: (value: IReportingInterval) => void;
    vi.mocked(accountingService.getCurrentFiscalYear).mockReturnValue(
      new Promise((resolve) => {
        resolveYear = resolve;
      })
    );
    vi.mocked(accountingService.getReportingInterval).mockReturnValue(
      new Promise((resolve) => {
        resolveInterval = resolve;
      })
    );
    renderSelect({ onChange });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading reporting periods'
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(accountingService.getReportingInterval).not.toHaveBeenCalled();
    await act(async () => resolveYear(year));
    await waitFor(() =>
      expect(accountingService.getReportingInterval).toHaveBeenCalledWith(
        'year',
        expect.any(AbortSignal)
      )
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading reporting periods'
    );
    expect(onChange).not.toHaveBeenCalled();
    await act(async () => resolveInterval(interval));
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledExactlyOnceWith({
        from: '2024-01-01',
        to: '2024-01-31',
      })
    );
    expect(trigger()).toHaveTextContent('January');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it.each(['getCurrentFiscalYear', 'getReportingInterval'] as const)(
    'displays its own error without emitting query status when %s fails',
    async (method) => {
      vi.mocked(accountingService[method]).mockRejectedValue(
        new Error('Unavailable')
      );
      const onChange = vi.fn();
      renderSelect({ onChange });
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Unable to load reporting periods. Refresh the page to try again.'
      );
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Interval' })
      ).not.toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
      if (method === 'getCurrentFiscalYear') {
        expect(accountingService.getReportingInterval).not.toHaveBeenCalled();
      }
    }
  );

  it('displays range validation locally and emits the next valid applied range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSelect({ onChange });
    await screen.findByRole('button', { name: 'Interval' });
    onChange.mockClear();
    await user.click(trigger());
    await user.click(screen.getByRole('radio', { name: 'All time' }));
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Select a date range of 366 days or fewer.'
    );
    expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
    await user.click(trigger());
    const end = screen.getByRole('textbox', { name: 'End date' });
    await user.clear(end);
    await user.type(end, '2024-12-31');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenLastCalledWith({
      from: '2024-01-01',
      to: '2024-12-31',
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('accepts changing callbacks without replaying a selection or resetting an open draft', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const nextOnChange = vi.fn();
    const { rerender } = renderSelect({ onChange });
    await screen.findByRole('button', { name: 'Interval' });
    await user.click(trigger());
    const end = screen.getByRole('textbox', { name: 'End date' });
    await user.clear(end);
    await user.type(end, '2024-01-15');
    rerender(<ReportingIntervalSelectContainer onChange={nextOnChange} />);
    expect(end).toHaveValue('2024-01-15');
    expect(nextOnChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(nextOnChange).toHaveBeenCalledExactlyOnceWith({
      from: '2024-01-01',
      to: '2024-01-15',
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('forwards the disabled state to the selector', async () => {
    renderSelect({ onChange: vi.fn(), disabled: true });
    expect(
      await screen.findByRole('button', { name: 'Interval' })
    ).toBeDisabled();
  });
});
