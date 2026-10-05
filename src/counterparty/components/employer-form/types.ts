import type { IAddressValues } from '@/counterparty/components/counterparty-address-fields';
import type {
  ICounterpartyDto,
  IJurisdictionDto,
  UCounterpartyType,
} from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface IEmployerFormValues {
  name: string;
  type: UCounterpartyType;
  displayName?: string;
  address: IAddressValues & {
    line1: string;
    city: string;
    countryCode: string;
  };
}

export interface EmployerFormProps {
  submitLabel?: string;
  onCancel?: () => void;
  typeRestriction?: { value: UCounterpartyType; description: string };
  fieldErrors?: Record<string, string>;
  showPostalCode?: boolean;
  onSubmit: (values: IEmployerFormValues) => void;
  initialValues?: Partial<IEmployerFormValues>;
  jurisdictions?: IJurisdictionDto[];
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export type EmployerFormSkeletonProps = Pick<
  EmployerFormProps,
  'showPostalCode'
>;

export interface EmployerFormCreateContainerProps {
  onSuccess: () => void;
  onBusyChange?: (busy: boolean) => void;
}

export interface EmployerFormUpdateContainerProps {
  counterpartyId: string;
  loadingFallback: ReactNode;
  onSuccess: () => void;
  onCancel?: () => void;
  onBusyChange?: (busy: boolean) => void;
  onLoaded?: (counterparty: ICounterpartyDto) => void;
}
