import type { UCounterpartyRoleSelectValue } from '@/counterparty/components/counterparty-role-select';

export interface CounterpartyRoleSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: UCounterpartyRoleSelectValue) => void;
  defaultValue?: UCounterpartyRoleSelectValue;
}
