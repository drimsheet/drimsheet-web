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
