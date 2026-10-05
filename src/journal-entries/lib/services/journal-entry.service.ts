import { drimsheetApi } from '@/shared/lib/api';
import type {
  IGetJournalEntriesQuery,
  IJournalEntryArchiveReq,
  IJournalEntryDeletionReq,
  IPaymentEntryReq,
  IReceiptEntryReq,
  ITransferEntryReq,
  TJournalEntryRectificationReq,
} from '@/shared/lib/api/Api';

const journalEntryService = {
  async deleteJournalEntry(id: string, payload: IJournalEntryDeletionReq) {
    const res = await drimsheetApi.journalEntries.deleteJournalEntry(
      id,
      payload
    );

    return res.data;
  },

  async archiveJournalEntry(id: string, payload: IJournalEntryArchiveReq) {
    const res = await drimsheetApi.journalEntries.archiveJournalEntry(
      id,
      payload
    );

    return res.data;
  },

  async getJournalEntries(query: IGetJournalEntriesQuery) {
    const res = await drimsheetApi.journalEntries.getJournalEntries(query);

    return res.data;
  },

  async getJournalEntry(id: string) {
    const res = await drimsheetApi.journalEntries.getJournalEntry(id);

    return res.data;
  },

  async createPayment(payload: IPaymentEntryReq) {
    const res = await drimsheetApi.journalEntries.createPayment(payload);

    return res.data;
  },

  async createReceipt(payload: IReceiptEntryReq) {
    const res = await drimsheetApi.journalEntries.createReceipt(payload);

    return res.data;
  },

  async createTransfer(payload: ITransferEntryReq) {
    const res = await drimsheetApi.journalEntries.createTransfer(payload);

    return res.data;
  },

  async rectifyJournalEntry(
    id: string,
    payload: TJournalEntryRectificationReq
  ) {
    const res = await drimsheetApi.journalEntries.rectifyJournalEntry(
      id,
      payload
    );

    return res.data;
  },
};

export default journalEntryService;
