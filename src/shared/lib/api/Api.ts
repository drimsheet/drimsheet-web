/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export const EReportingIntervalUnit = {
  Day: 'day',
  Week: 'week',
  Month: 'month',
  Quarter: 'quarter',
  Year: 'year',
} as const;
export type UReportingIntervalUnit =
  (typeof EReportingIntervalUnit)[keyof typeof EReportingIntervalUnit];

export const EAccountingPeriodStatus = {
  Open: 'open',
  Closed: 'closed',
} as const;
export type UAccountingPeriodStatus =
  (typeof EAccountingPeriodStatus)[keyof typeof EAccountingPeriodStatus];

export const EAccountingIntervalUnit = {
  Day: 'day',
  Week: 'week',
  Month: 'month',
  Quarter: 'quarter',
  Year: 'year',
} as const;
export type UAccountingIntervalUnit =
  (typeof EAccountingIntervalUnit)[keyof typeof EAccountingIntervalUnit];

export const EAccountingStandardCode = {
  AASB: 'AASB',
  ASPE: 'ASPE',
  CAS: 'CAS',
  CGNC: 'CGNC',
  EAS: 'EAS',
  HGB: 'HGB',
  HKFRS: 'HKFRS',
  IFRS: 'IFRS',
  IND_AS: 'IND_AS',
  ISRAELI_GAAP: 'ISRAELI_GAAP',
  J_GAAP: 'J_GAAP',
  K_IFRS: 'K_IFRS',
  MFRS: 'MFRS',
  NIF: 'NIF',
  NZ_IFRS: 'NZ_IFRS',
  OIC: 'OIC',
  PCG: 'PCG',
  PFRS: 'PFRS',
  PGC: 'PGC',
  PSAK: 'PSAK',
  RAS: 'RAS',
  RJ: 'RJ',
  SCF: 'SCF',
  SFRS: 'SFRS',
  SWISS_GAAP_FER: 'SWISS_GAAP_FER',
  SYSCOHADA: 'SYSCOHADA',
  TFRS: 'TFRS',
  THAI_FRS: 'THAI_FRS',
  TIFRS: 'TIFRS',
  UK_GAAP: 'UK_GAAP',
  US_GAAP: 'US_GAAP',
  VAS: 'VAS',
  LOCAL_GAAP: 'LOCAL_GAAP',
  CASH_BASIS: 'CASH_BASIS',
} as const;
export type UAccountingStandardCode =
  (typeof EAccountingStandardCode)[keyof typeof EAccountingStandardCode];

export const EFiscalYearStatus = {
  Pending: 'pending',
  Open: 'open',
  Closing: 'closing',
  Closed: 'closed',
} as const;
export type UFiscalYearStatus =
  (typeof EFiscalYearStatus)[keyof typeof EFiscalYearStatus];

export const EJurisdictionCode = {
  AD: 'AD',
  AE: 'AE',
  AR: 'AR',
  AT: 'AT',
  AU: 'AU',
  BD: 'BD',
  BE: 'BE',
  BR: 'BR',
  CA: 'CA',
  CH: 'CH',
  CI: 'CI',
  CL: 'CL',
  CM: 'CM',
  CN: 'CN',
  CO: 'CO',
  CY: 'CY',
  CZ: 'CZ',
  DE: 'DE',
  DK: 'DK',
  DZ: 'DZ',
  EE: 'EE',
  EG: 'EG',
  ES: 'ES',
  FI: 'FI',
  FR: 'FR',
  GB: 'GB',
  GH: 'GH',
  GR: 'GR',
  HK: 'HK',
  HR: 'HR',
  HU: 'HU',
  ID: 'ID',
  IE: 'IE',
  IL: 'IL',
  IN: 'IN',
  IT: 'IT',
  JP: 'JP',
  KE: 'KE',
  KR: 'KR',
  LT: 'LT',
  LU: 'LU',
  LV: 'LV',
  MA: 'MA',
  MC: 'MC',
  MT: 'MT',
  MX: 'MX',
  MY: 'MY',
  NG: 'NG',
  NL: 'NL',
  NO: 'NO',
  NZ: 'NZ',
  PE: 'PE',
  PH: 'PH',
  PK: 'PK',
  PL: 'PL',
  PT: 'PT',
  RO: 'RO',
  RU: 'RU',
  SA: 'SA',
  SE: 'SE',
  SG: 'SG',
  SI: 'SI',
  SK: 'SK',
  SM: 'SM',
  SN: 'SN',
  TH: 'TH',
  TR: 'TR',
  TW: 'TW',
  TZ: 'TZ',
  UA: 'UA',
  UG: 'UG',
  US: 'US',
  VA: 'VA',
  VN: 'VN',
  ZA: 'ZA',
} as const;
export type UJurisdictionCode =
  (typeof EJurisdictionCode)[keyof typeof EJurisdictionCode];

export const ECurrencyCode = {
  AED: 'AED',
  ARS: 'ARS',
  AUD: 'AUD',
  BDT: 'BDT',
  BRL: 'BRL',
  CAD: 'CAD',
  CHF: 'CHF',
  CLP: 'CLP',
  CNY: 'CNY',
  COP: 'COP',
  CZK: 'CZK',
  DKK: 'DKK',
  DZD: 'DZD',
  EGP: 'EGP',
  EUR: 'EUR',
  GBP: 'GBP',
  GHS: 'GHS',
  HKD: 'HKD',
  HUF: 'HUF',
  IDR: 'IDR',
  ILS: 'ILS',
  INR: 'INR',
  JPY: 'JPY',
  KES: 'KES',
  KRW: 'KRW',
  MAD: 'MAD',
  MXN: 'MXN',
  MYR: 'MYR',
  NGN: 'NGN',
  NOK: 'NOK',
  NZD: 'NZD',
  PEN: 'PEN',
  PHP: 'PHP',
  PKR: 'PKR',
  PLN: 'PLN',
  RON: 'RON',
  RUB: 'RUB',
  SAR: 'SAR',
  SEK: 'SEK',
  SGD: 'SGD',
  THB: 'THB',
  TRY: 'TRY',
  TWD: 'TWD',
  TZS: 'TZS',
  UAH: 'UAH',
  UGX: 'UGX',
  USD: 'USD',
  VND: 'VND',
  XAF: 'XAF',
  XOF: 'XOF',
  ZAR: 'ZAR',
} as const;
export type UCurrencyCode = (typeof ECurrencyCode)[keyof typeof ECurrencyCode];

export const EAccountingEntityType = {
  Individual: 'individual',
  SoleTrader: 'sole_trader',
  PrivateCompany: 'private_company',
} as const;
export type UAccountingEntityType =
  (typeof EAccountingEntityType)[keyof typeof EAccountingEntityType];

export const EAccountingEntityStatus = {
  Active: 'active',
  Archived: 'archived',
} as const;
export type UAccountingEntityStatus =
  (typeof EAccountingEntityStatus)[keyof typeof EAccountingEntityStatus];

export const ECounterpartySortBy = {
  CreatedAt: 'createdAt',
  Name: 'name',
} as const;
export type UCounterpartySortBy =
  (typeof ECounterpartySortBy)[keyof typeof ECounterpartySortBy];

export const EFileUploadPurpose = {
  JournalEntryAttachment: 'journal_entry_attachment',
} as const;
export type UFileUploadPurpose =
  (typeof EFileUploadPurpose)[keyof typeof EFileUploadPurpose];

export const EJournalEntryRectificationMode = {
  UpdateDraft: 'update_draft',
  UpdateMeta: 'update_meta',
  VoidAndReplace: 'void_and_replace',
} as const;
export type UJournalEntryRectificationMode =
  (typeof EJournalEntryRectificationMode)[keyof typeof EJournalEntryRectificationMode];

export const EJournalEntrySortBy = {
  CreatedAt: 'createdAt',
  EffectiveDate: 'effectiveDate',
} as const;
export type UJournalEntrySortBy =
  (typeof EJournalEntrySortBy)[keyof typeof EJournalEntrySortBy];

export const ETSupportedRevenueAccountBehavior = {
  Services: 'services',
  EmploymentIncome: 'employment_income',
  GainOnAssetSale: 'gain_on_asset_sale',
  UnrealizedGains: 'unrealized_gains',
  Grants: 'grants',
  Gifts: 'gifts',
} as const;
export type TSupportedRevenueAccountBehavior =
  (typeof ETSupportedRevenueAccountBehavior)[keyof typeof ETSupportedRevenueAccountBehavior];

export const ETSupportedExpenseAccountBehavior = {
  DefaultDirectCost: 'default_direct_cost',
  Cogs: 'cogs',
  CostOfServices: 'cost_of_services',
  CostOfRevenue: 'cost_of_revenue',
  RentAndUtilities: 'rent_and_utilities',
  BankCharge: 'bank_charge',
  FinanceCost: 'finance_cost',
  Interest: 'interest',
  TaxExpense: 'tax_expense',
  UnrealizedLoss: 'unrealized_loss',
  AssetDisposalLoss: 'asset_disposal_loss',
} as const;
export type TSupportedExpenseAccountBehavior =
  (typeof ETSupportedExpenseAccountBehavior)[keyof typeof ETSupportedExpenseAccountBehavior];

/** Status accepted when proposing or creating a ledger subaccount. */
export const ELedgerAccountCreationStatus = {
  Active: 'active',
  Draft: 'draft',
} as const;
export type ULedgerAccountCreationStatus =
  (typeof ELedgerAccountCreationStatus)[keyof typeof ELedgerAccountCreationStatus];

export const EJournalSide = {
  Debit: 'debit',
  Credit: 'credit',
} as const;
export type UJournalSide = (typeof EJournalSide)[keyof typeof EJournalSide];

export const EJournalEntryStatus = {
  Draft: 'draft',
  Archived: 'archived',
  Posted: 'posted',
  Voided: 'voided',
} as const;
export type UJournalEntryStatus =
  (typeof EJournalEntryStatus)[keyof typeof EJournalEntryStatus];

export const ELedgerAccountBalanceEffect = {
  Increase: 'increase',
  Decrease: 'decrease',
  Noop: 'noop',
} as const;
export type ULedgerAccountBalanceEffect =
  (typeof ELedgerAccountBalanceEffect)[keyof typeof ELedgerAccountBalanceEffect];

export const EExchangeRateType = {
  Official: 'official',
  Negotiated: 'negotiated',
  Market: 'market',
} as const;
export type UExchangeRateType =
  (typeof EExchangeRateType)[keyof typeof EExchangeRateType];

export const ELedgerAccountDeletionReason = {
  HeaderAccount: 'header_account',
  HasJournalEntries: 'has_journal_entries',
} as const;
export type ULedgerAccountDeletionReason =
  (typeof ELedgerAccountDeletionReason)[keyof typeof ELedgerAccountDeletionReason];

export const ELedgerAccountCurrencyUpdateReason = {
  NotAssetAccount: 'not_asset_account',
  HasPostedJournalEntries: 'has_posted_journal_entries',
} as const;
export type ULedgerAccountCurrencyUpdateReason =
  (typeof ELedgerAccountCurrencyUpdateReason)[keyof typeof ELedgerAccountCurrencyUpdateReason];

export const EJournalEntrySourceType = {
  Expense: 'expense',
  OpeningBalance: 'opening_balance',
  Sale: 'sale',
  Purchase: 'purchase',
  CreditNote: 'credit_note',
  DebitNote: 'debit_note',
  Transfer: 'transfer',
  Payment: 'payment',
  Receipt: 'receipt',
  Adjustment: 'adjustment',
  Reversal: 'reversal',
} as const;
export type UJournalEntrySourceType =
  (typeof EJournalEntrySourceType)[keyof typeof EJournalEntrySourceType];

export const EPaginationSortDirection = {
  Asc: 'asc',
  Desc: 'desc',
} as const;
export type UPaginationSortDirection =
  (typeof EPaginationSortDirection)[keyof typeof EPaginationSortDirection];

export const ELedgerAccountSortBy = {
  AccountName: 'accountName',
  CreatedAt: 'createdAt',
  Balance: 'balance',
} as const;
export type ULedgerAccountSortBy =
  (typeof ELedgerAccountSortBy)[keyof typeof ELedgerAccountSortBy];

export const EAdjunctAccountRule = {
  AdjunctPermitted: 'adjunct_permitted',
  AdjunctNotPermitted: 'adjunct_not_permitted',
  AdjunctOnly: 'adjunct_only',
  AdjunctNotApplicable: 'adjunct_not_applicable',
} as const;
export type UAdjunctAccountRule =
  (typeof EAdjunctAccountRule)[keyof typeof EAdjunctAccountRule];

export const EContraAccountRule = {
  ContraPermitted: 'contra_permitted',
  ContraNotPermitted: 'contra_not_permitted',
  ContraOnly: 'contra_only',
  ContraNotApplicable: 'contra_not_applicable',
} as const;
export type UContraAccountRule =
  (typeof EContraAccountRule)[keyof typeof EContraAccountRule];

export const ELedgerAccountBehavior = {
  RetainedEarnings: 'retained_earnings',
  Sales: 'sales',
  Services: 'services',
  Subscriptions: 'subscriptions',
  EmploymentIncome: 'employment_income',
  InterestIncome: 'interest_income',
  GainOnAssetSale: 'gain_on_asset_sale',
  UnrealizedGains: 'unrealized_gains',
  Grants: 'grants',
  Gifts: 'gifts',
  PayrollAndPersonnel: 'payroll_and_personnel',
  RentAndUtilities: 'rent_and_utilities',
  AdminAndGeneral: 'admin_and_general',
  MarketingAndSelling: 'marketing_and_selling',
  ResearchAndDevelopment: 'research_and_development',
  DepreciationAndAmortization: 'depreciation_and_amortization',
  BankCharge: 'bank_charge',
  FinanceCost: 'finance_cost',
  Interest: 'interest',
  UnrealizedLoss: 'unrealized_loss',
  ImpairmentLoss: 'impairment_loss',
  OtherLoss: 'other_loss',
  Bank: 'bank',
  PettyCash: 'petty_cash',
  DefaultCash: 'default_cash',
  StockAndEtfs: 'stock_and_etfs',
  Bonds: 'bonds',
  StatutoryReceivable: 'statutory_receivable',
  TradeReceivable: 'trade_receivable',
  DefaultReceivables: 'default_receivables',
  Default: 'default',
  CreditCard: 'credit_card',
  Overdraft: 'overdraft',
  ShortTermLoan: 'short_term_loan',
  DefaultShortTermDebt: 'default_short_term_debt',
  TaxPayable: 'tax_payable',
  TradePayable: 'trade_payable',
  DefaultPayable: 'default_payable',
  Mortgage: 'mortgage',
  OtherLongTermLoan: 'other_long_term_loan',
  OwnerCapital: 'owner_capital',
  RevaluationReserve: 'revaluation_reserve',
  OpeningBalanceEquity: 'opening_balance_equity',
  Cogs: 'cogs',
  CostOfServices: 'cost_of_services',
  CostOfRevenue: 'cost_of_revenue',
  DefaultDirectCost: 'default_direct_cost',
  TaxExpense: 'tax_expense',
  AssetDisposalLoss: 'asset_disposal_loss',
} as const;
export type ULedgerAccountBehavior =
  (typeof ELedgerAccountBehavior)[keyof typeof ELedgerAccountBehavior];

export const ELedgerAccountSubType = {
  CashAndCashEquivalent: 'cash_and_cash_equivalent',
  ShortTermInvestment: 'short_term_investment',
  Receivables: 'receivables',
  Inventory: 'inventory',
  AccruedIncome: 'accrued_income',
  Prepayments: 'prepayments',
  LongTermInvestment: 'long_term_investment',
  PropertyPlantAndEquipment: 'property_plant_and_equipment',
  IntangibleAssets: 'intangible_assets',
  RightOfUseAssets: 'right_of_use_assets',
  Goodwill: 'goodwill',
  Suspense: 'suspense',
  ShortTermDebt: 'short_term_debt',
  Payable: 'payable',
  AccruedExpense: 'accrued_expense',
  DeferredRevenue: 'deferred_revenue',
  LongTermLoan: 'long_term_loan',
  LeaseLiability: 'lease_liability',
  Provision: 'provision',
  Capital: 'capital',
  RetainedEarnings: 'retained_earnings',
  Reserve: 'reserve',
  OpeningBalance: 'opening_balance',
  Sales: 'sales',
  Services: 'services',
  Subscriptions: 'subscriptions',
  EmploymentIncome: 'employment_income',
  InterestIncome: 'interest_income',
  GainOnAssetSale: 'gain_on_asset_sale',
  UnrealizedGains: 'unrealized_gains',
  Grants: 'grants',
  Gifts: 'gifts',
  DirectCosts: 'direct_costs',
  PayrollAndPersonnel: 'payroll_and_personnel',
  RentAndUtilities: 'rent_and_utilities',
  AdminAndGeneral: 'admin_and_general',
  MarketingAndSelling: 'marketing_and_selling',
  ResearchAndDevelopment: 'research_and_development',
  DepreciationAndAmortization: 'depreciation_and_amortization',
  BankCharge: 'bank_charge',
  FinanceCost: 'finance_cost',
  Interest: 'interest',
  IncomeTaxExpense: 'income_tax_expense',
  UnrealizedLoss: 'unrealized_loss',
  LossOnAssetDisposal: 'loss_on_asset_disposal',
  ImpairmentLoss: 'impairment_loss',
  OtherLoss: 'other_loss',
} as const;
export type ULedgerAccountSubType =
  (typeof ELedgerAccountSubType)[keyof typeof ELedgerAccountSubType];

export const ENormalBalance = {
  Debit: 'debit',
  Credit: 'credit',
} as const;
export type UNormalBalance =
  (typeof ENormalBalance)[keyof typeof ENormalBalance];

export const ELedgerType = {
  Asset: 'asset',
  Liability: 'liability',
  Revenue: 'revenue',
  Expense: 'expense',
  Equity: 'equity',
} as const;
export type ULedgerType = (typeof ELedgerType)[keyof typeof ELedgerType];

export const ELedgerAccountStatus = {
  Draft: 'draft',
  Active: 'active',
  Archived: 'archived',
} as const;
export type ULedgerAccountStatus =
  (typeof ELedgerAccountStatus)[keyof typeof ELedgerAccountStatus];

export const ECounterpartyRole = {
  Employer: 'employer',
  Vendor: 'vendor',
  Contractor: 'contractor',
} as const;
export type UCounterpartyRole =
  (typeof ECounterpartyRole)[keyof typeof ECounterpartyRole];

export const ECounterpartyType = {
  Individual: 'individual',
  Organization: 'organization',
} as const;
export type UCounterpartyType =
  (typeof ECounterpartyType)[keyof typeof ECounterpartyType];

export const ECounterpartyStatus = {
  Draft: 'draft',
  Active: 'active',
  Archived: 'archived',
} as const;
export type UCounterpartyStatus =
  (typeof ECounterpartyStatus)[keyof typeof ECounterpartyStatus];

export const EAppUsageModePreference = {
  PowerUser: 'power_user',
  NonPowerUser: 'non_power_user',
} as const;
export type UAppUsageModePreference =
  (typeof EAppUsageModePreference)[keyof typeof EAppUsageModePreference];

export const EAppThemePreference = {
  Light: 'light',
  Dark: 'dark',
  System: 'system',
} as const;
export type UAppThemePreference =
  (typeof EAppThemePreference)[keyof typeof EAppThemePreference];

export interface IUserAppPreferences {
  theme?: UAppThemePreference;
  appUsageMode: UAppUsageModePreference;
}

export interface IUserPreferences {
  createdBy: TEntityId;
  userId: TEntityId;
  lastActiveAccountingEntityId: TEntityId | null;
  appPreferences: IUserAppPreferences;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IApiValidationError {
  field: string;
  message: string;
}

/** Construct a type with a set of properties K of type T */
export type RecordStringUnknown = Record<string, any>;

export type TErrorCause = RecordStringUnknown;

export interface IHttpErrorDto {
  name: string;
  errorKey: string;
  validationErrors?: IApiValidationError[];
  cause?: TErrorCause;
}

export interface IUserProfileDto {
  id: TEntityId;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IUserPreferencesUpdateDto {
  theme?: UAppThemePreference;
  appUsageMode?: UAppUsageModePreference;
}

export interface IUserProfileUpdateDto {
  firstName?: string;
  lastName?: string;
}

export interface IDateRangeDto {
  /** Inclusive calendar date in YYYY-MM-DD format. */
  from: string;
  /** Inclusive calendar date in YYYY-MM-DD format. */
  to: string;
}

export interface IMoneyDto {
  /** @format double */
  amount: number;
  currencyCode: string;
  isMinorUnit: boolean;
}

export interface IAccountCashFlowBucketDto {
  /** Inclusive calendar date in YYYY-MM-DD format. */
  from: string;
  /** Inclusive calendar date in YYYY-MM-DD format. */
  to: string;
  moneyIn: IMoneyDto;
  moneyOut: IMoneyDto;
}

export interface IAccountCashFlowDto {
  accountId: string;
  currencyCode: string;
  period: IDateRangeDto;
  totalMoneyIn: IMoneyDto;
  totalMoneyOut: IMoneyDto;
  buckets: IAccountCashFlowBucketDto[];
}

/** The requested period may span at most 366 days. */
export interface IGetAccountCashFlowQuery {
  /** Inclusive calendar date in YYYY-MM-DD format. */
  from: string;
  /** Inclusive calendar date in YYYY-MM-DD format. */
  to: string;
  /**
   * Positive integer number of calendar days per bucket, anchored at from.
   * @format double
   */
  bucketDays: number;
}

export interface IAddressDto {
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  countryCode: string;
}

export interface ICounterpartyMetaDto {
  employer?: {
    address: IAddressDto;
    displayName: string | null;
  };
  vendor?: {
    address: IAddressDto | null;
  };
  contractor?: {
    address: IAddressDto;
  };
}

export interface ICounterpartyDto {
  createdBy: string;
  id: string;
  accountingEntityId: string;
  name: string;
  status: UCounterpartyStatus;
  type: UCounterpartyType;
  roles: UCounterpartyRole[];
  meta: ICounterpartyMetaDto;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IAccountCounterpartyParticipationDto {
  counterparty: ICounterpartyDto | null;
  /** True only for transfer lines without a counterparty. */
  isSelf: boolean;
  participation: {
    /**
     * Percentage of the stored account balance, before filtering; null at zero.
     * @format double
     */
    totalShare: number | null;
    functionalAmount: IMoneyDto;
    /** Net contribution in account currency, or functional currency when unset. */
    amount: IMoneyDto;
  };
}

export interface IPaginationResponseMeta {
  /** @format double */
  page: number;
  /** @format double */
  limit: number;
  /** @format double */
  total: number;
  /** @format double */
  totalPages: number;
}

export interface IPaginatedResponseIAccountCounterpartyParticipationDto {
  data: IAccountCounterpartyParticipationDto[];
  meta: IPaginationResponseMeta;
}

export interface IGetAccountCounterpartyParticipationQuery {
  /** @format double */
  page?: number;
  /** @format double */
  limit?: number;
  search?: string;
}

export interface IAssetLiabilityAccountParticipationDto {
  accountId: string;
  accountName: string;
  code: string;
  type: 'asset' | 'liability';
  subType: string;
  status: ULedgerAccountStatus;
  /** Current signed functional balance of this posting account. */
  amount: IMoneyDto;
  /**
   * Percentage of all root balances of the same type before filtering or
   * pagination, rounded to two decimals; null when that total is zero.
   * @format double
   */
  sharePercentage: number | null;
}

export interface IPaginatedResponseIAssetLiabilityAccountParticipationDto {
  data: IAssetLiabilityAccountParticipationDto[];
  meta: IPaginationResponseMeta;
}

export interface IGetAssetLiabilityAccountParticipationQuery {
  /** @format double */
  page?: number;
  /** @format double */
  limit?: number;
  search?: string;
  /** Omit for both asset and liability posting accounts. */
  type?: 'asset' | 'liability';
}

export interface IAssetLiabilitySectionDto {
  /** Cumulative balance through period.to, inclusive. */
  total: IMoneyDto;
  /** Cumulative balance through comparisonPeriod.to, inclusive. */
  previousTotal: IMoneyDto;
  /** Total less previous total. */
  change: IMoneyDto;
  /**
   * Change divided by the absolute previous total; null when it is zero.
   * @format double
   */
  percentageChange: number | null;
}

export interface IAssetLiabilitySummaryDto {
  currencyCode: string;
  period: IDateRangeDto;
  /** Immediately preceding equal-length period, with inclusive dates. */
  comparisonPeriod: IDateRangeDto;
  assets: IAssetLiabilitySectionDto;
  liabilities: IAssetLiabilitySectionDto;
  /** Assets less liabilities: the dashboard's total balance. */
  netAssets: IAssetLiabilitySectionDto;
}

export interface IRevenueExpenseAccountDto {
  accountId: string;
  accountName: string;
  code: string;
  type: 'revenue' | 'expense' | 'asset' | 'liability';
  /** Suspense accounts supply the UI's Uncategorized rows. */
  subType: string;
  status: ULedgerAccountStatus;
  /** Current accumulated functional balance of this posting account. */
  amount: IMoneyDto;
  /**
   * Share of root header balances of this type; null for suspense or a zero total.
   * @format double
   */
  sharePercentage: number | null;
  /**
   * Journal lines on this posting account, including all journal states.
   * @format double
   */
  transactionCount: number;
}

export interface IPaginatedResponseIRevenueExpenseAccountDto {
  data: IRevenueExpenseAccountDto[];
  meta: IPaginationResponseMeta;
}

export interface IGetRevenueExpenseAccountsQuery {
  /** @format double */
  page?: number;
  /** @format double */
  limit?: number;
  search?: string;
  /** Omit for all revenue, expense and suspense posting accounts. */
  type?: 'revenue' | 'expense';
}

export interface IRevenueExpenseSectionDto {
  total: IMoneyDto;
  previousTotal: IMoneyDto;
  /**
   * Percentage change using the absolute previous total; null when it is zero.
   * @format double
   */
  percentageChange: number | null;
  /** Nonzero net amounts, descending by amount, with account ID as a tie-breaker. */
  accounts: {
    /**
     * Signed share of the total, rounded to two decimals; null when total is zero.
     * @format double
     */
    sharePercentage: number | null;
    amount: IMoneyDto;
    accountName: string;
    accountId: string;
  }[];
}

export interface IRevenueExpenseSummaryDto {
  currencyCode: string;
  period: IDateRangeDto;
  /** Immediately preceding equal-length period, with inclusive dates. */
  comparisonPeriod: IDateRangeDto;
  revenue: IRevenueExpenseSectionDto;
  expenses: IRevenueExpenseSectionDto;
  suspense: {
    /** Sum of suspense-line amounts; debit and credit activity do not cancel. */
    amount: IMoneyDto;
    /**
     * Distinct journal entries with a suspense line in the selected period.
     * @format double
     */
    transactionCount: number;
  };
}

export interface ILedgerAccountDto {
  id: TEntityId;
  code: string;
  materializedPath: string;
  accountingEntityId: TEntityId;
  type: ULedgerType;
  normalBalance: UNormalBalance;
  subType: ULedgerAccountSubType;
  behavior: ULedgerAccountBehavior;
  isControlAccount: boolean;
  controlAccountId?: TEntityId;
  name: string;
  status: ULedgerAccountStatus;
  contraAccountRule: UContraAccountRule;
  adjunctAccountRule: UAdjunctAccountRule;
  /** @format date-time */
  openingBalanceDate: string | null;
  createdBy: TEntityId;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  deletedAt?: string;
  balance: IMoneyDto;
  functionalBalance: IMoneyDto;
}

export interface IPaginatedResponseILedgerAccountDto {
  data: ILedgerAccountDto[];
  meta: IPaginationResponseMeta;
}

/** From T, pick a set of properties whose keys are in the union K */
export interface PickIPaginationParamsExcludeKeysOffset {
  /** @format double */
  limit?: number;
  search?: string;
  orderBy?: string;
  sortDirection?: UPaginationSortDirection;
}

export interface IGetLedgerAccountsQuery {
  /** @format double */
  limit?: number;
  search?: string;
  orderBy?: ULedgerAccountSortBy;
  sortDirection?: UPaginationSortDirection;
  /** @format double */
  page?: number;
  status?: ULedgerAccountStatus;
  type?: ULedgerType;
  subType?: ULedgerAccountSubType;
  behavior?: string;
  isControlAccount?: boolean;
}

export interface IChartOfAccountsNodeDto {
  id: TEntityId;
  code: string;
  materializedPath: string;
  accountingEntityId: TEntityId;
  type: ULedgerType;
  normalBalance: UNormalBalance;
  subType: ULedgerAccountSubType;
  behavior: ULedgerAccountBehavior;
  isControlAccount: boolean;
  controlAccountId?: TEntityId;
  name: string;
  status: ULedgerAccountStatus;
  contraAccountRule: UContraAccountRule;
  adjunctAccountRule: UAdjunctAccountRule;
  /** @format date-time */
  openingBalanceDate: string | null;
  createdBy: TEntityId;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  deletedAt?: string;
  balance: IMoneyDto;
  functionalBalance: IMoneyDto;
  children: IChartOfAccountsNodeDto[];
}

export interface IGetChartOfAccountsQuery {
  class: ULedgerType;
  /** Omit accounts without a controlAccountId, retaining their descendants. Defaults to false. */
  omitHeaderAccounts?: boolean;
  /** Case-insensitive partial name search. Returns topmost matches with all descendants. Empty search returns the full tree. Omitted headers cannot match. */
  search?: string;
}

export interface IGetPermittedPostingAccountsQuery {
  sourceType: UJournalEntrySourceType;
  side: 'source' | 'destination';
  filterSuspense?: boolean;
  currencyCode?: string;
  /** @format double */
  page?: number;
  /** @format double */
  limit?: number;
}

export interface IRecommendedBootstrapAccountDto {
  key: string;
  name: string;
  type: string;
  subType: string;
  behavior: string;
  isControlAccount: boolean;
  controlAccountCode?: string;
  meta?: null;
}

export interface IRecommendedBootstrapDto {
  receivables: IRecommendedBootstrapAccountDto[];
  payables: IRecommendedBootstrapAccountDto[];
  revenue: IRecommendedBootstrapAccountDto[];
  expense: IRecommendedBootstrapAccountDto[];
  suspense: IRecommendedBootstrapAccountDto[];
}

export interface IBankDetails {
  countryCode: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export type TLedgerAccountCurrencyUpdateEligibilityDto =
  | {
      canUpdateCurrency: true;
    }
  | {
      reason: ULedgerAccountCurrencyUpdateReason;
      canUpdateCurrency: false;
    };

export type TLedgerAccountDeletionEligibilityDto =
  | {
      canDelete: true;
    }
  | {
      reason: ULedgerAccountDeletionReason;
      canDelete: false;
    };

export interface IExchangeRateDto {
  baseCurrencyCode: string;
  targetCurrencyCode: string;
  /** @format double */
  rate: number;
  type: UExchangeRateType;
  /** @format date-time */
  asOf: string;
  source: string;
}

export interface IOpeningBalanceDto {
  amount: IMoneyDto;
  exchangeRate: IExchangeRateDto | null;
  /** @format date-time */
  date: string;
}

export interface ILedgerAccountOpeningBalanceDto {
  openingBalance: IOpeningBalanceDto | null;
}

export interface IJournalHeaderDto {
  sourceType: UJournalEntrySourceType;
  memo: string | null;
  status: UJournalEntryStatus;
  /** @format date-time */
  effectiveDate: string;
  /** @format date-time */
  postedAt: string | null;
  /** @format date-time */
  voidedAt: string | null;
  voidingEntryId: string | null;
  createdBy: TEntityId;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IExchangeRate {
  currencyPair: string;
  baseCurrencyCode: string;
  targetCurrencyCode: string;
  /** @format double */
  rate: number;
  type: UExchangeRateType;
  /** @format date-time */
  asOf: string;
  source: string;
  /** @format date-time */
  createdAt: string;
}

export interface IAccountTransactionRes {
  createdBy: TEntityId;
  id: string;
  entryId: string;
  accountId: string;
  counterpartyId: string | null;
  /** @format double */
  sequenceOrder: number;
  amount: IMoneyDto;
  exchangeRate: IExchangeRate | null;
  functionalAmount: IMoneyDto;
  side: UJournalSide;
  description: string | null;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  header: IJournalHeaderDto;
  balanceEffect: ULedgerAccountBalanceEffect;
}

export interface IPaginatedResponseIAccountTransactionRes {
  data: IAccountTransactionRes[];
  meta: IPaginationResponseMeta;
}

export interface IPaginationDto {
  /** @format double */
  limit?: number;
  search?: string;
  orderBy?: string;
  sortDirection?: UPaginationSortDirection;
  /** @format double */
  page?: number;
}

export interface IHeaderAccountNameAliasesReq {
  cash_and_cash_equivalent?: string;
  receivables?: string;
  short_term_debt?: string;
  payable?: string;
  retained_earnings?: string;
  opening_balance?: string;
  services?: string;
  employment_income?: string;
  gain_on_asset_sale?: string;
  unrealized_gains?: string;
  grants?: string;
  gifts?: string;
  direct_costs?: string;
  rent_and_utilities?: string;
  bank_charge?: string;
  finance_cost?: string;
  interest?: string;
  income_tax_expense?: string;
  unrealized_loss?: string;
  loss_on_asset_disposal?: string;
  trade_receivables?: string;
  statutory_receivables?: string;
  trade_payables?: string;
  statutory_payables?: string;
}

/** Client-localized names applied only when a posting account is promoted. */
export interface ILedgerAccountPromotionNames {
  newControlAccountName: string;
  newPostingAccountName: string;
}

export interface IBankDetailsCreationReq {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface IBankAccountCreationReq {
  name: string;
  /** Defaults to active when omitted. */
  status?: ULedgerAccountCreationStatus;
  currencyCode: string;
  controlAccountId?: string;
  /** Applied only during promotion; omitted names retain the original account name. */
  promotionNames?: ILedgerAccountPromotionNames;
  bankAccount: IBankDetailsCreationReq;
  openingBalance: IOpeningBalanceDto | null;
}

export interface IPettyCashAccountCreationReq {
  name: string;
  /** Defaults to active when omitted. */
  status?: ULedgerAccountCreationStatus;
  currencyCode: string;
  isControlAccount: boolean;
  controlAccountId?: string;
  /** Applied only during promotion; omitted names retain the original account name. */
  promotionNames?: ILedgerAccountPromotionNames;
  openingBalance: IOpeningBalanceDto | null;
}

export interface ICreateStatutoryReceivableAccountDto {
  name: string;
  /** Defaults to active when omitted. */
  status?: ULedgerAccountCreationStatus;
  isControlAccount: boolean;
  /** @format uuid */
  controlAccountId?: string;
  /** Applied only during promotion; omitted names retain the original account name. */
  promotionNames?: ILedgerAccountPromotionNames;
  currencyCode: string;
}

export interface ICreateTradeReceivableAccountDto {
  name: string;
  /** Defaults to active when omitted. */
  status?: ULedgerAccountCreationStatus;
  isControlAccount: boolean;
  /** @format uuid */
  controlAccountId?: string;
  /** Applied only during promotion; omitted names retain the original account name. */
  promotionNames?: ILedgerAccountPromotionNames;
  currencyCode: string;
}

export interface ICreateExpenseAccountDto {
  name: string;
  /** Defaults to active when omitted. */
  status?: ULedgerAccountCreationStatus;
  isControlAccount: boolean;
  /** @format uuid */
  controlAccountId?: string;
  /** Applied only during promotion; omitted names retain the original account name. */
  promotionNames?: ILedgerAccountPromotionNames;
  behavior: TSupportedExpenseAccountBehavior;
}

export interface IStatutoryPayableAccountMeta {
  taxAuthority: string;
  taxType: string;
}

export interface ICreateStatutoryPayableAccountDto {
  name: string;
  /** Defaults to active when omitted. */
  status?: ULedgerAccountCreationStatus;
  isControlAccount: boolean;
  /** @format uuid */
  controlAccountId?: string;
  /** Applied only during promotion; omitted names retain the original account name. */
  promotionNames?: ILedgerAccountPromotionNames;
  currencyCode: string;
  meta?: IStatutoryPayableAccountMeta | null;
}

export interface ICreateTradePayableAccountDto {
  name: string;
  /** Defaults to active when omitted. */
  status?: ULedgerAccountCreationStatus;
  isControlAccount: boolean;
  /** @format uuid */
  controlAccountId?: string;
  /** Applied only during promotion; omitted names retain the original account name. */
  promotionNames?: ILedgerAccountPromotionNames;
  meta?: {
    /** @format uuid */
    invoiceId: string;
    /** @format uuid */
    counterpartyId: string;
  } | null;
}

export interface ICreateRevenueAccountDto {
  name: string;
  /** Defaults to active when omitted. */
  status?: ULedgerAccountCreationStatus;
  isControlAccount: boolean;
  /** @format uuid */
  controlAccountId?: string;
  /** Applied only during promotion; omitted names retain the original account name. */
  promotionNames?: ILedgerAccountPromotionNames;
  behavior: TSupportedRevenueAccountBehavior;
}

export interface ICreateSuspenseAccountDto {
  name: string;
  type: 'asset' | 'liability';
  currencyCode: string;
}

/** Editable bank ledger and bank details; currency changes require no journal references. */
export interface IBankAccountUpdateReq {
  currencyCode?: string;
  /** Replaces bank details when supplied; omitted details are retained. */
  bankAccount?: IBankDetailsCreationReq;
  name?: string;
  openingBalance?: IOpeningBalanceDto;
}

export interface IPettyCashAccountUpdateReq {
  currencyCode?: string;
  name?: string;
  openingBalance?: IOpeningBalanceDto;
}

/** Editable expense account details; accounting identity is retained. */
export interface IUpdateExpenseAccountDto {
  name: string;
}

/** Editable revenue account details; accounting identity is retained. */
export interface IUpdateRevenueAccountDto {
  name: string;
}

export interface ICashAccountActivationDto {
  /** Posts the associated draft opening balance atomically with account activation when true. */
  activateOpeningBalance: boolean;
}

export interface IFileAttachment {
  url: string;
  name: string;
  type: string;
  /** @format double */
  size: number;
}

export interface IJournalLineListDto {
  id: string;
  entryId: string;
  account: {
    name: string;
    id: string;
  };
  counterparty: {
    status: UCounterpartyStatus;
    name: string;
    id: string;
  } | null;
  /** @format double */
  sequenceOrder: number;
  amount: IMoneyDto;
  exchangeRate: IExchangeRate | null;
  functionalAmount: IMoneyDto;
  side: UJournalSide;
  description: string | null;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IJournalEntryListDto {
  sourceType: UJournalEntrySourceType;
  memo: string | null;
  status: UJournalEntryStatus;
  /** @format date-time */
  effectiveDate: string;
  /** @format date-time */
  postedAt: string | null;
  /** @format date-time */
  voidedAt: string | null;
  voidingEntryId: string | null;
  createdBy: TEntityId;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  id: string;
  accountingEntityId: string;
  attachments: IFileAttachment[];
  lines: IJournalLineListDto[];
}

export interface IPaginatedResponseIJournalEntryListDto {
  data: IJournalEntryListDto[];
  meta: IPaginationResponseMeta;
}

export interface IGetJournalEntriesQuery {
  /** @format double */
  limit?: number;
  search?: string;
  orderBy?: UJournalEntrySortBy;
  sortDirection?: UPaginationSortDirection;
  /** @format double */
  page?: number;
  accountId?: string;
  counterpartyId?: string;
  status?: 'posted' | 'archived';
}

export interface IJournalLineDto {
  createdBy: TEntityId;
  id: string;
  entryId: string;
  accountId: string;
  counterpartyId: string | null;
  /** @format double */
  sequenceOrder: number;
  amount: IMoneyDto;
  exchangeRate: IExchangeRate | null;
  functionalAmount: IMoneyDto;
  side: UJournalSide;
  description: string | null;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IJournalEntryDto {
  sourceType: UJournalEntrySourceType;
  memo: string | null;
  status: UJournalEntryStatus;
  /** @format date-time */
  effectiveDate: string;
  /** @format date-time */
  postedAt: string | null;
  /** @format date-time */
  voidedAt: string | null;
  voidingEntryId: string | null;
  createdBy: TEntityId;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  id: string;
  accountingEntityId: string;
  attachments: IFileAttachment[];
  lines: IJournalLineDto[];
}

export interface IJournalCounterpartyReq {
  id?: string;
  name: string;
  type?: UCounterpartyType;
}

export interface IPaymentEntryLineReq {
  accountId: string;
  counterparty: IJournalCounterpartyReq;
  amount: IMoneyDto;
  exchangeRate: IExchangeRateDto | null;
  description: string | null;
  /** @format double */
  sequenceOrder: number;
}

export interface IPaymentEntryReq {
  /**
   * Opaque handles returned when preparing file uploads. Each corresponding
   * file must be uploaded before the payment is created.
   */
  attachmentReferences?: string[];
  sourceLine: IPaymentEntryLineReq;
  destinationLines: IPaymentEntryLineReq[];
  /** @format date-time */
  effectiveDate: string;
  /** @format date-time */
  postedAt: string | null;
  memo: string | null;
}

export interface IReceiptEntryLineReq {
  accountId: string;
  counterparty: IJournalCounterpartyReq;
  amount: IMoneyDto;
  exchangeRate: IExchangeRateDto | null;
  description: string | null;
  /** @format double */
  sequenceOrder: number;
}

export interface IReceiptEntryReq {
  /**
   * Opaque handles returned when preparing file uploads. Each corresponding
   * file must be uploaded before the receipt is created.
   */
  attachmentReferences?: string[];
  sourceLines: IReceiptEntryLineReq[];
  destinationLine: IReceiptEntryLineReq;
  /** @format date-time */
  effectiveDate: string;
  /** @format date-time */
  postedAt: string | null;
  memo: string | null;
}

export interface ITransferEntryLineReq {
  accountId: string;
  amount: IMoneyDto;
  exchangeRate: IExchangeRateDto | null;
  description: string | null;
  /** @format double */
  sequenceOrder: number;
}

export interface IJournalLineReq {
  accountId: string;
  counterparty: IJournalCounterpartyReq | null;
  amount: IMoneyDto;
  exchangeRate: IExchangeRateDto | null;
  description: string | null;
  /** @format double */
  sequenceOrder: number;
}

export interface ITransferEntryReq {
  /**
   * Opaque handles returned when preparing file uploads. Each corresponding
   * file must be uploaded before the transfer is created.
   */
  attachmentReferences?: string[];
  sourceLine: ITransferEntryLineReq;
  destinationLine: ITransferEntryLineReq;
  chargeLines: IJournalLineReq[];
  /** @format date-time */
  effectiveDate: string;
  /** @format date-time */
  postedAt: string | null;
  memo: string | null;
}

export interface IJournalEntryRectificationDto {
  mode: UJournalEntryRectificationMode;
  originalJournalEntryId: string;
  currentJournalEntryId: string;
  reversingJournalEntryId: string | null;
  journalEntry: IJournalEntryDto;
}

export interface IJournalEntryRectificationCounterpartyLineReq {
  accountId: string;
  counterparty: IJournalCounterpartyReq;
  amount: IMoneyDto;
  exchangeRate: IExchangeRateDto | null;
  description: string | null;
  /** @format double */
  sequenceOrder: number;
  id?: string;
}

export interface IPaymentJournalEntryRectificationReq {
  attachments: IFileAttachment[];
  /** @format date-time */
  effectiveDate: string;
  /** @format date-time */
  postedAt: string | null;
  memo: string | null;
  sourceType: 'payment';
  sourceLine: IJournalEntryRectificationCounterpartyLineReq;
  destinationLines: IJournalEntryRectificationCounterpartyLineReq[];
}

export interface IReceiptJournalEntryRectificationReq {
  attachments: IFileAttachment[];
  /** @format date-time */
  effectiveDate: string;
  /** @format date-time */
  postedAt: string | null;
  memo: string | null;
  sourceType: 'receipt';
  sourceLines: IJournalEntryRectificationCounterpartyLineReq[];
  destinationLine: IJournalEntryRectificationCounterpartyLineReq;
}

export interface ITransferJournalEntryRectificationLineReq {
  id?: string;
  accountId: string;
  amount: IMoneyDto;
  exchangeRate: IExchangeRateDto | null;
  description: string | null;
  /** @format double */
  sequenceOrder: number;
}

export interface IJournalEntryRectificationLineReq {
  accountId: string;
  counterparty: IJournalCounterpartyReq | null;
  amount: IMoneyDto;
  exchangeRate: IExchangeRateDto | null;
  description: string | null;
  /** @format double */
  sequenceOrder: number;
  id?: string;
}

export interface ITransferJournalEntryRectificationReq {
  attachments: IFileAttachment[];
  /** @format date-time */
  effectiveDate: string;
  /** @format date-time */
  postedAt: string | null;
  memo: string | null;
  sourceType: 'transfer';
  sourceLine: ITransferJournalEntryRectificationLineReq;
  destinationLine: ITransferJournalEntryRectificationLineReq;
  chargeLines: IJournalEntryRectificationLineReq[];
}

export type TJournalEntryRectificationReq =
  | IPaymentJournalEntryRectificationReq
  | IReceiptJournalEntryRectificationReq
  | ITransferJournalEntryRectificationReq;

/** Make all properties in T readonly */
export type ReadonlyRecordStringString = Record<string, string>;

export interface IFileUploadDto {
  uploadUrl: string;
  /**
   * Opaque server-issued handle used to associate this upload with a later
   * application request. It is not a file URL or cloud-storage object key.
   */
  reference: string;
  /** Make all properties in T readonly */
  headers: ReadonlyRecordStringString;
  file: IFileAttachment;
}

export interface IFileUploadReq {
  name: string;
  type: string;
  /** @format double */
  size: number;
  purpose: UFileUploadPurpose;
}

export interface ICurrencyDto {
  code: string;
  symbol: string;
  name: string;
  /** @format double */
  minorUnit: number;
}

/** From T, pick a set of properties whose keys are in the union K */
export interface PickIPaginationDtoExcludeKeysSearchOrSortDirection {
  /** @format double */
  page?: number;
  /** @format double */
  limit?: number;
  orderBy?: string;
}

export interface IExchangeRateQueryParam {
  /** @format double */
  page?: number;
  /** @format double */
  limit?: number;
  orderBy?: string;
  currencyPair: string;
  type?: UExchangeRateType;
  /** @format date-time */
  asOf?: string;
}

export interface IPaginatedResponseICounterpartyDto {
  data: ICounterpartyDto[];
  meta: IPaginationResponseMeta;
}

export interface IGetCounterpartiesQuery {
  /** @format double */
  limit?: number;
  search?: string;
  orderBy?: UCounterpartySortBy;
  sortDirection?: UPaginationSortDirection;
  /** @format double */
  page?: number;
  roles?: UCounterpartyRole[];
  type?: UCounterpartyType;
  status?: UCounterpartyStatus;
}

export interface ICounterpartyDeletionEligibilityDto {
  canDelete: boolean;
}

export interface ICounterpartyCreateMetaReq {
  employer?: {
    address: IAddressDto;
    displayName?: string | null;
  };
  vendor?: {
    address?: IAddressDto | null;
  };
  contractor?: {
    address: IAddressDto;
  };
}

export interface ICounterpartyCreateReq {
  name: string;
  status: UCounterpartyStatus;
  type: UCounterpartyType;
  meta?: ICounterpartyCreateMetaReq;
}

export interface ICounterpartyUpdateReq {
  name?: string;
  type?: UCounterpartyType;
  /** Omit for ordinary edits; Active explicitly requests Draft activation. */
  status?: 'active';
  /** Complete role replacement when supplied; {} clears all roles. */
  meta?: ICounterpartyCreateMetaReq;
}

export interface IBankDirectoryDto {
  countryCode: string;
  bankCode: string;
  bankName: string;
}

export interface IGetBanksQuery {
  countryCode: string;
}

export interface IUserSignupReq {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IAccessToken {
  accessToken: string;
}

export interface IVerifyEmailReq {
  token: string;
}

export interface IEmailLoginReq {
  email: string;
  password: string;
}

export interface IRequestPasswordResetReq {
  email: string;
}

export interface IResetPasswordReq {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface IAccountingEntity {
  createdBy: TEntityId;
  id: TEntityId;
  name: string;
  status: UAccountingEntityStatus;
  type: UAccountingEntityType;
  ownerId: TEntityId;
  functionalCurrencyCode: UCurrencyCode;
  jurisdictionCode: UJurisdictionCode;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IFiscalYear {
  id: TEntityId;
  createdBy: TEntityId;
  name: string;
  status: UFiscalYearStatus;
  accountingEntityId: TEntityId;
  /** @format date-time */
  startDate: string;
  /** @format date-time */
  endDate: string;
  /** @format date-time */
  closedAt: string | null;
  /** @format date-time */
  updatedAt: string;
}

export interface IAccountingContext {
  createdBy: TEntityId;
  id: TEntityId;
  name: string;
  description: string | null;
  accountingEntityId: TEntityId;
  accountingStandardCode: UAccountingStandardCode;
  fiscalYearId: TEntityId;
  accountingIntervalId: TEntityId;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  closedAt: string | null;
}

export interface IAccountingPeriod {
  id: TEntityId;
  intervalId: TEntityId;
  accountingEntityId: TEntityId;
  /** @format double */
  ordinal: number;
  name: string;
  /**
   * Inclusive start instant.
   * @format date-time
   */
  startDate: string;
  /**
   * Exclusive end instant, shared with the following period's start.
   * @format date-time
   */
  endDate: string;
  status: UAccountingPeriodStatus;
  createdBy: TEntityId;
  /** @format date-time */
  closedAt: string | null;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IPeriod {
  id: TEntityId;
  intervalId: TEntityId;
  accountingEntityId: TEntityId;
  /** @format double */
  ordinal: number;
  name: string;
  /**
   * Inclusive start instant.
   * @format date-time
   */
  startDate: string;
  /**
   * Exclusive end instant, shared with the following period's start.
   * @format date-time
   */
  endDate: string;
}

/** From T, pick a set of properties whose keys are in the union K */
export interface PickIIntervalExcludeKeysUnit {
  id: TEntityId;
  accountingEntityId: TEntityId;
  /**
   * Total number of periods, not the number of units per period.
   * @format double
   */
  count: number;
  /**
   * Inclusive start instant.
   * @format date-time
   */
  startDate: string;
  /**
   * Exclusive end instant.
   * @format date-time
   */
  endDate: string;
  /** @format double */
  currentPeriodOrdinal: number;
  /** @format date-time */
  nextPeriodStartDate: string;
  periods: IPeriod[];
}

export interface IAccountingInterval {
  id: TEntityId;
  accountingEntityId: TEntityId;
  /**
   * Total number of periods, not the number of units per period.
   * @format double
   */
  count: number;
  /**
   * Inclusive start instant.
   * @format date-time
   */
  startDate: string;
  /**
   * Exclusive end instant.
   * @format date-time
   */
  endDate: string;
  /** @format double */
  currentPeriodOrdinal: number;
  /** @format date-time */
  nextPeriodStartDate: string;
  periods: IAccountingPeriod[];
  unit: UAccountingIntervalUnit;
  fiscalYearId: TEntityId;
  createdBy: TEntityId;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IReportingContext {
  createdBy: TEntityId;
  id: TEntityId;
  name: string;
  description: string | null;
  accountingEntityId: TEntityId;
  reportingCurrencyCode: UCurrencyCode;
  accountingContextId: TEntityId;
  reportingIntervalId: TEntityId;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  closedAt: string | null;
}

export interface IReportingPeriod {
  id: TEntityId;
  intervalId: TEntityId;
  accountingEntityId: TEntityId;
  /** @format double */
  ordinal: number;
  name: string;
  /**
   * Inclusive start instant.
   * @format date-time
   */
  startDate: string;
  /**
   * Exclusive end instant, shared with the following period's start.
   * @format date-time
   */
  endDate: string;
  createdBy: TEntityId;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IReportingInterval {
  id: TEntityId;
  accountingEntityId: TEntityId;
  /**
   * Total number of periods, not the number of units per period.
   * @format double
   */
  count: number;
  /**
   * Inclusive start instant.
   * @format date-time
   */
  startDate: string;
  /**
   * Exclusive end instant.
   * @format date-time
   */
  endDate: string;
  /** @format double */
  currentPeriodOrdinal: number;
  /** @format date-time */
  nextPeriodStartDate: string;
  periods: IReportingPeriod[];
  unit: UReportingIntervalUnit;
  fiscalYearId: TEntityId;
  createdBy: TEntityId;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IAccountingStandardDto {
  individual: string[];
  sole_trader: string[];
  private_company: string[];
}

export interface IJurisdictionDto {
  code: string;
  name: string;
  currencyCode: string;
  /** @format double */
  maxFiscalMonths: number;
  accountingStandards: IAccountingStandardDto;
}

/** Standalone accounting entity creation DTO */
export interface IAccountingEntityCreationDto {
  name: string;
  entityType: UAccountingEntityType;
  jurisdictionCode: UJurisdictionCode;
  functionalCurrencyCode: UCurrencyCode;
}

export interface IFiscalYearCreationReq {
  accountingEntityId: string;
  name?: string;
  /** @format date-time */
  startDate: string;
  /** @format date-time */
  endDate: string;
  status: UFiscalYearStatus;
}

export interface IPeriodMakePayload {
  name: string;
}

export interface IAccountingIntervalCreationReq {
  unit: UAccountingIntervalUnit;
  /**
   * Total number of periods, not the number of units per period.
   * @format double
   */
  count: number;
  periods: IPeriodMakePayload[];
  fiscalYearId: string;
}

export interface IAccountingContextCreationReq {
  fiscalYearId: string;
  accountingStandardCode: UAccountingStandardCode;
  accountingIntervalId: string;
  name: string;
  description: string | null;
}

export interface IReportingIntervalCreationReq {
  unit: UReportingIntervalUnit;
  /**
   * Total number of periods, not the number of units per period.
   * @format double
   */
  count: number;
  periods: IPeriodMakePayload[];
  fiscalYearId: string;
}

export interface IReportingContextCreationReq {
  accountingContextId: string;
  reportingIntervalId: string;
  reportingCurrencyCode: UCurrencyCode;
  name: string;
  description: string | null;
}

export interface IAccountingEntityUpdateReq {
  name?: string;
  entityType?: UAccountingEntityType;
  functionalCurrencyCode?: UCurrencyCode;
}

export interface IAccountingEntitySwitchReq {
  accountingEntityId: string;
}

export type TEntityId = string;

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from 'axios';
import axios from 'axios';

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<
  AxiosRequestConfig,
  'data' | 'params' | 'url' | 'responseType'
> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  'body' | 'method' | 'query' | 'path'
>;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<
  AxiosRequestConfig,
  'data' | 'cancelToken'
> {
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export const EContentType = {
  Json: 'application/json',
  JsonApi: 'application/vnd.api+json',
  FormData: 'multipart/form-data',
  UrlEncoded: 'application/x-www-form-urlencoded',
  Text: 'text/plain',
} as const;
export type ContentType = (typeof EContentType)[keyof typeof EContentType];

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || '/api/v1',
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem)
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === EContentType.FormData &&
      body &&
      body !== null &&
      typeof body === 'object'
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === EContentType.Text &&
      body &&
      body !== null &&
      typeof body !== 'string'
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { 'Content-Type': type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title drimsheet-core
 * @version 0.1.0-alpha.1
 * @baseUrl /api/v1
 * @contact Osahon Oboite
 *
 * This repo contains the server-side source code for Drimsheet's bookkeeping and tax app.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  users = {
    /**
     * @description Get user preferences
     *
     * @tags User
     * @name GetUserPreferences
     * @request GET:/users/preferences
     * @secure
     */
    getUserPreferences: (params: RequestParams = {}) =>
      this.request<IUserPreferences, IHttpErrorDto>({
        path: `/users/preferences`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update user preferences
     *
     * @tags User
     * @name UpdateUserPreferences
     * @request PATCH:/users/preferences
     * @secure
     */
    updateUserPreferences: (
      data: IUserPreferencesUpdateDto,
      params: RequestParams = {}
    ) =>
      this.request<IUserPreferences, IHttpErrorDto>({
        path: `/users/preferences`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get authenticated user profile
     *
     * @tags User
     * @name GetAuthUserProfile
     * @request GET:/users/profile
     * @secure
     */
    getAuthUserProfile: (params: RequestParams = {}) =>
      this.request<IUserProfileDto, IHttpErrorDto>({
        path: `/users/profile`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update the authenticated user's first and/or last name.
     *
     * @tags User
     * @name UpdateAuthUserProfile
     * @request PATCH:/users/profile
     * @secure
     */
    updateAuthUserProfile: (
      data: IUserProfileUpdateDto,
      params: RequestParams = {}
    ) =>
      this.request<IUserProfileDto, IHttpErrorDto>({
        path: `/users/profile`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  reporting = {
    /**
     * @description Money in/out for a bank or petty-cash posting account, in its own currency. Dates are inclusive; periods longer than 366 days return 400. Buckets start at from and include zero-activity intervals. Corrected originals, reversals, drafts, never-posted entries and opening balances are excluded. Historical results can change after rectification. Either gross total above 1 trillion major currency units returns 400. Unsafe numeric serialization returns 500.
     *
     * @tags Reporting
     * @name GetAccountCashFlow
     * @request GET:/reporting/accounts/{accountId}/cash-flow
     */
    getAccountCashFlow: (
      accountId: string,
      query: {
        /** Inclusive calendar date in YYYY-MM-DD format. */
        from: string;
        /** Inclusive calendar date in YYYY-MM-DD format. */
        to: string;
        /**
         * Positive integer number of calendar days per bucket, anchored at from.
         * @format double
         */
        bucketDays: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<IAccountCashFlowDto, IHttpErrorDto>({
        path: `/reporting/accounts/${accountId}/cash-flow`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Counterparty contributions to the current balance of a posting or control account, including descendants. Reads journals through only the requested account's adjustments, excluding drafts, never-posted entries, voided originals and reversals. Archived records and opening balances remain included. Amounts use account currency, falling back to functional currency. Shares use the stored account balance before search/pagination, rounded to two decimals; zero balances yield null. Balances update asynchronously. Counterparty-less transfers have isSelf=true and search by entity name; other unattributed lines have isSelf=false. Counterparties sort by name/ID, followed by self and unattributed rows. Defaults to page 1, limit 10. Amount magnitudes above 1 trillion major units return 400; missing accounts or balances return 404; unsafe numeric serialization returns 500.
     *
     * @tags Reporting
     * @name GetAccountCounterpartyParticipation
     * @request GET:/reporting/accounts/{accountId}/counterparty-participation
     */
    getAccountCounterpartyParticipation: (
      accountId: string,
      query?: {
        /** @format double */
        page?: number;
        /** @format double */
        limit?: number;
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<
        IPaginatedResponseIAccountCounterpartyParticipationDto,
        IHttpErrorDto
      >({
        path: `/reporting/accounts/${accountId}/counterparty-participation`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Asset/liability posting accounts with current signed functional balances. Reads stored balances only; balances update asynchronously. Includes all statuses, zero balances and suspense. Shares use all root balances of the same type, including root posting accounts, before search/pagination. Control accounts are excluded from rows. Zero totals yield null shares; percentages round to two decimals. Search matches name or code; rows sort by code/ID. Omit type for both classes. No date range is applied. Amount magnitudes above 1 trillion major units return 400; missing balances return 404; unsafe numeric serialization returns 500. Defaults to page 1, limit 10.
     *
     * @tags Reporting
     * @name GetAssetLiabilityAccountParticipation
     * @request GET:/reporting/asset-liability-account-participation
     */
    getAssetLiabilityAccountParticipation: (
      query?: {
        /** @format double */
        page?: number;
        /** @format double */
        limit?: number;
        search?: string;
        /** Omit for both asset and liability posting accounts. */
        type?: 'asset' | 'liability';
      },
      params: RequestParams = {}
    ) =>
      this.request<
        IPaginatedResponseIAssetLiabilityAccountParticipationDto,
        IHttpErrorDto
      >({
        path: `/reporting/asset-liability-account-participation`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Cumulative assets, liabilities and net assets in the functional currency. Dates are inclusive, up to 366 days. Compares balances at period end with the end of the immediately preceding equal-length period. Includes opening balances, suspense, contra/adjunct and archived accounts. Excludes drafts, never-posted entries, voided originals and reversals. Journal lines are counted once without hierarchy rollups. Historical results can change after rectification. Percentage changes use the absolute previous balance and are null when it is zero. Amount magnitudes above 1 trillion major units return 400; unsafe numeric serialization returns 500.
     *
     * @tags Reporting
     * @name GetAssetLiabilitySummary
     * @request GET:/reporting/asset-liability-summary
     */
    getAssetLiabilitySummary: (
      query: {
        /** Inclusive calendar date in YYYY-MM-DD format. */
        from: string;
        /** Inclusive calendar date in YYYY-MM-DD format. */
        to: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<IAssetLiabilitySummaryDto, IHttpErrorDto>({
        path: `/reporting/asset-liability-summary`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Revenue/expense and suspense posting accounts (isControlAccount=false) with current accumulated functional balances. Balances update asynchronously; counts read each posting account's own live journal lines in all states. All account statuses and zero balances remain visible. Shares use the summed balances of root revenue/expense headers (controlAccountId=null) of the same type before search/pagination; headers are never included as table rows; suspense and zero totals have null shares. Omit type for All. Search matches account name or code; rows sort by code then ID. No date range is applied. Amount magnitudes above 1 trillion major units return 400; missing balances or unsafe numeric serialization return 500.
     *
     * @tags Reporting
     * @name GetRevenueExpenseAccounts
     * @request GET:/reporting/revenue-expense-accounts
     */
    getRevenueExpenseAccounts: (
      query?: {
        /** @format double */
        page?: number;
        /** @format double */
        limit?: number;
        search?: string;
        /** Omit for all revenue, expense and suspense posting accounts. */
        type?: 'revenue' | 'expense';
      },
      params: RequestParams = {}
    ) =>
      this.request<IPaginatedResponseIRevenueExpenseAccountDto, IHttpErrorDto>({
        path: `/reporting/revenue-expense-accounts`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Revenue, expenses and suspense activity in the entity's functional currency. Dates are inclusive, up to 366 days, compared with the immediately preceding equal-length period. Revenue is credits less debits; expenses are debits less credits. Suspense counts distinct entries and sums suspense-line amounts. Drafts, never-posted entries, voided originals, reversals and opening balances are excluded. Archived account activity remains included. Historical results can change after rectification. Zero denominators produce null percentages. Amount magnitudes above 1 trillion major units return 400; unsafe numeric serialization returns 500. Returns posting-account breakdowns, not rollups.
     *
     * @tags Reporting
     * @name GetRevenueExpenseSummary
     * @request GET:/reporting/revenue-expense-summary
     */
    getRevenueExpenseSummary: (
      query: {
        /** Inclusive calendar date in YYYY-MM-DD format. */
        from: string;
        /** Inclusive calendar date in YYYY-MM-DD format. */
        to: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<IRevenueExpenseSummaryDto, IHttpErrorDto>({
        path: `/reporting/revenue-expense-summary`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),
  };
  ledger = {
    /**
     * @description Get paginated ledger accounts with optional filters
     *
     * @tags Ledger
     * @name GetLedgerAccounts
     * @request GET:/ledger
     */
    getLedgerAccounts: (
      query?: {
        /** @format double */
        limit?: number;
        search?: string;
        orderBy?: ULedgerAccountSortBy;
        sortDirection?: UPaginationSortDirection;
        /** @format double */
        page?: number;
        status?: ULedgerAccountStatus;
        type?: ULedgerType;
        subType?: ULedgerAccountSubType;
        behavior?: string;
        isControlAccount?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<IPaginatedResponseILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get the complete chart of accounts for a required class, across all statuses. Returns roots with nested children, ordered by materialized path. Omit header accounts to promote their direct children to response roots. Search names case-insensitively to return topmost matches with complete subtrees. Omitted headers are excluded from matching.
     *
     * @tags Ledger
     * @name GetChartOfAccounts
     * @request GET:/ledger/chart-of-accounts
     */
    getChartOfAccounts: (
      query: {
        class: ULedgerType;
        /** Omit accounts without a controlAccountId, retaining their descendants. Defaults to false. */
        omitHeaderAccounts?: boolean;
        /** Case-insensitive partial name search. Returns topmost matches with all descendants. Empty search returns the full tree. Omitted headers cannot match. */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<IChartOfAccountsNodeDto[], IHttpErrorDto>({
        path: `/ledger/chart-of-accounts`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get paginated posting accounts permitted by a journal-entry rule
     *
     * @tags Ledger
     * @name GetPermittedPostingAccounts
     * @request GET:/ledger/posting-accounts
     */
    getPermittedPostingAccounts: (
      query: {
        sourceType: UJournalEntrySourceType;
        side: 'source' | 'destination';
        filterSuspense?: boolean;
        currencyCode?: string;
        /** @format double */
        page?: number;
        /** @format double */
        limit?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<IPaginatedResponseILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/posting-accounts`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get recommended posting account setup, grouped with nested sub accounts.
     *
     * @tags Ledger
     * @name GetRecommendedBootstrap
     * @request GET:/ledger/recommended-bootstrap
     */
    getRecommendedBootstrap: (params: RequestParams = {}) =>
      this.request<IRecommendedBootstrapDto, IHttpErrorDto>({
        path: `/ledger/recommended-bootstrap`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Get a single ledger account by id
     *
     * @tags Ledger
     * @name GetLedgerAccount
     * @request GET:/ledger/{accountId}
     */
    getLedgerAccount: (accountId: string, params: RequestParams = {}) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/${accountId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Deletes an eligible account and its eligible subtree with all associated draft journals. Accounts without a controlAccountId and non-draft accounts with journal entries return 400; a non-draft journal associated with a draft account is an unexpected invariant violation (500).
     *
     * @tags Ledger
     * @name DeleteLedgerAccount
     * @request DELETE:/ledger/{accountId}
     */
    deleteLedgerAccount: (accountId: string, params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/ledger/${accountId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Get the bank details of a ledger account with bank behavior.
     *
     * @tags Ledger
     * @name GetBankDetails
     * @request GET:/ledger/{accountId}/bank-details
     */
    getBankDetails: (accountId: string, params: RequestParams = {}) =>
      this.request<IBankDetails, IHttpErrorDto>({
        path: `/ledger/${accountId}/bank-details`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Check whether an account is an asset with no historically posted journal entries. Draft entries do not block eligibility. Ineligible results include the reason. This result is advisory; currency updates also enforce their own validation.
     *
     * @tags Ledger
     * @name GetLedgerAccountCurrencyUpdateEligibility
     * @request GET:/ledger/{accountId}/currency-update-eligibility
     */
    getLedgerAccountCurrencyUpdateEligibility: (
      accountId: string,
      params: RequestParams = {}
    ) =>
      this.request<TLedgerAccountCurrencyUpdateEligibilityDto, IHttpErrorDto>({
        path: `/ledger/${accountId}/currency-update-eligibility`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Check whether a ledger account is not a header and is either draft or has no associated journal entries. Ineligible results include the blocking reason. This result is advisory.
     *
     * @tags Ledger
     * @name GetLedgerAccountDeletionEligibility
     * @request GET:/ledger/{accountId}/deletion-eligibility
     */
    getLedgerAccountDeletionEligibility: (
      accountId: string,
      params: RequestParams = {}
    ) =>
      this.request<TLedgerAccountDeletionEligibilityDto, IHttpErrorDto>({
        path: `/ledger/${accountId}/deletion-eligibility`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Get the current draft or posted opening balance, or null when none exists.
     *
     * @tags Ledger
     * @name GetLedgerAccountOpeningBalance
     * @request GET:/ledger/{accountId}/opening-balance
     */
    getLedgerAccountOpeningBalance: (
      accountId: string,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountOpeningBalanceDto, IHttpErrorDto>({
        path: `/ledger/${accountId}/opening-balance`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Get direct sub accounts only, returning an empty array when there are none.
     *
     * @tags Ledger
     * @name GetLedgerSubAccounts
     * @request GET:/ledger/{accountId}/sub-accounts
     */
    getLedgerSubAccounts: (accountId: string, params: RequestParams = {}) =>
      this.request<ILedgerAccountDto[], IHttpErrorDto>({
        path: `/ledger/${accountId}/sub-accounts`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description List transactions for an account
     *
     * @tags Ledger
     * @name ListTransactions
     * @request GET:/ledger/{accountId}/transactions
     */
    listTransactions: (
      accountId: string,
      query?: {
        /** @format double */
        limit?: number;
        search?: string;
        orderBy?: string;
        sortDirection?: UPaginationSortDirection;
        /** @format double */
        page?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<IPaginatedResponseIAccountTransactionRes, IHttpErrorDto>({
        path: `/ledger/${accountId}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Set up all 24 header, equity, and standard receivable/payable control accounts atomically, with optional translated names.
     *
     * @tags Ledger
     * @name SetupHeaderAccounts
     * @request POST:/ledger/header-accounts/setup
     */
    setupHeaderAccounts: (
      data?: IHeaderAccountNameAliasesReq,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto[], IHttpErrorDto>({
        path: `/ledger/header-accounts/setup`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an Active or Draft bank subaccount; status defaults to Active.
     *
     * @tags Asset Accounts, Ledger
     * @name CreateBankAccount
     * @request POST:/ledger/asset/bank
     */
    createBankAccount: (
      data: IBankAccountCreationReq,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/asset/bank`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an Active or Draft petty-cash subaccount; status defaults to Active.
     *
     * @tags Asset Accounts, Ledger
     * @name CreatePettyCashAccount
     * @request POST:/ledger/asset/petty-cash
     */
    createPettyCashAccount: (
      data: IPettyCashAccountCreationReq,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/asset/petty-cash`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an Active or Draft statutory receivable subaccount; status defaults to Active.
     *
     * @tags Asset Accounts, Ledger
     * @name CreateStatutoryReceivableAccount
     * @request POST:/ledger/asset/receivables/statutory
     */
    createStatutoryReceivableAccount: (
      data: ICreateStatutoryReceivableAccountDto,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/asset/receivables/statutory`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an Active or Draft trade receivable subaccount; status defaults to Active.
     *
     * @tags Asset Accounts, Ledger
     * @name CreateTradeReceivableAccount
     * @request POST:/ledger/asset/receivables/trade
     */
    createTradeReceivableAccount: (
      data: ICreateTradeReceivableAccountDto,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/asset/receivables/trade`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an Active or Draft expense subaccount; status defaults to Active.
     *
     * @tags Expense Accounts, Ledger
     * @name CreateExpenseAccount
     * @request POST:/ledger/expenses
     */
    createExpenseAccount: (
      data: ICreateExpenseAccountDto,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/expenses`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an Active or Draft statutory payable subaccount; status defaults to Active.
     *
     * @tags Liability Accounts, Ledger
     * @name CreateStatutoryPayableAccount
     * @request POST:/ledger/liability/payables/statutory
     */
    createStatutoryPayableAccount: (
      data: ICreateStatutoryPayableAccountDto,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/liability/payables/statutory`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an Active or Draft trade payable subaccount; status defaults to Active.
     *
     * @tags Liability Accounts, Ledger
     * @name CreateTradePayableAccount
     * @request POST:/ledger/liability/payables/trade
     */
    createTradePayableAccount: (
      data: ICreateTradePayableAccountDto,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/liability/payables/trade`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an Active or Draft revenue subaccount; status defaults to Active.
     *
     * @tags Revenue Accounts, Ledger
     * @name CreateRevenueAccount
     * @request POST:/ledger/revenues
     */
    createRevenueAccount: (
      data: ICreateRevenueAccountDto,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/revenues`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create one asset or liability suspense account for the selected currency.
     *
     * @tags Ledger
     * @name CreateSuspenseAccount
     * @request POST:/ledger/suspense
     */
    createSuspenseAccount: (
      data: ICreateSuspenseAccountDto,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/suspense`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update the name, bank details, and/or opening balance of a non-archived bank account. Supplied bank details replace all three fields; omitted fields are retained.
     *
     * @tags Asset Accounts, Ledger
     * @name UpdateBankAccount
     * @request PATCH:/ledger/asset/bank/{accountId}
     */
    updateBankAccount: (
      accountId: string,
      data: IBankAccountUpdateReq,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/asset/bank/${accountId}`,
        method: 'PATCH',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update the name and/or opening balance of a non-archived petty cash account. Omitted fields are retained.
     *
     * @tags Asset Accounts, Ledger
     * @name UpdatePettyCashAccount
     * @request PATCH:/ledger/asset/petty-cash/{accountId}
     */
    updatePettyCashAccount: (
      accountId: string,
      data: IPettyCashAccountUpdateReq,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/asset/petty-cash/${accountId}`,
        method: 'PATCH',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update the name of a non-archived expense account, retaining its accounting identity and balances.
     *
     * @tags Expense Accounts, Ledger
     * @name UpdateExpenseAccount
     * @request PATCH:/ledger/expense/{accountId}
     */
    updateExpenseAccount: (
      accountId: string,
      data: IUpdateExpenseAccountDto,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/expense/${accountId}`,
        method: 'PATCH',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update the name of a non-archived revenue account, retaining its accounting identity and balances.
     *
     * @tags Revenue Accounts, Ledger
     * @name UpdateRevenueAccount
     * @request PATCH:/ledger/revenue/{accountId}
     */
    updateRevenueAccount: (
      accountId: string,
      data: IUpdateRevenueAccountDto,
      params: RequestParams = {}
    ) =>
      this.request<ILedgerAccountDto, IHttpErrorDto>({
        path: `/ledger/revenue/${accountId}`,
        method: 'PATCH',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Activates a draft petty cash or bank account beneath an active parent. Requires activateOpeningBalance; when true, posts the associated draft opening-balance journal atomically. When false, leaves the opening balance untouched. Other account families and non-draft accounts return 400.
     *
     * @tags Asset Accounts, Ledger
     * @name ActivateCashAccount
     * @request POST:/ledger/asset/cash/{accountId}/activate
     */
    activateCashAccount: (
      accountId: string,
      data: ICashAccountActivationDto,
      params: RequestParams = {}
    ) =>
      this.request<void, IHttpErrorDto>({
        path: `/ledger/asset/cash/${accountId}/activate`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        ...params,
      }),

    /**
     * @description Activates a draft expense account beneath an active parent. Requires no body; non-expense and non-draft accounts return 400.
     *
     * @tags Expense Accounts, Ledger
     * @name ActivateExpenseAccount
     * @request POST:/ledger/expense/{accountId}/activate
     */
    activateExpenseAccount: (accountId: string, params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/ledger/expense/${accountId}/activate`,
        method: 'POST',
        ...params,
      }),

    /**
     * @description Activates a draft revenue account beneath an active parent. Requires no body; non-revenue and non-draft accounts return 400.
     *
     * @tags Revenue Accounts, Ledger
     * @name ActivateRevenueAccount
     * @request POST:/ledger/revenue/{accountId}/activate
     */
    activateRevenueAccount: (accountId: string, params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/ledger/revenue/${accountId}/activate`,
        method: 'POST',
        ...params,
      }),

    /**
     * @description Archives a non-header account and all control-account descendants, retaining history. Already archived accounts are no-ops. Header accounts return 400. Archived accounts cannot appear in new journals, including reversals.
     *
     * @tags Ledger
     * @name ArchiveLedgerAccount
     * @request POST:/ledger/{accountId}/archive
     */
    archiveLedgerAccount: (accountId: string, params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/ledger/${accountId}/archive`,
        method: 'POST',
        ...params,
      }),
  };
  journalEntries = {
    /**
     * @description Get paginated journal entries with optional line participation filters
     *
     * @tags Journal Entry
     * @name GetJournalEntries
     * @request GET:/journal-entries
     */
    getJournalEntries: (
      query?: {
        /** @format double */
        limit?: number;
        search?: string;
        orderBy?: UJournalEntrySortBy;
        sortDirection?: UPaginationSortDirection;
        /** @format double */
        page?: number;
        accountId?: string;
        counterpartyId?: string;
        status?: 'posted' | 'archived';
      },
      params: RequestParams = {}
    ) =>
      this.request<IPaginatedResponseIJournalEntryListDto, IHttpErrorDto>({
        path: `/journal-entries`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get a journal entry by id
     *
     * @tags Journal Entry
     * @name GetJournalEntry
     * @request GET:/journal-entries/{id}
     */
    getJournalEntry: (id: string, params: RequestParams = {}) =>
      this.request<IJournalEntryListDto, IHttpErrorDto>({
        path: `/journal-entries/${id}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete a never-posted journal entry or reverse a previously-posted entry.
     *
     * @tags Journal Entry
     * @name DeleteJournalEntry
     * @request DELETE:/journal-entries/{id}
     */
    deleteJournalEntry: (id: string, params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/journal-entries/${id}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Create payment journal entry
     *
     * @tags Journal Entry
     * @name CreatePayment
     * @request POST:/journal-entries/payment
     */
    createPayment: (data: IPaymentEntryReq, params: RequestParams = {}) =>
      this.request<IJournalEntryDto, IHttpErrorDto>({
        path: `/journal-entries/payment`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create receipt journal entry
     *
     * @tags Journal Entry
     * @name CreateReceipt
     * @request POST:/journal-entries/receipt
     */
    createReceipt: (data: IReceiptEntryReq, params: RequestParams = {}) =>
      this.request<IJournalEntryDto, IHttpErrorDto>({
        path: `/journal-entries/receipt`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create transfer journal entry
     *
     * @tags Journal Entry
     * @name CreateTransfer
     * @request POST:/journal-entries/transfer
     */
    createTransfer: (data: ITransferEntryReq, params: RequestParams = {}) =>
      this.request<IJournalEntryDto, IHttpErrorDto>({
        path: `/journal-entries/transfer`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Correct a journal entry while preserving its accounting audit trail.
     *
     * @tags Journal Entry
     * @name RectifyJournalEntry
     * @request POST:/journal-entries/{id}/rectify
     */
    rectifyJournalEntry: (
      id: string,
      data: TJournalEntryRectificationReq,
      params: RequestParams = {}
    ) =>
      this.request<IJournalEntryRectificationDto, IHttpErrorDto>({
        path: `/journal-entries/${id}/rectify`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Posts only the associated draft opening balance, preserving the ledger account's status. Requires a draft opening-balance journal and an active posting account. No request body is required.
     *
     * @tags Journal Entry
     * @name PostOpeningBalance
     * @request POST:/journal-entries/opening-balance/{id}/post
     */
    postOpeningBalance: (id: string, params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/journal-entries/opening-balance/${id}/post`,
        method: 'POST',
        ...params,
      }),

    /**
     * @description Posts a draft payment while preserving its financial content. Revalidates accounts, counterparties, and the effective accounting period. No request body is required.
     *
     * @tags Journal Entry
     * @name PostPayment
     * @request POST:/journal-entries/payment/{id}/post
     */
    postPayment: (id: string, params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/journal-entries/payment/${id}/post`,
        method: 'POST',
        ...params,
      }),

    /**
     * @description Posts a draft receipt while preserving its financial content. Revalidates accounts, counterparties, and the effective accounting period. No request body is required.
     *
     * @tags Journal Entry
     * @name PostReceipt
     * @request POST:/journal-entries/receipt/{id}/post
     */
    postReceipt: (id: string, params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/journal-entries/receipt/${id}/post`,
        method: 'POST',
        ...params,
      }),

    /**
     * @description Posts a draft transfer while preserving its financial content. Revalidates accounts, counterparties, and the effective accounting period. No request body is required.
     *
     * @tags Journal Entry
     * @name PostTransfer
     * @request POST:/journal-entries/transfer/{id}/post
     */
    postTransfer: (id: string, params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/journal-entries/transfer/${id}/post`,
        method: 'POST',
        ...params,
      }),

    /**
     * @description Archive a journal entry without changing its financial effect.
     *
     * @tags Journal Entry
     * @name ArchiveJournalEntry
     * @request POST:/journal-entries/{id}/archive
     */
    archiveJournalEntry: (id: string, params: RequestParams = {}) =>
      this.request<IJournalEntryDto, IHttpErrorDto>({
        path: `/journal-entries/${id}/archive`,
        method: 'POST',
        format: 'json',
        ...params,
      }),
  };
  files = {
    /**
     * @description Pre-sign direct-to-Blackblaze upload instructions
     *
     * @tags File
     * @name PreSignUploads
     * @request POST:/files/upload
     */
    preSignUploads: (data: IFileUploadReq[], params: RequestParams = {}) =>
      this.request<IFileUploadDto[], IHttpErrorDto>({
        path: `/files/upload`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  currencies = {
    /**
     * @description Gets all system currencies
     *
     * @tags Currency
     * @name GetAllCurrencies
     * @request GET:/currencies
     */
    getAllCurrencies: (params: RequestParams = {}) =>
      this.request<ICurrencyDto[], any>({
        path: `/currencies`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Gets all system exchange
     *
     * @tags Currency
     * @name GetExchangeRates
     * @request GET:/currencies/exchange-rates
     */
    getExchangeRates: (
      query: {
        /** @format double */
        page?: number;
        /** @format double */
        limit?: number;
        orderBy?: string;
        currencyPair: string;
        type?: UExchangeRateType;
        /** @format date-time */
        asOf?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<IExchangeRate[], any>({
        path: `/currencies/exchange-rates`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),
  };
  counterparties = {
    /**
     * @description Get counterparties
     *
     * @tags Counterparty
     * @name GetCounterparties
     * @request GET:/counterparties
     */
    getCounterparties: (
      query?: {
        /** @format double */
        limit?: number;
        search?: string;
        orderBy?: UCounterpartySortBy;
        sortDirection?: UPaginationSortDirection;
        /** @format double */
        page?: number;
        roles?: UCounterpartyRole[];
        type?: UCounterpartyType;
        status?: UCounterpartyStatus;
      },
      params: RequestParams = {}
    ) =>
      this.request<IPaginatedResponseICounterpartyDto, IHttpErrorDto>({
        path: `/counterparties`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new counterparty
     *
     * @tags Counterparty
     * @name CreateCounterparty
     * @request POST:/counterparties
     */
    createCounterparty: (
      data: ICounterpartyCreateReq,
      params: RequestParams = {}
    ) =>
      this.request<ICounterpartyDto, IHttpErrorDto>({
        path: `/counterparties`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get a counterparty by id
     *
     * @tags Counterparty
     * @name GetCounterparty
     * @request GET:/counterparties/{id}
     */
    getCounterparty: (id: string, params: RequestParams = {}) =>
      this.request<ICounterpartyDto, IHttpErrorDto>({
        path: `/counterparties/${id}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Update details and optionally activate a Draft. Supplied metadata replaces all roles. A type change after transaction use returns 409 with field=type, reason=transaction_usage and nextAction=create_counterparty. This counterparty's type cannot be changed because it has been used in a transaction. Create a new counterparty if a different type is required.
     *
     * @tags Counterparty
     * @name UpdateCounterparty
     * @request PATCH:/counterparties/{id}
     */
    updateCounterparty: (
      id: string,
      data: ICounterpartyUpdateReq,
      params: RequestParams = {}
    ) =>
      this.request<ICounterpartyDto, IHttpErrorDto>({
        path: `/counterparties/${id}`,
        method: 'PATCH',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Permanently delete a counterparty with no remaining transaction references. References in archived transactions also block deletion. Returns 409 with reason=transaction_usage and nextAction=archive_counterparty; retain the counterparty and use POST /counterparties/{id}/archive instead.
     *
     * @tags Counterparty
     * @name DeleteCounterparty
     * @request DELETE:/counterparties/{id}
     */
    deleteCounterparty: (id: string, params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/counterparties/${id}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Check whether a counterparty has no transaction references and can be deleted. This result is advisory; deletion rechecks eligibility atomically.
     *
     * @tags Counterparty
     * @name GetCounterpartyDeletionEligibility
     * @request GET:/counterparties/{id}/deletion-eligibility
     */
    getCounterpartyDeletionEligibility: (
      id: string,
      params: RequestParams = {}
    ) =>
      this.request<ICounterpartyDeletionEligibilityDto, IHttpErrorDto>({
        path: `/counterparties/${id}/deletion-eligibility`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Archive a counterparty while retaining its details and transaction references. An already archived counterparty returns unchanged without another history or event.
     *
     * @tags Counterparty
     * @name ArchiveCounterparty
     * @request POST:/counterparties/{id}/archive
     */
    archiveCounterparty: (id: string, params: RequestParams = {}) =>
      this.request<ICounterpartyDto, IHttpErrorDto>({
        path: `/counterparties/${id}/archive`,
        method: 'POST',
        format: 'json',
        ...params,
      }),
  };
  banks = {
    /**
     * @description Get bank directory for a country
     *
     * @tags Bank
     * @name GetBanks
     * @request GET:/banks
     */
    getBanks: (
      query: {
        countryCode: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<IBankDirectoryDto[], IHttpErrorDto>({
        path: `/banks`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),
  };
  auth = {
    /**
     * @description User signup with email and password
     *
     * @tags Auth
     * @name SignupWithEmail
     * @request POST:/auth/signup-with-email
     */
    signupWithEmail: (data: IUserSignupReq, params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/auth/signup-with-email`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        ...params,
      }),

    /**
     * @description Verify user email
     *
     * @tags Auth
     * @name VerifyEmail
     * @request POST:/auth/signup/complete
     */
    verifyEmail: (data: IVerifyEmailReq, params: RequestParams = {}) =>
      this.request<IAccessToken, IHttpErrorDto>({
        path: `/auth/signup/complete`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description User login with email and password
     *
     * @tags Auth
     * @name LoginWithEmail
     * @request POST:/auth/login-with-email
     */
    loginWithEmail: (data: IEmailLoginReq, params: RequestParams = {}) =>
      this.request<IAccessToken, IHttpErrorDto>({
        path: `/auth/login-with-email`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Start the Google OAuth flow. Redirects the user to Google for authentication.
     *
     * @tags Auth
     * @name LoginWithGoogle
     * @request GET:/auth/google
     */
    loginWithGoogle: (params: RequestParams = {}) =>
      this.request<any, void | IHttpErrorDto>({
        path: `/auth/google`,
        method: 'GET',
        ...params,
      }),

    /**
     * @description Google OAuth callback. Exchanges the Google user profile for an auth token and redirects to the client.
     *
     * @tags Auth
     * @name LoginWithGoogleCallback
     * @request GET:/auth/google/callback
     */
    loginWithGoogleCallback: (params: RequestParams = {}) =>
      this.request<any, void | IHttpErrorDto>({
        path: `/auth/google/callback`,
        method: 'GET',
        ...params,
      }),

    /**
     * @description Refresh access token
     *
     * @tags Auth
     * @name RefreshAccessToken
     * @request POST:/auth/refresh-access-token
     */
    refreshAccessToken: (params: RequestParams = {}) =>
      this.request<
        {
          accessToken: string;
        },
        IHttpErrorDto
      >({
        path: `/auth/refresh-access-token`,
        method: 'POST',
        format: 'json',
        ...params,
      }),

    /**
     * @description Logout user
     *
     * @tags Auth
     * @name Logout
     * @request POST:/auth/logout
     */
    logout: (params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/auth/logout`,
        method: 'POST',
        ...params,
      }),

    /**
     * @description Get password reset link
     *
     * @tags Auth
     * @name GetPasswordResetLink
     * @request POST:/auth/get-password-reset-link
     */
    getPasswordResetLink: (
      data: IRequestPasswordResetReq,
      params: RequestParams = {}
    ) =>
      this.request<void, IHttpErrorDto>({
        path: `/auth/get-password-reset-link`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        ...params,
      }),

    /**
     * @description Reset password
     *
     * @tags Auth
     * @name ResetPassword
     * @request POST:/auth/reset-password
     */
    resetPassword: (data: IResetPasswordReq, params: RequestParams = {}) =>
      this.request<IAccessToken, IHttpErrorDto>({
        path: `/auth/reset-password`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  accounting = {
    /**
     * @description Get user accounting entities
     *
     * @tags Accounting
     * @name GetUserAccountingEntities
     * @request GET:/accounting/accounting-entities
     */
    getUserAccountingEntities: (params: RequestParams = {}) =>
      this.request<IAccountingEntity[], IHttpErrorDto>({
        path: `/accounting/accounting-entities`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Get active accounting entity
     *
     * @tags Accounting
     * @name GetActiveAccountingEntity
     * @request GET:/accounting/accounting-entity
     */
    getActiveAccountingEntity: (params: RequestParams = {}) =>
      this.request<IAccountingEntity, IHttpErrorDto>({
        path: `/accounting/accounting-entity`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Create only an accounting entity. Calendar and context setup is separate.
     *
     * @tags Accounting
     * @name CreateAccountingEntity
     * @request POST:/accounting/accounting-entity
     */
    createAccountingEntity: (
      data: IAccountingEntityCreationDto,
      params: RequestParams = {}
    ) =>
      this.request<IAccountingEntity, IHttpErrorDto>({
        path: `/accounting/accounting-entity`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Updates the entity selected by x-accounting-entity-id. Currency changes require no journal entries.
     *
     * @tags Accounting
     * @name UpdateAccountingEntity
     * @request PATCH:/accounting/accounting-entity
     */
    updateAccountingEntity: (
      data: IAccountingEntityUpdateReq,
      params: RequestParams = {}
    ) =>
      this.request<IAccountingEntity, IHttpErrorDto>({
        path: `/accounting/accounting-entity`,
        method: 'PATCH',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Deletes the selected entity only when it has no journal entries; otherwise returns 409.
     *
     * @tags Accounting
     * @name DeleteAccountingEntity
     * @request DELETE:/accounting/accounting-entity
     */
    deleteAccountingEntity: (params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/accounting/accounting-entity`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Returns all fiscal years for x-accounting-entity-id.
     *
     * @tags Accounting
     * @name GetFiscalYears
     * @request GET:/accounting/fiscal-years
     */
    getFiscalYears: (params: RequestParams = {}) =>
      this.request<IFiscalYear[], IHttpErrorDto>({
        path: `/accounting/fiscal-years`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns one fiscal year belonging to x-accounting-entity-id.
     *
     * @tags Accounting
     * @name GetFiscalYear
     * @request GET:/accounting/fiscal-years/{id}
     */
    getFiscalYear: (id: string, params: RequestParams = {}) =>
      this.request<IFiscalYear, IHttpErrorDto>({
        path: `/accounting/fiscal-years/${id}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns the fiscal year's context, including closed contexts, or null.
     *
     * @tags Accounting
     * @name GetAccountingContext
     * @request GET:/accounting/fiscal-years/{id}/accounting-context
     */
    getAccountingContext: (id: string, params: RequestParams = {}) =>
      this.request<IAccountingContext | null, IHttpErrorDto>({
        path: `/accounting/fiscal-years/${id}/accounting-context`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns the fiscal year's accounting interval and its ordered periods.
     *
     * @tags Accounting
     * @name GetAccountingInterval
     * @request GET:/accounting/fiscal-years/{id}/accounting-interval
     */
    getAccountingInterval: (id: string, params: RequestParams = {}) =>
      this.request<IAccountingInterval, IHttpErrorDto>({
        path: `/accounting/fiscal-years/${id}/accounting-interval`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns the fiscal year's context, including closed contexts, or null.
     *
     * @tags Accounting
     * @name GetReportingContext
     * @request GET:/accounting/fiscal-years/{id}/reporting-context
     */
    getReportingContext: (id: string, params: RequestParams = {}) =>
      this.request<IReportingContext | null, IHttpErrorDto>({
        path: `/accounting/fiscal-years/${id}/reporting-context`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns the fiscal year's reporting interval and its ordered periods.
     *
     * @tags Accounting
     * @name GetReportingInterval
     * @request GET:/accounting/fiscal-years/{id}/reporting-interval
     */
    getReportingInterval: (id: string, params: RequestParams = {}) =>
      this.request<IReportingInterval, IHttpErrorDto>({
        path: `/accounting/fiscal-years/${id}/reporting-interval`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Get jurisdictions
     *
     * @tags Accounting
     * @name GetJurisdictions
     * @request GET:/accounting/jurisdictions
     */
    getJurisdictions: (params: RequestParams = {}) =>
      this.request<IJurisdictionDto[], IHttpErrorDto>({
        path: `/accounting/jurisdictions`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates only a fiscal year and its history for an existing entity owned by the caller.
     *
     * @tags Accounting
     * @name CreateFiscalYear
     * @request POST:/accounting/fiscal-year
     */
    createFiscalYear: (
      data: IFiscalYearCreationReq,
      params: RequestParams = {}
    ) =>
      this.request<IFiscalYear, IHttpErrorDto>({
        path: `/accounting/fiscal-year`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates an interval and its periods for x-accounting-entity-id.
     *
     * @tags Accounting
     * @name CreateAccountingInterval
     * @request POST:/accounting/accounting-intervals
     */
    createAccountingInterval: (
      data: IAccountingIntervalCreationReq,
      params: RequestParams = {}
    ) =>
      this.request<IAccountingInterval, IHttpErrorDto>({
        path: `/accounting/accounting-intervals`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates a context for x-accounting-entity-id from existing records; archived entities return 409.Explicit period selection is required for current, historical, and future years and never changes period status or posting eligibility.
     *
     * @tags Accounting
     * @name CreateAccountingContext
     * @request POST:/accounting/accounting-context
     */
    createAccountingContext: (
      data: IAccountingContextCreationReq,
      params: RequestParams = {}
    ) =>
      this.request<IAccountingContext, IHttpErrorDto>({
        path: `/accounting/accounting-context`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates an interval and its periods for x-accounting-entity-id.
     *
     * @tags Accounting
     * @name CreateReportingInterval
     * @request POST:/accounting/reporting-intervals
     */
    createReportingInterval: (
      data: IReportingIntervalCreationReq,
      params: RequestParams = {}
    ) =>
      this.request<IReportingInterval, IHttpErrorDto>({
        path: `/accounting/reporting-intervals`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates only a reporting context and its history for x-accounting-entity-id; archived entities return 409. The selected reporting period must share the linked accounting context's entity and fiscal year.
     *
     * @tags Accounting
     * @name CreateReportingContext
     * @request POST:/accounting/reporting-context
     */
    createReportingContext: (
      data: IReportingContextCreationReq,
      params: RequestParams = {}
    ) =>
      this.request<IReportingContext, IHttpErrorDto>({
        path: `/accounting/reporting-context`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Archives the selected entity, retaining all accounting records.
     *
     * @tags Accounting
     * @name ArchiveAccountingEntity
     * @request POST:/accounting/accounting-entity/archive
     */
    archiveAccountingEntity: (params: RequestParams = {}) =>
      this.request<void, IHttpErrorDto>({
        path: `/accounting/accounting-entity/archive`,
        method: 'POST',
        ...params,
      }),

    /**
     * @description Switch the current accounting entity
     *
     * @tags Accounting
     * @name SwitchAccountingEntity
     * @request POST:/accounting/accounting-entity/switch
     */
    switchAccountingEntity: (
      data: IAccountingEntitySwitchReq,
      params: RequestParams = {}
    ) =>
      this.request<IAccountingEntity, IHttpErrorDto>({
        path: `/accounting/accounting-entity/switch`,
        method: 'POST',
        body: data,
        type: EContentType.Json,
        format: 'json',
        ...params,
      }),
  };
}
