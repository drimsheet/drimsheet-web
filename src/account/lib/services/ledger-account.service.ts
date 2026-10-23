import { drimsheetApi } from '@/shared/lib/api';
import {
  ELedgerAccountSubType,
  ELedgerType,
  type IDateRangeDto,
  type IGetAccountCashFlowQuery,
  type IGetAccountCounterpartyParticipationQuery,
  type IGetAssetLiabilityAccountParticipationQuery,
  type IGetJournalEntriesQuery,
  type IGetLedgerAccountsQuery,
  type IGetPermittedPostingAccountsQuery,
  type IHeaderAccountNameAliasesReq,
} from '@/shared/lib/api/Api';

async function getAssetLiabilityAccounts(
  query: IGetAssetLiabilityAccountParticipationQuery,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getAssetLiabilityAccountParticipation(query, {
      signal,
    })
  ).data;
}

async function getAssetLiabilitySummary(
  query: IDateRangeDto,
  signal?: AbortSignal
) {
  return (
    await drimsheetApi.reporting.getAssetLiabilitySummary(query, { signal })
  ).data;
}

async function getLedgerAccounts(query: IGetLedgerAccountsQuery) {
  const response = await drimsheetApi.ledger.getLedgerAccounts(query);

  return response.data;
}

function getPettyBaseCashFilters(): IGetLedgerAccountsQuery {
  return {
    type: ELedgerType.Asset,
    subType: ELedgerAccountSubType.CashAndCashEquivalent,
    isControlAccount: false,
  };
}

async function getLedgerAccount(id: string) {
  const res = await drimsheetApi.ledger.getLedgerAccount(id);

  return res.data;
}

async function archiveLedgerAccount(id: string) {
  await drimsheetApi.ledger.archiveLedgerAccount(id);
}

async function getLedgerAccountDeletionEligibility(id: string) {
  const response =
    await drimsheetApi.ledger.getLedgerAccountDeletionEligibility(id);

  return response.data;
}

async function getLedgerAccountCurrencyUpdateEligibility(id: string) {
  const response =
    await drimsheetApi.ledger.getLedgerAccountCurrencyUpdateEligibility(id);

  return response.data;
}

async function deleteLedgerAccount(id: string) {
  await drimsheetApi.ledger.deleteLedgerAccount(id);
}

async function getPermittedPostingAccounts(
  query: IGetPermittedPostingAccountsQuery
) {
  const res = await drimsheetApi.ledger.getPermittedPostingAccounts(query);

  return res.data;
}

async function getBankDetails(id: string) {
  const response = await drimsheetApi.ledger.getBankDetails(id);

  return response.data;
}

async function getOpeningBalance(id: string) {
  const response = await drimsheetApi.ledger.getLedgerAccountOpeningBalance(id);

  return response.data.openingBalance;
}

async function getSubAccounts(id: string) {
  const response = await drimsheetApi.ledger.getLedgerSubAccounts(id);

  return response.data;
}

async function getAccountCashFlow(id: string, query: IGetAccountCashFlowQuery) {
  const response = await drimsheetApi.reporting.getAccountCashFlow(id, query);

  return response.data;
}

async function getTransactions(
  id: string,
  query: IGetJournalEntriesQuery,
  signal?: AbortSignal
) {
  const response = await drimsheetApi.journalEntries.getJournalEntries(
    {
      ...query,
      accountId: id,
    },
    { signal }
  );

  return response.data;
}

async function getAccountCounterpartyParticipation(
  accountId: string,
  query: IGetAccountCounterpartyParticipationQuery,
  signal?: AbortSignal
) {
  const response =
    await drimsheetApi.reporting.getAccountCounterpartyParticipation(
      accountId,
      query,
      { signal }
    );

  return response.data;
}

async function setupHeaderAccounts(payload: IHeaderAccountNameAliasesReq) {
  return (await drimsheetApi.ledger.setupHeaderAccounts(payload)).data;
}

export const ledgerAccountService = Object.freeze({
  getAssetLiabilityAccounts,
  getAssetLiabilitySummary,
  setupHeaderAccounts,
  getAccountCounterpartyParticipation,
  getLedgerAccounts,
  getPettyBaseCashFilters,
  getLedgerAccount,
  archiveLedgerAccount,
  getLedgerAccountDeletionEligibility,
  getLedgerAccountCurrencyUpdateEligibility,
  deleteLedgerAccount,
  getPermittedPostingAccounts,
  getBankDetails,
  getOpeningBalance,
  getSubAccounts,
  getAccountCashFlow,
  getTransactions,
});
