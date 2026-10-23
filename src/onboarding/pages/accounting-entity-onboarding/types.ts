import type { AccountingEntityFormProps } from '@/accounting/components/accounting-entity-form';
import type { FinancialYearFormProps } from '@/accounting/components/financial-year-form';
import type { ReportsFormProps } from '@/accounting/components/reports-form';
import type { ReactNode } from 'react';

export interface StepLayoutProps {
  titleId: string;
  children: ReactNode;
  actions: ReactNode;
}

export interface AccountingEntityStepProps extends Pick<
  AccountingEntityFormProps,
  'currencies' | 'jurisdictions' | 'onSubmit'
> {
  isLoading?: boolean;
  hasError?: boolean;
  onRetry: () => void;
}

export interface FinancialYearStepProps extends Pick<
  FinancialYearFormProps,
  'onSubmit'
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
  onBack: () => void;
}

export interface IncomeCategoriesStepProps {
  onBack: () => void;
}
