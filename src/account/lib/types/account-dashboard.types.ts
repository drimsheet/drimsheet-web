export interface IAccountDashboardMoney {
  amount: number;
  currencyCode: string;
  isMinorUnit: boolean;
}

export interface IAccountDashboardSummary {
  totalFunctionalBalance: IAccountDashboardMoney;
  balancesByCurrency: IAccountDashboardMoney[];
}

export interface IAccountDashboardBalancePoint {
  date: string;
  amount: IAccountDashboardMoney;
}

export interface IAccountDashboardHistory {
  period: {
    from: string;
    to: string;
  };
  points: IAccountDashboardBalancePoint[];
}

export type UAccountDashboardBehavior =
  | 'bank'
  | 'petty_cash'
  | 'default_cash'
  | 'other';

export type UAccountDashboardStatus = 'draft' | 'active' | 'archived';

export interface IAccountDashboardRow {
  id: string;
  name: string;
  behavior: UAccountDashboardBehavior;
  balance: IAccountDashboardMoney;
  status: UAccountDashboardStatus;
}

export interface IAccountDashboardPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IAccountDashboardAccounts {
  data: IAccountDashboardRow[];
  meta: IAccountDashboardPagination;
}
