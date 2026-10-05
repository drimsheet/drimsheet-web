import type { IAddressValues } from '@/counterparty/components/counterparty-address-fields';
import type {
  ICounterpartyDto,
  IJurisdictionDto,
  UCounterpartyType,
} from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface IVendorFormValues {
  name: string;
  type: UCounterpartyType;
  displayName: string;
  address: IAddressValues;
}

export interface VendorFormProps {
  submitLabel?: string;
  onCancel?: () => void;
  typeRestriction?: { value: UCounterpartyType; description: string };
  fieldErrors?: Record<string, string>;
  showPostalCode?: boolean;
  showDisplayName?: boolean;
  onSubmit: (values: IVendorFormValues) => void;
  initialValues?: Partial<IVendorFormValues>;
  jurisdictions?: IJurisdictionDto[];
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export type VendorFormSkeletonProps = Pick<
  VendorFormProps,
  'showPostalCode' | 'showDisplayName'
>;

export interface VendorFormCreateContainerProps {
  onSuccess: () => void;
  onBusyChange?: (busy: boolean) => void;
}

export interface VendorFormUpdateContainerProps {
  counterpartyId: string;
  loadingFallback: ReactNode;
  onSuccess: () => void;
  onCancel?: () => void;
  onBusyChange?: (busy: boolean) => void;
  onLoaded?: (counterparty: ICounterpartyDto) => void;
}
