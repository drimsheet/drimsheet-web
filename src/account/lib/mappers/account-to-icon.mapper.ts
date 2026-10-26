import {
  ELedgerAccountSubType,
  ELedgerType,
  type ILedgerAccountDto,
  type ULedgerAccountSubType,
  type ULedgerType,
} from '@/shared/lib/api/Api';
import {
  BadgeDollarSign,
  BadgePercent,
  Banknote,
  BanknoteArrowDown,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  CircleAlert,
  CirclePercent,
  CreditCard,
  Factory,
  FileText,
  HelpingHand,
  HousePlug,
  Landmark,
  Percent,
  PiggyBank,
  Receipt,
  ReceiptText,
  Scale,
  ShieldQuestion,
  ShoppingCart,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserRound,
  Wallet,
  WalletCards,
  type LucideProps,
} from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type TIcon = ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
>;

const typeMaps: Record<ULedgerType, TIcon> = {
  [ELedgerType.Asset]: Wallet,
  [ELedgerType.Liability]: HelpingHand,
  [ELedgerType.Equity]: Percent,
  [ELedgerType.Revenue]: TrendingUp,
  [ELedgerType.Expense]: TrendingDown,
};

interface IAccountIconConfig {
  fallback: TIcon;
  behaviorMaps: Record<string, TIcon>;
}

type TSubTypeIconMaps = Partial<
  Record<ULedgerAccountSubType | string, IAccountIconConfig>
>;

const assetTypeMaps: TSubTypeIconMaps = {
  [ELedgerAccountSubType.CashAndCashEquivalent]: {
    fallback: Wallet,
    behaviorMaps: {
      default_cash: Wallet,
      petty_cash: PiggyBank,
      bank: Landmark,
    },
  },
  [ELedgerAccountSubType.Receivables]: {
    fallback: ReceiptText,
    behaviorMaps: {
      default_receivables: ReceiptText,
      statutory_receivable: FileText,
      trade_receivable: WalletCards,
    },
  },
  [ELedgerAccountSubType.Suspense]: {
    fallback: ShieldQuestion,
    behaviorMaps: {
      default: ShieldQuestion,
    },
  },
};

const liabilityTypeMaps: TSubTypeIconMaps = {
  [ELedgerAccountSubType.ShortTermDebt]: {
    fallback: BanknoteArrowDown,
    behaviorMaps: {
      default_short_term_debt: BanknoteArrowDown,
      credit_card: CreditCard,
      overdraft: CircleAlert,
      short_term_loan: Banknote,
    },
  },
  [ELedgerAccountSubType.Payable]: {
    fallback: Receipt,
    behaviorMaps: {
      default_payable: Receipt,
      tax_payable: Landmark,
      trade_payable: ShoppingCart,
    },
  },
  [ELedgerAccountSubType.Suspense]: {
    fallback: ShieldQuestion,
    behaviorMaps: {
      default: ShieldQuestion,
    },
  },
};

const equityTypeMaps: TSubTypeIconMaps = {
  [ELedgerAccountSubType.RetainedEarnings]: {
    fallback: ChartNoAxesCombined,
    behaviorMaps: {
      retained_earnings: ChartNoAxesCombined,
    },
  },
  [ELedgerAccountSubType.OpeningBalance]: {
    fallback: Scale,
    behaviorMaps: {
      opening_balance_equity: Scale,
    },
  },
};

const revenueTypeMaps: TSubTypeIconMaps = {
  [ELedgerAccountSubType.Services]: {
    fallback: BriefcaseBusiness,
    behaviorMaps: {
      services: BriefcaseBusiness,
    },
  },
  [ELedgerAccountSubType.EmploymentIncome]: {
    fallback: UserRound,
    behaviorMaps: {
      employment_income: UserRound,
    },
  },
  [ELedgerAccountSubType.GainOnAssetSale]: {
    fallback: BadgeDollarSign,
    behaviorMaps: {
      gain_on_asset_sale: BadgeDollarSign,
    },
  },
  [ELedgerAccountSubType.UnrealizedGains]: {
    fallback: TrendingUp,
    behaviorMaps: {
      unrealized_gains: TrendingUp,
    },
  },
};

const expenseTypeMaps: TSubTypeIconMaps = {
  [ELedgerAccountSubType.DirectCosts]: {
    fallback: Factory,
    behaviorMaps: {
      cogs: ShoppingCart,
      cost_of_services: BriefcaseBusiness,
      cost_of_revenue: BadgeDollarSign,
      default_direct_cost: Factory,
    },
  },
  [ELedgerAccountSubType.RentAndUtilities]: {
    fallback: HousePlug,
    behaviorMaps: {
      rent_and_utilities: HousePlug,
    },
  },
  [ELedgerAccountSubType.BankCharge]: {
    fallback: Building2,
    behaviorMaps: {
      bank_charge: Building2,
    },
  },
  [ELedgerAccountSubType.FinanceCost]: {
    fallback: BadgePercent,
    behaviorMaps: {
      finance_cost: BadgePercent,
    },
  },
  [ELedgerAccountSubType.Interest]: {
    fallback: CirclePercent,
    behaviorMaps: {
      interest: CirclePercent,
    },
  },
  [ELedgerAccountSubType.IncomeTaxExpense]: {
    fallback: Landmark,
    behaviorMaps: {
      tax_expense: Landmark,
    },
  },
  [ELedgerAccountSubType.UnrealizedLoss]: {
    fallback: TrendingDown,
    behaviorMaps: {
      unrealized_loss: TrendingDown,
    },
  },
  [ELedgerAccountSubType.LossOnAssetDisposal]: {
    fallback: Trash2,
    behaviorMaps: {
      asset_disposal_loss: Trash2,
    },
  },
};

function mapSubTypeToIcon(
  account: Pick<ILedgerAccountDto, 'subType' | 'behavior'>,
  subTypeMaps: TSubTypeIconMaps,
  fallback: TIcon
) {
  const iconConfig = subTypeMaps[String(account.subType)];

  if (!iconConfig) {
    return fallback;
  }

  return iconConfig.behaviorMaps[account.behavior] ?? iconConfig.fallback;
}

function mapAssetToIcon(
  account: Pick<ILedgerAccountDto, 'subType' | 'behavior'>
) {
  return mapSubTypeToIcon(account, assetTypeMaps, typeMaps.asset);
}

function mapLiabilityToIcon(
  account: Pick<ILedgerAccountDto, 'subType' | 'behavior'>
) {
  return mapSubTypeToIcon(account, liabilityTypeMaps, typeMaps.liability);
}

function mapEquityToIcon(
  account: Pick<ILedgerAccountDto, 'subType' | 'behavior'>
) {
  return mapSubTypeToIcon(account, equityTypeMaps, typeMaps.equity);
}

function mapRevenueToIcon(
  account: Pick<ILedgerAccountDto, 'subType' | 'behavior'>
) {
  return mapSubTypeToIcon(account, revenueTypeMaps, typeMaps.revenue);
}

function mapExpenseToIcon(
  account: Pick<ILedgerAccountDto, 'subType' | 'behavior'>
) {
  return mapSubTypeToIcon(account, expenseTypeMaps, typeMaps.expense);
}

export function mapAccountTypeToIcon(
  account: Pick<ILedgerAccountDto, 'type' | 'subType' | 'behavior'>
): TIcon {
  switch (account.type) {
    case ELedgerType.Asset:
      return mapAssetToIcon(account);
    case ELedgerType.Liability:
      return mapLiabilityToIcon(account);
    case ELedgerType.Equity:
      return mapEquityToIcon(account);
    case ELedgerType.Revenue:
      return mapRevenueToIcon(account);
    case ELedgerType.Expense:
      return mapExpenseToIcon(account);
  }

  return typeMaps[account.type];
}
