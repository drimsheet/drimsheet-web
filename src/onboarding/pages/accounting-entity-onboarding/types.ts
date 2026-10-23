import type { AccountingEntityFormProps } from '@/accounting/components/accounting-entity-form';
import type { CategoriesFormProps } from '@/accounting/components/categories-form';
import type { FinancialYearFormProps } from '@/accounting/components/financial-year-form';
import type { ReportsFormProps } from '@/accounting/components/reports-form';
import type {
  IAccountingEntity,
  ILedgerAccountDto,
} from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface StepLayoutProps {
  titleId: string;
  children: ReactNode;
  actions: ReactNode;
}

export interface AccountingEntityStepProps extends Pick<
  AccountingEntityFormProps,
  'currencies' | 'jurisdictions' | 'individualName' | 'onSubmit'
> {
  isLoading?: boolean;
  hasError?: boolean;
  onRetry: () => void;
}

export interface FinancialYearStepProps extends Pick<
  FinancialYearFormProps,
  'onSubmit' | 'jurisdictionCode'
> {
  currentDate: string;
  maxFiscalMonths?: number;
  onBack: () => void;
}

export interface AccountingEntityOnboardingSidebarProps {
  currentStep?: number;
}

export interface ReportsStepProps extends Pick<
  ReportsFormProps,
  | 'financialYear'
  | 'currencies'
  | 'currentDate'
  | 'maxFiscalMonths'
  | 'onSubmit'
> {
  officialCurrencyCode: string;
  onBack: () => void;
}

export interface IncomeCategoriesStepProps extends Pick<
  CategoriesFormProps,
  'onSubmit'
> {
  onBack: () => void;
}

export interface ExpenseCategoriesStepProps extends Pick<
  CategoriesFormProps,
  'onSubmit'
> {
  onBack: () => void;
  onRetry?: () => void;
  isSubmitting?: boolean;
  hasStarted?: boolean;
  isRetryBlocked?: boolean;
}

export interface IOnboardingProgress {
  entity?: IAccountingEntity;
  switched?: boolean;
  fiscalYearId?: string;
  accountingIntervalId?: string;
  accountingContextId?: string;
  reportingIntervalId?: string;
  reportingContextId?: string;
  headerAccounts?: ILedgerAccountDto[];
  savedCategories: Set<string>;
}
