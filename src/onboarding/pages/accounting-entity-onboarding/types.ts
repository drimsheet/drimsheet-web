import type { AccountingEntityFormProps } from '@/accounting/components/accounting-entity-form';

export interface AccountingEntityStepProps extends Pick<
  AccountingEntityFormProps,
  'currencies' | 'jurisdictions'
> {
  isLoading?: boolean;
  hasError?: boolean;
  onRetry: () => void;
}
