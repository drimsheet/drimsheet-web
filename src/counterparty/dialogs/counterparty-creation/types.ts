import type { CounterpartyFormProps } from '@/counterparty/components/counterparty-form';
import type { UCounterpartyRoleSelectValue } from '@/counterparty/components/counterparty-role-select';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';

export interface CounterpartyCreationDialogProps extends Pick<
  CounterpartyFormProps,
  'initialValues'
> {
  open: boolean;
  role: UCounterpartyRoleSelectValue;
  onSuccess?: (counterparty: ICounterpartyDto) => void;
  onClose: () => void;
  onCloseAutoFocus?: (event: Event) => void;
}
