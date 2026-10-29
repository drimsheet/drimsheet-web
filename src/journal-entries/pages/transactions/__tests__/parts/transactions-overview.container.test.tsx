import { accountingService } from '@/accounting/lib/services/accounting.service';
import { TransactionsOverviewContainer } from '@/journal-entries/pages/transactions/parts/transactions-overview.container';
import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import type { IFiscalYear } from '@/shared/lib/api/Api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/accounting/lib/services/accounting.service', () => ({
  accountingService: {
    getAccountingEntityId: vi.fn(() => 'entity'),
    getCurrentFiscalYear: vi.fn(),
  },
}));
vi.mock('@/reporting/lib/services/ledger-reporting.service', () => ({
  ledgerReportingService: {
    getCurrentTotalBalanceByType: vi.fn(),
    getLedgerTotalDebitsAndCreditsByCurrency: vi.fn(),
  },
}));

const year: IFiscalYear = {
  id: 'current-year',
  name: '2026',
  accountingEntityId: 'entity',
  createdBy: 'user',
  status: 'open',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  closedAt: null,
  updatedAt: '2026-01-01',
};

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={client}>
      <TransactionsOverviewContainer />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(accountingService.getCurrentFiscalYear).mockResolvedValue(year);
  vi.mocked(
    ledgerReportingService.getCurrentTotalBalanceByType
  ).mockImplementation(async ({ type }) => ({
    totalFunctionalBalance: {
      amount: type === 'revenue' ? 11063 : 12075,
      currencyCode: 'USD',
      isMinorUnit: false,
    },
  }));
  vi.mocked(
    ledgerReportingService.getLedgerTotalDebitsAndCreditsByCurrency
  ).mockImplementation(async ({ type, fiscalYearId }) => ({
    fiscalYearId,
    period: { from: '2026-01-01', to: '2026-10-26' },
    totalsByCurrency: [
      {
        delta: {
          amount: type === 'revenue' ? 827000 : 327500,
          currencyCode: 'USD',
          isMinorUnit: true,
        },
        totalCredits: { amount: 999, currencyCode: 'USD', isMinorUnit: false },
        totalDebits: { amount: 888, currencyCode: 'USD', isMinorUnit: false },
      },
    ],
  }));
});

describe('TransactionsOverviewContainer', () => {
  it('waits for the current year and renders functional totals and signed currency deltas', async () => {
    let resolveYear!: (year: IFiscalYear) => void;
    vi.mocked(accountingService.getCurrentFiscalYear).mockReturnValue(
      new Promise((resolve) => {
        resolveYear = resolve;
      })
    );
    setup();
    expect(
      screen.getByRole('status', { name: 'Loading transaction overview' })
    ).toBeInTheDocument();
    expect(
      ledgerReportingService.getLedgerTotalDebitsAndCreditsByCurrency
    ).not.toHaveBeenCalled();
    await act(async () => resolveYear(year));
    expect(await screen.findByText('$11,063')).toBeVisible();
    expect(screen.getByText('$12,075')).toBeVisible();

    const region = screen.getByRole('region', {
      name: 'Transactions by currency',
    });

    expect(within(region).getByText('$8,270').parentElement).toHaveTextContent(
      'Inflow: +$8,270'
    );
    expect(within(region).getByText('-$3,275').parentElement).toHaveTextContent(
      'Outflow: -$3,275'
    );
    for (const type of ['revenue', 'expense']) {
      expect(
        ledgerReportingService.getCurrentTotalBalanceByType
      ).toHaveBeenCalledWith({ type }, expect.any(AbortSignal));
      expect(
        ledgerReportingService.getLedgerTotalDebitsAndCreditsByCurrency
      ).toHaveBeenCalledWith(
        { type, fiscalYearId: 'current-year' },
        expect.any(AbortSignal)
      );
    }
  });

  it('shows an empty state when neither currency report has activity', async () => {
    vi.mocked(
      ledgerReportingService.getLedgerTotalDebitsAndCreditsByCurrency
    ).mockResolvedValue({
      fiscalYearId: year.id,
      period: { from: '2026-01-01', to: '2026-10-26' },
      totalsByCurrency: [],
    });
    setup();
    expect(
      await screen.findByText(
        'No transaction activity in the current fiscal year.'
      )
    ).toBeVisible();
  });

  it.each(['fiscalYear', 'balance', 'currency'])(
    'shows a translated error when %s fails',
    async (source) => {
      if (source === 'fiscalYear') {
        vi.mocked(accountingService.getCurrentFiscalYear).mockRejectedValue(
          new Error('failed')
        );
      }

      if (source === 'balance') {
        vi.mocked(
          ledgerReportingService.getCurrentTotalBalanceByType
        ).mockRejectedValue(new Error('failed'));
      }

      if (source === 'currency') {
        vi.mocked(
          ledgerReportingService.getLedgerTotalDebitsAndCreditsByCurrency
        ).mockRejectedValue(new Error('failed'));
      }

      setup();
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Couldn’t load transaction overview'
      );
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.queryByText('$11,063')).not.toBeInTheDocument();
    }
  );
});
