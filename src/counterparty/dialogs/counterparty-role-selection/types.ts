import type { UCounterpartyRoleSelectValue } from '@/counterparty/components/counterparty-role-select';

export interface CounterpartyRoleSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onCloseAutoFocus?: (event: Event) => void;
  onSubmit: (value: UCounterpartyRoleSelectValue) => void;
  defaultValue?: UCounterpartyRoleSelectValue;
}
