import type { IAddressValues } from '@/counterparty/components/counterparty-address-fields';
import type {
  ICounterpartyDto,
  IJurisdictionDto,
  UCounterpartyType,
} from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface IContractorFormValues {
  name: string;
  type: UCounterpartyType;
  displayName?: string;
  address: IAddressValues & {
    line1: string;
    city: string;
    countryCode: string;
  };
}

export interface ContractorFormProps {
  submitLabel?: string;
  onCancel?: () => void;
  typeRestriction?: { value: UCounterpartyType; description: string };
  fieldErrors?: Record<string, string>;
  showPostalCode?: boolean;
  showDisplayName?: boolean;
  onSubmit: (values: IContractorFormValues) => void;
  initialValues?: Partial<IContractorFormValues>;
  jurisdictions?: IJurisdictionDto[];
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export type ContractorFormSkeletonProps = Pick<
  ContractorFormProps,
  'showPostalCode' | 'showDisplayName'
>;

export interface ContractorFormCreateContainerProps {
  onSuccess: () => void;
  onBusyChange?: (busy: boolean) => void;
}

export interface ContractorFormUpdateContainerProps {
  counterpartyId: string;
  loadingFallback: ReactNode;
  onSuccess: () => void;
  onCancel?: () => void;
  onBusyChange?: (busy: boolean) => void;
  onLoaded?: (counterparty: ICounterpartyDto) => void;
}
