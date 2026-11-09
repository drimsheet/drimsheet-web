import type {
  UPaymentRectificationRequest,
  UReceiptRectificationRequest,
  UTransferRectificationRequest,
} from '@/journal-entries/lib/types/journal-entry-rectification.types';
import { drimsheetApi } from '@/shared/lib/api';
import type {
  IGetJournalEntriesQuery,
  IPaymentEntryReq,
  IReceiptEntryReq,
  ITransferEntryReq,
} from '@/shared/lib/api/Api';

const journalEntryService = {
  async deleteJournalEntry(id: string) {
    const res = await drimsheetApi.journalEntries.deleteJournalEntry(id);

    return res.data;
  },

  async archiveJournalEntry(id: string) {
    const res = await drimsheetApi.journalEntries.archiveJournalEntry(id);

    return res.data;
  },

  async getJournalEntries(
    query: IGetJournalEntriesQuery,
    signal?: AbortSignal
  ) {
    const res = await drimsheetApi.journalEntries.getJournalEntries(query, {
      signal,
    });

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

  async rectifyPayment(id: string, request: UPaymentRectificationRequest) {
    const api = drimsheetApi.journalEntries;

    switch (request.action) {
      case 'updateDraft':
        return (await api.updateDraftPayment(id, request.payload)).data;
      case 'updateMeta':
        return (await api.updateJournalEntryMeta(id, request.payload)).data;
      case 'voidAndReplace':
        return (await api.voidAndReplacePayment(id, request.payload)).data;
    }
  },

  async rectifyReceipt(id: string, request: UReceiptRectificationRequest) {
    const api = drimsheetApi.journalEntries;

    switch (request.action) {
      case 'updateDraft':
        return (await api.updateDraftReceipt(id, request.payload)).data;
      case 'updateMeta':
        return (await api.updateJournalEntryMeta(id, request.payload)).data;
      case 'voidAndReplace':
        return (await api.voidAndReplaceReceipt(id, request.payload)).data;
    }
  },

  async rectifyTransfer(id: string, request: UTransferRectificationRequest) {
    const api = drimsheetApi.journalEntries;

    switch (request.action) {
      case 'updateDraft':
        return (await api.updateDraftTransfer(id, request.payload)).data;
      case 'updateMeta':
        return (await api.updateJournalEntryMeta(id, request.payload)).data;
      case 'voidAndReplace':
        return (await api.voidAndReplaceTransfer(id, request.payload)).data;
    }
  },
};

export default journalEntryService;
