import type {
  IAccountsTableData,
  IAccountsTableRow,
} from '@/account/components/accounts-table';
import type {
  IAccountDashboardHistory,
  IAccountDashboardMoney,
  IAccountDashboardSummary,
} from '@/account/lib/types/account-dashboard.types';
import type {
  IBalancesBySubTypeDto,
  ILedgerBalancesByCurrencyDto,
  IMoneyDto,
  IPaginatedResponseILedgerAccountDto,
  ULedgerAccountBehavior,
} from '@/shared/lib/api/Api';

function toMoney(value: IMoneyDto): IAccountDashboardMoney {
  return {
    amount: value.amount,
    currencyCode: value.currencyCode,
    isMinorUnit: value.isMinorUnit,
  };
}

function toBehavior(
  behavior: ULedgerAccountBehavior
): IAccountsTableRow['behavior'] {
  if (behavior === 'bank') {
    return 'bank';
  }

  if (behavior === 'petty_cash') {
    return 'petty_cash';
  }

  if (behavior === 'default_cash') {
    return 'default_cash';
  }

  return 'other';
}

function toSummary(
  response: ILedgerBalancesByCurrencyDto
): IAccountDashboardSummary {
  const functionalCurrencyCode =
    response.totalFunctionalBalance.currencyCode.toLowerCase();

  const balancesByCurrency = response.balancesByCurrency
    .map(({ balance }) => toMoney(balance))
    .sort((left, right) => {
      const leftIsFunctional =
        left.currencyCode.toLowerCase() === functionalCurrencyCode;

      const rightIsFunctional =
        right.currencyCode.toLowerCase() === functionalCurrencyCode;

      if (leftIsFunctional !== rightIsFunctional) {
        return leftIsFunctional ? -1 : 1;
      }

      return left.currencyCode.localeCompare(right.currencyCode);
    });

  return {
    totalFunctionalBalance: toMoney(response.totalFunctionalBalance),
    balancesByCurrency,
  };
}

function toHistory(response: IBalancesBySubTypeDto): IAccountDashboardHistory {
  const points = response.buckets.flatMap(({ balances, date }) => {
    const balance = balances[0];

    if (!balance) {
      return [];
    }

    return [
      {
        date,
        amount: toMoney(balance.closingBalance),
      },
    ];
  });

  return {
    period: {
      from: response.period.from,
      to: response.period.to,
    },
    points,
  };
}

function toAccounts(
  response: IPaginatedResponseILedgerAccountDto
): IAccountsTableData {
  return {
    data: response.data.map((account) => ({
      id: account.id,
      name: account.name,
      behavior: toBehavior(account.behavior),
      balance: toMoney(account.balance),
      status: account.status,
    })),
    meta: {
      page: response.meta.page,
      limit: response.meta.limit,
      total: response.meta.total,
      totalPages: response.meta.totalPages,
    },
  };
}

const accountDashboardMapper = Object.freeze({
  toSummary,
  toHistory,
  toAccounts,
});

export default accountDashboardMapper;
