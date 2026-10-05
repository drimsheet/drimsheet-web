import type { UCounterpartyRoleSelectValue } from '@/counterparty/components/counterparty-role-select';

export interface CounterpartyCreationDialogProps {
  open: boolean;
  role: UCounterpartyRoleSelectValue;
  onClose: () => void;
}
