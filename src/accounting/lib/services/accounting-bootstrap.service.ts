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
    return (await drimsheetApi.accounts.getRecommendedBootstrap()).data;
  },

  async setupHeaders(payload?: IHeaderAccountNameAliasesReq) {
    return (await drimsheetApi.ledger.setupHeaderAccounts(payload)).data;
  },

  async createReceivable(payload: ICreateStatutoryReceivableAccountDto) {
    return (
      await drimsheetApi.accounts.createStatutoryReceivableAccount(payload)
    ).data;
  },

  async createPayable(payload: ICreateStatutoryPayableAccountDto) {
    return (await drimsheetApi.accounts.createStatutoryPayableAccount(payload))
      .data;
  },

  async createRevenue(payload: ICreateRevenueAccountDto) {
    return (await drimsheetApi.accounts.createRevenueAccount(payload)).data;
  },

  async createExpense(payload: ICreateExpenseAccountDto) {
    return (await drimsheetApi.accounts.createExpenseAccount(payload)).data;
  },

  async createSuspense(payload: ICreateSuspenseAccountDto) {
    return (await drimsheetApi.accounts.createSuspenseAccount(payload)).data;
  },
});
