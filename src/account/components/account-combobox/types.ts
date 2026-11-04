import type { ILedgerAccountDto } from '@/shared/lib/api/Api';

export interface AccountComboboxProps {
  label: string;
  value: string;
  accounts: ILedgerAccountDto[];
  onAddAccount?: () => void;
  onChange: (value: string) => void;
  error?: Array<{ message?: string } | undefined>;
  id?: string;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export type TAccountComboboxItem = ILedgerAccountDto | 'add-account';
