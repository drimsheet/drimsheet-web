import { accountingService } from '@/accounting/lib/services/accounting.service';
import { OverviewContainer } from '@/counterparty/pages/counterparty-details/parts/overview.container';
import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/accounting/lib/services/accounting.service', () => ({
  accountingService: {
    getAccountingEntityId: vi.fn(() => 'entity'),
    getCurrentFiscalYear: vi.fn(),
  },
}));
vi.mock('@/reporting/lib/services/ledger-reporting.service', () => ({
  ledgerReportingService: { getCounterpartyAccountTypeParticipation: vi.fn() },
}));

function renderOverview(id?: string) {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <OverviewContainer counterpartyId={id} />
    </QueryClientProvider>
  );
}

beforeEach(() => vi.resetAllMocks());
it('waits for a counterparty before reading reporting data', () => {
  renderOverview();
  expect(accountingService.getCurrentFiscalYear).not.toHaveBeenCalled();
  expect(
    ledgerReportingService.getCounterpartyAccountTypeParticipation
  ).not.toHaveBeenCalled();
});
it('scopes participation to the party and fiscal year and formats signed minor units', async () => {
  vi.mocked(accountingService.getAccountingEntityId).mockReturnValue('entity');
  vi.mocked(accountingService.getCurrentFiscalYear).mockResolvedValue({
    id: 'year',
  } as Awaited<ReturnType<typeof accountingService.getCurrentFiscalYear>>);
  vi.mocked(
    ledgerReportingService.getCounterpartyAccountTypeParticipation
  ).mockResolvedValue({
    counterpartyId: 'party',
    fiscalYearId: 'year',
    period: { from: '2026-01-01', to: '2026-12-31' },
    revenue: { amount: -310025, currencyCode: 'NGN', isMinorUnit: true },
    expense: { amount: 0, currencyCode: 'NGN', isMinorUnit: true },
  });
  renderOverview('party');
  await waitFor(() => expect(screen.getByText('Total income')).toBeVisible());
  expect(
    ledgerReportingService.getCounterpartyAccountTypeParticipation
  ).toHaveBeenCalledWith(
    'party',
    { fiscalYearId: 'year' },
    expect.any(AbortSignal)
  );
  expect(screen.getByText(/3,100.25/)).toHaveTextContent(/-/);
  expect(screen.getByText('Total expenses')).toBeVisible();
  expect(screen.getByText(/NGN\s*0/)).toBeVisible();
});
it('shows a translated error when fiscal year resolution fails without requesting totals', async () => {
  vi.mocked(accountingService.getAccountingEntityId).mockReturnValue('entity');
  vi.mocked(accountingService.getCurrentFiscalYear).mockRejectedValue(
    new Error('unavailable')
  );
  renderOverview('party');
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unable to load income and expenses. Refresh the page to try again.'
  );
  expect(
    ledgerReportingService.getCounterpartyAccountTypeParticipation
  ).not.toHaveBeenCalled();
  expect(screen.queryByText('Total income')).not.toBeInTheDocument();
});
