import { drimsheetApi } from '@/shared/lib/api';
import type {
  ICreateExpenseAccountDto,
  ICreateRevenueAccountDto,
  IGetChartOfAccountsQuery,
  IUpdateExpenseAccountDto,
  IUpdateRevenueAccountDto,
} from '@/shared/lib/api/Api';

export const categoryService = Object.freeze({
  async getChartOfAccounts(query: IGetChartOfAccountsQuery) {
    return (await drimsheetApi.ledger.getChartOfAccounts(query)).data;
  },
  async createRevenue(payload: ICreateRevenueAccountDto) {
    return (await drimsheetApi.ledger.createRevenueAccount(payload)).data;
  },
  async createExpense(payload: ICreateExpenseAccountDto) {
    return (await drimsheetApi.ledger.createExpenseAccount(payload)).data;
  },
  async updateRevenue(id: string, payload: IUpdateRevenueAccountDto) {
    return (await drimsheetApi.ledger.updateRevenueAccount(id, payload)).data;
  },
  async updateExpense(id: string, payload: IUpdateExpenseAccountDto) {
    return (await drimsheetApi.ledger.updateExpenseAccount(id, payload)).data;
  },
  async archive(id: string) {
    await drimsheetApi.ledger.archiveLedgerAccount(id);
  },
});
