import accountDashboardMapper from '@/account/lib/mappers/account-dashboard.mapper';
import type {
  IAssetAndLiabilityBalancesByCurrencyDto,
  IBalancesBySubTypeDto,
  ILedgerAccountDto,
  IPaginatedResponseILedgerAccountDto,
} from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const ledgerAccount: ILedgerAccountDto = {
  id: 'operating',
  code: '10001',
  materializedPath: '10001',
  accountingEntityId: 'entity',
  type: 'asset',
  normalBalance: 'debit',
  subType: 'cash_and_cash_equivalent',
  behavior: 'bank',
  isControlAccount: false,
  name: 'Operating account',
  status: 'active',
  contraAccountRule: 'contra_not_applicable',
  adjunctAccountRule: 'adjunct_not_applicable',
  openingBalanceDate: null,
  createdBy: 'user',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  balance: { amount: 820000, currencyCode: 'USD', isMinorUnit: true },
  functionalBalance: {
    amount: 12480000,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
};

describe('accountDashboardMapper', () => {
  it('maps and orders the functional currency first in the dashboard summary', () => {
    const response: IAssetAndLiabilityBalancesByCurrencyDto = {
      totalFunctionalBalance: {
        amount: 87450000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      balancesByCurrency: [
        {
          balance: {
            amount: 820000,
            currencyCode: 'USD',
            isMinorUnit: true,
          },
          functionalBalance: {
            amount: 12200000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
        },
        {
          balance: {
            amount: 71250000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
          functionalBalance: {
            amount: 71250000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
        },
      ],
    };

    expect(accountDashboardMapper.toSummary(response)).toEqual({
      totalFunctionalBalance: {
        amount: 87450000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      balancesByCurrency: [
        {
          amount: 71250000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        {
          amount: 820000,
          currencyCode: 'USD',
          isMinorUnit: true,
        },
      ],
    });
  });

  it('maps balance buckets to client-owned chart points', () => {
    const response: IBalancesBySubTypeDto = {
      period: { from: '2026-04-24', to: '2026-10-23' },
      buckets: [
        {
          date: '2026-04-24',
          balances: [
            {
              closingBalance: {
                amount: 80000000,
                currencyCode: 'NGN',
                isMinorUnit: false,
              },
              subType: 'cash_and_cash_equivalent',
              type: 'asset',
            },
          ],
        },
        { date: '2026-05-24', balances: [] },
      ],
    };

    expect(accountDashboardMapper.toHistory(response)).toEqual({
      period: { from: '2026-04-24', to: '2026-10-23' },
      points: [
        {
          date: '2026-04-24',
          amount: {
            amount: 80000000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
        },
      ],
    });
  });

  it('maps only the account fields required by the dashboard table', () => {
    const response: IPaginatedResponseILedgerAccountDto = {
      data: [
        ledgerAccount,
        { ...ledgerAccount, id: 'other', behavior: 'sales' },
      ],
      meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
    };

    expect(accountDashboardMapper.toAccounts(response)).toEqual({
      data: [
        {
          id: 'operating',
          name: 'Operating account',
          behavior: 'bank',
          balance: {
            amount: 820000,
            currencyCode: 'USD',
            isMinorUnit: true,
          },
          status: 'active',
        },
        {
          id: 'other',
          name: 'Operating account',
          behavior: 'other',
          balance: {
            amount: 820000,
            currencyCode: 'USD',
            isMinorUnit: true,
          },
          status: 'active',
        },
      ],
      meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
  });
});
