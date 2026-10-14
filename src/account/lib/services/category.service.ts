import { drimsheetApi } from '@/shared/lib/api';
import type {
  ICreateExpenseAccountDto,
  ICreateRevenueAccountDto,
  IDateRangeDto,
  IGetRevenueExpenseAccountsQuery,
  IUpdateExpenseAccountDto,
  IUpdateRevenueAccountDto,
} from '@/shared/lib/api/Api';

export const categoryService = Object.freeze({
  async createRevenue(payload: ICreateRevenueAccountDto) {
    return (await drimsheetApi.ledger.createRevenueAccount(payload)).data;
  },
  async createExpense(payload: ICreateExpenseAccountDto) {
    return (await drimsheetApi.ledger.createExpenseAccount(payload)).data;
  },
  async getAccounts(query: IGetRevenueExpenseAccountsQuery) {
    return (await drimsheetApi.reporting.getRevenueExpenseAccounts(query)).data;
  },
  async getSummary(query: IDateRangeDto) {
    return (await drimsheetApi.reporting.getRevenueExpenseSummary(query)).data;
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
