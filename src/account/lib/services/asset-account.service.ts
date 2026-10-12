import { drimsheetApi } from '@/shared/lib/api';
import type {
  IBankAccountCreationReq,
  IPettyCashAccountCreationReq,
} from '@/shared/lib/api/Api';

export const assetAccountService = {
  async createPettyCashAccount(payload: IPettyCashAccountCreationReq) {
    await drimsheetApi.ledger.createPettyCashAccount(payload);
  },

  async createBankAccount(payload: IBankAccountCreationReq) {
    await drimsheetApi.ledger.createBankAccount(payload);
  },
};
