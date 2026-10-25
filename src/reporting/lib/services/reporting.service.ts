import { drimsheetApi } from '@/shared/lib/api';
import type {
  IGetBalancesBySubTypeQuery,
  IGetLedgerBalancesByCurrencyQuery,
} from '@/shared/lib/api/Api';

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
  getBalancesBySubType,
  getLedgerBalancesByCurrency,
});
