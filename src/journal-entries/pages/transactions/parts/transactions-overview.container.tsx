import { accountingService } from '@/accounting/lib/services/accounting.service';
import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import { useQueries, useQuery } from '@tanstack/react-query';
import transactionsHelpers from '../helper';
import { TransactionsOverviewWithState } from './transactions-overview';

export function TransactionsOverviewContainer() {
  const entityId = accountingService.getAccountingEntityId();

  const fiscalYear = useQuery({
    queryKey: ['accountingService', 'getCurrentFiscalYear', entityId],
    queryFn: ({ signal }) => accountingService.getCurrentFiscalYear(signal),
    throwOnError: false,
  });

  const balances = useQueries({
    queries: (['revenue', 'expense'] as const).map((type) => ({
      queryKey: [
        'ledgerReportingService',
        'getTotalBalanceByType',
        { type },
        entityId,
      ],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        ledgerReportingService.getTotalBalanceByType({ type }, signal),
      throwOnError: false,
    })),
  });

  const fiscalYearId = fiscalYear.data?.id ?? '';

  const activity = useQueries({
    queries: (['revenue', 'expense'] as const).map((type) => ({
      queryKey: [
        'ledgerReportingService',
        'getLedgerTotalDebitsAndCreditsByCurrency',
        { type, fiscalYearId },
        entityId,
      ],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        ledgerReportingService.getLedgerTotalDebitsAndCreditsByCurrency(
          { type, fiscalYearId },
          signal
        ),
      enabled: !!fiscalYearId,
      throwOnError: false,
    })),
  });

  const queries = [fiscalYear, ...balances, ...activity];

  if (queries.some((query) => query.isError)) {
    return <TransactionsOverviewWithState state="error" />;
  }

  const [inflow, outflow] = balances;
  const [revenue, expense] = activity;

  if (!inflow.data || !outflow.data || !revenue.data || !expense.data) {
    return <TransactionsOverviewWithState state="loading" />;
  }

  return (
    <TransactionsOverviewWithState
      state="success"
      data={{
        inflow: inflow.data.totalFunctionalBalance,
        outflow: outflow.data.totalFunctionalBalance,
        currencies: transactionsHelpers.mergeCurrencies(
          revenue.data,
          expense.data
        ),
      }}
    />
  );
}
