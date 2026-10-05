import type { IJurisdictionDto } from '@/shared/lib/api/Api';

export interface IAddressValues {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  countryCode?: string;
}

export interface CounterpartyAddressFieldsProps {
  values: IAddressValues;
  errors: Record<string, unknown>;
  fieldErrors?: Record<string, string>;
  touched: Record<string, unknown>;
  jurisdictions: IJurisdictionDto[];
  onChange: (field: string, value: string) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  submitted?: boolean;
  showPostalCode?: boolean;
  countryRequired?: boolean;
  showOptionalSuffix?: boolean;
  namePrefix?: string;
  className?: string;
}
