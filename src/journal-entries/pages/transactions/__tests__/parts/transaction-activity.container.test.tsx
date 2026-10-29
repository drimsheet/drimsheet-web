import { TransactionActivityContainer } from '@/journal-entries/pages/transactions/parts/transaction-activity.container';
import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import type { IAccountActivityByTypesDto } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/accounting/lib/services/accounting.service', () => ({
  accountingService: { getAccountingEntityId: () => 'entity' },
}));
vi.mock('@/reporting/lib/services/ledger-reporting.service', () => ({
  ledgerReportingService: { getAccountActivityByTypes: vi.fn() },
}));

function report(date: string, amount: number): IAccountActivityByTypesDto {
  const money = { amount, currencyCode: 'USD', isMinorUnit: false };

  return {
    currencyCode: 'USD',
    period: { from: date, to: date },
    buckets: [
      {
        from: date,
        to: date,
        activity: [
          {
            type: 'revenue',
            delta: money,
            totalCredits: money,
            totalDebits: { ...money, amount: 0 },
          },
        ],
      },
    ],
  };
}

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={client}>
      <TransactionActivityContainer />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 26, 12));
  vi.resetAllMocks();
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.releasePointerCapture = () => {};

  HTMLElement.prototype.scrollIntoView = () => {};
});
afterEach(() => vi.useRealTimers());

describe('TransactionActivityContainer', () => {
  it('requests daily activity for the selected month and excludes future months', async () => {
    const user = userEvent.setup();
    vi.mocked(
      ledgerReportingService.getAccountActivityByTypes
    ).mockImplementation(async ({ from }) =>
      report(from, from === '2026-10-01' ? 900 : 420)
    );
    setup();
    expect(
      await screen.findByRole('region', { name: 'Daily inflow and outflow' })
    ).toBeVisible();
    expect(
      ledgerReportingService.getAccountActivityByTypes
    ).toHaveBeenCalledWith(
      {
        from: '2026-10-01',
        to: '2026-10-26',
        bucketDays: 1,
        types: ['revenue', 'expense'],
      },
      expect.any(AbortSignal)
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Activity month' }));
    await user.click(screen.getByRole('option', { name: 'September 2026' }));
    expect(
      await screen.findByRole('region', { name: 'Daily inflow and outflow' })
    ).toBeVisible();
    expect(screen.getByLabelText('Activity month')).toHaveTextContent(
      'September 2026'
    );
    expect(
      ledgerReportingService.getAccountActivityByTypes
    ).toHaveBeenLastCalledWith(
      {
        from: '2026-09-01',
        to: '2026-09-30',
        bucketDays: 1,
        types: ['revenue', 'expense'],
      },
      expect.any(AbortSignal)
    );

    await user.click(screen.getByRole('combobox', { name: 'Activity month' }));
    expect(
      screen.queryByRole('option', { name: 'November 2026' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'February 2026' }));
    expect(
      await screen.findByRole('region', { name: 'Daily inflow and outflow' })
    ).toBeVisible();
    expect(
      ledgerReportingService.getAccountActivityByTypes
    ).toHaveBeenLastCalledWith(
      {
        from: '2026-02-01',
        to: '2026-02-28',
        bucketDays: 1,
        types: ['revenue', 'expense'],
      },
      expect.any(AbortSignal)
    );
  });

  it('replaces previous-month values with loading states, then shows a translated failure', async () => {
    const user = userEvent.setup();
    vi.mocked(
      ledgerReportingService.getAccountActivityByTypes
    ).mockResolvedValueOnce(report('2026-10-01', 900));
    let reject!: (error: Error) => void;
    vi.mocked(
      ledgerReportingService.getAccountActivityByTypes
    ).mockImplementationOnce(
      () =>
        new Promise((_, fail) => {
          reject = fail;
        })
    );
    setup();
    expect(
      await screen.findByRole('region', { name: 'Daily inflow and outflow' })
    ).toBeVisible();
    await user.click(screen.getByRole('combobox', { name: 'Activity month' }));
    await user.click(screen.getByRole('option', { name: 'September 2026' }));
    expect(screen.queryByText('$900')).not.toBeInTheDocument();
    expect(screen.getAllByRole('status')).toHaveLength(1);
    await act(async () => reject(new Error('unavailable')));
    expect(
      await screen.findByText('Couldn’t load transaction activity')
    ).toBeVisible();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByLabelText('Activity month')).toHaveTextContent(
      'September 2026'
    );
  });

  it('shows an empty chart without extra controls or messages', async () => {
    vi.mocked(
      ledgerReportingService.getAccountActivityByTypes
    ).mockResolvedValue({
      currencyCode: 'USD',
      period: { from: '2026-10-01', to: '2026-10-26' },
      buckets: [],
    });
    setup();
    expect(
      await screen.findByRole('region', { name: 'Daily inflow and outflow' })
    ).toBeVisible();
    expect(
      screen.queryByText('No transaction activity in this period.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Inspect daily activity' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
