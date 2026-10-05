import type { CounterpartyFormUpdateContainerProps } from '@/counterparty/components/counterparty-form';
import type {
  UCounterpartyRole,
  UCounterpartyType,
} from '@/shared/lib/api/Api';

export interface CounterpartyUpdateDialogProps {
  counterpartyId?: string;
  type?: UCounterpartyType;
  role: UCounterpartyRole | 'default';
  onClose: () => void;
}

export interface RenderProps extends Pick<
  CounterpartyFormUpdateContainerProps,
  'counterpartyId' | 'onSuccess' | 'onCancel' | 'onBusyChange' | 'onLoaded'
> {
  valid: boolean;
  role: CounterpartyUpdateDialogProps['role'];
}
