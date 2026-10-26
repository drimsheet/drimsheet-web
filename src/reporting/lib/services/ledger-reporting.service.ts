import { drimsheetApi } from '@/shared/lib/api';
import type {
  IDateRangeDto,
  IGetAccountActivityByTypesQuery,
  IGetAccountBalanceContributionsByCounterpartyQuery,
  IGetAccountCashFlowQuery,
  IGetBalanceHistoryByAccountQuery,
  IGetBalanceHistoryByBehaviorQuery,
  IGetBalanceHistoryBySubTypeQuery,
  IGetBalanceHistoryByTypeQuery,
  IGetCurrentAssetAndLiabilityBalancesByCurrencyQuery,
  IGetCurrentTotalBalanceByTypeQuery,
  IGetLedgerTotalDebitsAndCreditsByCurrencyQuery,
  IGetRevenueExpenseAndSuspenseAccountBalancesQuery,
} from '@/shared/lib/api/Api';

async function getAccountCashFlow(
  accountId: string,
  query: IGetAccountCashFlowQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getAccountCashFlow(accountId, query, {
      signal,
    })
  ).data;
}

async function getAccountBalanceContributionsByCounterparty(
  accountId: string,
  query?: IGetAccountBalanceContributionsByCounterpartyQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getAccountBalanceContributionsByCounterparty(
      accountId,
      query,
      { signal }
    )
  ).data;
}

async function getCurrentAssetAndLiabilityBalancesByCurrency(
  query: IGetCurrentAssetAndLiabilityBalancesByCurrencyQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getCurrentAssetAndLiabilityBalancesByCurrency(
      query,
      {
        signal,
      }
    )
  ).data;
}

async function getBalanceHistoryByAccount(
  query: IGetBalanceHistoryByAccountQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getBalanceHistoryByAccount(query, { signal })
  ).data;
}

async function getBalanceHistoryByBehavior(
  query: IGetBalanceHistoryByBehaviorQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getBalanceHistoryByBehavior(query, { signal })
  ).data;
}

async function getBalanceHistoryBySubType(
  query: IGetBalanceHistoryBySubTypeQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getBalanceHistoryBySubType(query, { signal })
  ).data;
}

async function getBalanceHistoryByType(
  query: IGetBalanceHistoryByTypeQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getBalanceHistoryByType(query, { signal })
  ).data;
}

async function getLedgerTotalDebitsAndCreditsByCurrency(
  query: IGetLedgerTotalDebitsAndCreditsByCurrencyQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getLedgerTotalDebitsAndCreditsByCurrency(
      query,
      { signal }
    )
  ).data;
}

async function getRevenueExpenseAndSuspenseAccountBalances(
  query?: IGetRevenueExpenseAndSuspenseAccountBalancesQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getRevenueExpenseAndSuspenseAccountBalances(
      query,
      { signal }
    )
  ).data;
}

async function getRevenueAndExpenseActivitySummary(
  query: IDateRangeDto,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getRevenueAndExpenseActivitySummary(query, {
      signal,
    })
  ).data;
}

async function getAccountActivityByTypes(
  query: IGetAccountActivityByTypesQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getAccountActivityByTypes(query, { signal })
  ).data;
}

async function getCurrentTotalBalanceByType(
  query: IGetCurrentTotalBalanceByTypeQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getCurrentTotalBalanceByType(query, {
      signal,
    })
  ).data;
}

export const ledgerReportingService = Object.freeze({
  getAccountActivityByTypes,
  getCurrentTotalBalanceByType,
  getAccountCashFlow,
  getAccountBalanceContributionsByCounterparty,
  getCurrentAssetAndLiabilityBalancesByCurrency,
  getBalanceHistoryByAccount,
  getBalanceHistoryByBehavior,
  getBalanceHistoryBySubType,
  getBalanceHistoryByType,
  getLedgerTotalDebitsAndCreditsByCurrency,
  getRevenueExpenseAndSuspenseAccountBalances,
  getRevenueAndExpenseActivitySummary,
});
