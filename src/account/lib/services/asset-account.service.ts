import { drimsheetApi } from '@/shared/lib/api';
import type {
  IBankAccountCreationReq,
  IBankAccountUpdateReq,
  IPettyCashAccountCreationReq,
  IPettyCashAccountUpdateReq,
} from '@/shared/lib/api/Api';

export const assetAccountService = {
  async updateBankAccount(id: string, payload: IBankAccountUpdateReq) {
    const response = await drimsheetApi.ledger.updateBankAccount(id, payload);

    return response.data;
  },

  async updatePettyCashAccount(
    id: string,
    payload: IPettyCashAccountUpdateReq
  ) {
    const response = await drimsheetApi.ledger.updatePettyCashAccount(
      id,
      payload
    );

    return response.data;
  },
  async createPettyCashAccount(payload: IPettyCashAccountCreationReq) {
    const response = await drimsheetApi.ledger.createPettyCashAccount(payload);

    return response.data;
  },

  async createBankAccount(payload: IBankAccountCreationReq) {
    const response = await drimsheetApi.ledger.createBankAccount(payload);

    return response.data;
  },
};
