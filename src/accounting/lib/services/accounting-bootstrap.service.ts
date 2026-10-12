import { drimsheetApi } from '@/shared/lib/api';
import type {
  ICreateExpenseAccountDto,
  ICreateRevenueAccountDto,
  ICreateStatutoryPayableAccountDto,
  ICreateStatutoryReceivableAccountDto,
  ICreateSuspenseAccountDto,
  IHeaderAccountNameAliasesReq,
} from '@/shared/lib/api/Api';

export const accountingBootstrapService = Object.freeze({
  async getRecommendations() {
    return (await drimsheetApi.ledger.getRecommendedBootstrap()).data;
  },

  async setupHeaders(payload?: IHeaderAccountNameAliasesReq) {
    return (await drimsheetApi.ledger.setupHeaderAccounts(payload)).data;
  },

  async createReceivable(payload: ICreateStatutoryReceivableAccountDto) {
    return (await drimsheetApi.ledger.createStatutoryReceivableAccount(payload))
      .data;
  },

  async createPayable(payload: ICreateStatutoryPayableAccountDto) {
    return (await drimsheetApi.ledger.createStatutoryPayableAccount(payload))
      .data;
  },

  async createRevenue(payload: ICreateRevenueAccountDto) {
    return (await drimsheetApi.ledger.createRevenueAccount(payload)).data;
  },

  async createExpense(payload: ICreateExpenseAccountDto) {
    return (await drimsheetApi.ledger.createExpenseAccount(payload)).data;
  },

  async createSuspense(payload: ICreateSuspenseAccountDto) {
    return (await drimsheetApi.ledger.createSuspenseAccount(payload)).data;
  },
});
