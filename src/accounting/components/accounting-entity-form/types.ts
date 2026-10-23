import type {
  ICurrencyDto,
  IJurisdictionDto,
  UAccountingEntityType,
} from '@/shared/lib/api/Api';

export interface IAccountingEntityFormValues {
  entityType: UAccountingEntityType | '';
  name: string;
  jurisdictionCode: string;
  functionalCurrencyCode: string;
}

export interface AccountingEntityFormProps {
  id?: string;
  currencies: ICurrencyDto[];
  jurisdictions: IJurisdictionDto[];
  individualName?: string;
  initialValues?: Partial<IAccountingEntityFormValues>;
  disabled?: boolean;
  onSubmit?: (values: IAccountingEntityFormValues) => void | Promise<void>;
}
