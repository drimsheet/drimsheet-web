import { drimsheetApi } from '@/shared/lib/api';
import type {
  IGetAccountCashFlowQuery,
  IGetBalancesBySubTypeQuery,
  IGetLedgerBalancesByCurrencyQuery,
} from '@/shared/lib/api/Api';

async function getAccountCashFlow(id: string, query: IGetAccountCashFlowQuery) {
  const response = await drimsheetApi.reporting.getAccountCashFlow(id, query);

  return response.data;
}

async function getBalancesBySubType(
  query: IGetBalancesBySubTypeQuery,
  signal?: AbortSignal
) {
  return (await drimsheetApi.reporting.getBalancesBySubType(query, { signal }))
    .data;
}

async function getLedgerBalancesByCurrency(
  query: IGetLedgerBalancesByCurrencyQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getLedgerBalancesByCurrency(query, { signal })
  ).data;
}

export const reportingService = Object.freeze({
  getAccountCashFlow,
  getBalancesBySubType,
  getLedgerBalancesByCurrency,
});
