import { drimsheetApi } from '@/shared/lib/api';
import type {
  IDateRangeDto,
  IGetAccountCashFlowQuery,
  IGetAccountCounterpartyParticipationQuery,
  IGetAssetAndLiabilityBalancesByCurrencyQuery,
  IGetBalancesByAccountQuery,
  IGetBalancesByBehaviorQuery,
  IGetBalancesBySubTypeQuery,
  IGetBalancesByTypeQuery,
  IGetLedgerTotalDebitsAndCreditsByCurrencyQuery,
  IGetRevenueExpenseAccountsQuery,
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

async function getAccountCounterpartyParticipation(
  accountId: string,
  query?: IGetAccountCounterpartyParticipationQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getAccountCounterpartyParticipation(
      accountId,
      query,
      { signal }
    )
  ).data;
}

async function getAssetAndLiabilityBalancesByCurrency(
  query: IGetAssetAndLiabilityBalancesByCurrencyQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getAssetAndLiabilityBalancesByCurrency(query, {
      signal,
    })
  ).data;
}

async function getBalancesByAccount(
  query: IGetBalancesByAccountQuery,
  signal?: AbortSignal
) {
  return (await drimsheetApi.reporting.getBalancesByAccount(query, { signal }))
    .data;
}

async function getBalancesByBehavior(
  query: IGetBalancesByBehaviorQuery,
  signal?: AbortSignal
) {
  return (await drimsheetApi.reporting.getBalancesByBehavior(query, { signal }))
    .data;
}

async function getBalancesBySubType(
  query: IGetBalancesBySubTypeQuery,
  signal?: AbortSignal
) {
  return (await drimsheetApi.reporting.getBalancesBySubType(query, { signal }))
    .data;
}

async function getBalancesByType(
  query: IGetBalancesByTypeQuery,
  signal?: AbortSignal
) {
  return (await drimsheetApi.reporting.getBalancesByType(query, { signal }))
    .data;
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

async function getRevenueExpenseAccounts(
  query?: IGetRevenueExpenseAccountsQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getRevenueExpenseAccounts(query, { signal })
  ).data;
}

async function getRevenueExpenseSummary(
  query: IDateRangeDto,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getRevenueExpenseSummary(query, { signal })
  ).data;
}

export const ledgerReportingService = Object.freeze({
  getAccountCashFlow,
  getAccountCounterpartyParticipation,
  getAssetAndLiabilityBalancesByCurrency,
  getBalancesByAccount,
  getBalancesByBehavior,
  getBalancesBySubType,
  getBalancesByType,
  getLedgerTotalDebitsAndCreditsByCurrency,
  getRevenueExpenseAccounts,
  getRevenueExpenseSummary,
});
