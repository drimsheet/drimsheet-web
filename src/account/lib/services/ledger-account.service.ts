import { drimsheetApi } from '@/shared/lib/api';
import {
  ELedgerAccountSubType,
  ELedgerType,
  type IGetAccountCashFlowQuery,
  type IGetJournalEntriesQuery,
  type IGetLedgerAccountsQuery,
  type IGetPermittedPostingAccountsQuery,
} from '@/shared/lib/api/Api';

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

async function getSubAccounts(id: string) {
  const response = await drimsheetApi.ledger.getLedgerSubAccounts(id);

  return response.data;
}

async function getAccountCashFlow(id: string, query: IGetAccountCashFlowQuery) {
  const response = await drimsheetApi.reporting.getAccountCashFlow(id, query);

  return response.data;
}

async function getTransactions(id: string, query: IGetJournalEntriesQuery) {
  const response = await drimsheetApi.journalEntries.getJournalEntries({
    ...query,
    accountId: id,
  });

  return response.data;
}

export const ledgerAccountService = Object.freeze({
  getLedgerAccounts,
  getPettyBaseCashFilters,
  getLedgerAccount,
  archiveLedgerAccount,
  getLedgerAccountDeletionEligibility,
  deleteLedgerAccount,
  getPermittedPostingAccounts,
  getBankDetails,
  getSubAccounts,
  getAccountCashFlow,
  getTransactions,
});
