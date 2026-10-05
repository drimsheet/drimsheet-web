import type { ULedgerAccountBehavior } from '@/shared/lib/api/Api';

export interface AccountTypeSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: ULedgerAccountBehavior) => void;
  defaultValue?: ULedgerAccountBehavior;
}
