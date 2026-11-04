import type { ULedgerAccountBehavior } from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface IAccountTypeOption {
  value: ULedgerAccountBehavior;
  label: string;
  description: string;
  icon?: ReactNode;
}

export interface AccountTypeSelectionProps {
  defaultValue?: ULedgerAccountBehavior;
  value?: ULedgerAccountBehavior;
  onSubmit: (value: ULedgerAccountBehavior) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}
