import type { AccountingEntityFormProps } from '@/accounting/components/accounting-entity-form';

export interface AccountingEntityStepProps extends Pick<
  AccountingEntityFormProps,
  'currencies' | 'jurisdictions' | 'onSubmit'
> {
  isLoading?: boolean;
  hasError?: boolean;
  onRetry: () => void;
}

export interface FinancialYearStepProps {
  currentDate: string;
  maxFiscalMonths?: number;
  onBack: () => void;
}

export interface AccountingEntityOnboardingSidebarProps {
  currentStep?: number;
}
