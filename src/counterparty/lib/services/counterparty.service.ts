import { drimsheetApi } from '@/shared/lib/api';
import type {
  ICounterpartyCreateReq,
  ICounterpartyUpdateReq,
  IGetCounterpartiesQuery,
  IGetJournalEntriesQuery,
} from '@/shared/lib/api/Api';

export const counterpartyService = {
  async deleteCounterparty(id: string) {
    await drimsheetApi.counterparties.deleteCounterparty(id);
  },

  async getCounterpartyDeletionEligibility(id: string) {
    const response =
      await drimsheetApi.counterparties.getCounterpartyDeletionEligibility(id);

    return response.data;
  },

  async archiveCounterparty(id: string) {
    const response = await drimsheetApi.counterparties.archiveCounterparty(id);

    return response.data;
  },

  async updateCounterparty(id: string, data: ICounterpartyUpdateReq) {
    const response = await drimsheetApi.counterparties.updateCounterparty(
      id,
      data
    );

    return response.data;
  },

  async getCounterparty(id: string) {
    const response = await drimsheetApi.counterparties.getCounterparty(id);

    return response.data;
  },

  async getCounterpartyTransactions(query: IGetJournalEntriesQuery) {
    const response = await drimsheetApi.journalEntries.getJournalEntries(query);

    return response.data;
  },

  async getCounterparties(query: IGetCounterpartiesQuery) {
    const response = await drimsheetApi.counterparties.getCounterparties(query);

    return response.data;
  },

  async createCounterparty(data: ICounterpartyCreateReq) {
    const response = await drimsheetApi.counterparties.createCounterparty(data);

    return response.data;
  },
};
