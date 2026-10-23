import type { INamedPeriod } from '@/accounting/lib/types/period.types';
import type {
  ICurrencyDto,
  IFiscalYearDto,
  UPeriodUnit,
} from '@/shared/lib/api/Api';

export interface IReportsFormValues {
  name: string;
  currencyCode: string;
  unit: UPeriodUnit;
  periods: INamedPeriod[];
}

export interface IReportsFormFields {
  name: string;
  currencyCode: string;
  unit: UPeriodUnit;
  periodNames: Record<string, string>;
}

export interface ReportsFormProps {
  id?: string;
  financialYear: Pick<IFiscalYearDto, 'name' | 'startDate' | 'endDate'>;
  currencies: ICurrencyDto[];
  currentDate: string;
  maxFiscalMonths?: number;
  initialValues?: Partial<IReportsFormValues>;
  disabled?: boolean;
  onSubmit?: (values: IReportsFormValues) => void | Promise<void>;
}
