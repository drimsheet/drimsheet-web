import type { ICounterpartyDto, UCounterpartyType } from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface ICounterpartyFormValues {
  name: string;
  type: UCounterpartyType;
}

export interface CounterpartyFormProps {
  submitLabel?: string;
  onCancel?: () => void;
  typeRestriction?: { value: UCounterpartyType; description: string };
  fieldErrors?: Record<string, string>;
  onSubmit: (values: ICounterpartyFormValues) => void;
  initialValues?: Partial<ICounterpartyFormValues>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface CounterpartyFormCreateContainerProps {
  onSuccess: () => void;
  onBusyChange?: (busy: boolean) => void;
}

export interface CounterpartyFormUpdateContainerProps {
  counterpartyId: string;
  loadingFallback: ReactNode;
  onSuccess: () => void;
  onCancel?: () => void;
  onBusyChange?: (busy: boolean) => void;
  onLoaded?: (counterparty: ICounterpartyDto) => void;
}
