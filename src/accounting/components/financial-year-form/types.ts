import type { INamedPeriod } from '@/accounting/lib/types/period.types';
import type { UPeriodUnit } from '@/shared/lib/api/Api';
export type { INamedPeriod as IFinancialYearPeriod } from '@/accounting/lib/types/period.types';

export interface IFinancialYearFormValues {
  name: string;
  startDate: string;
  endDate: string;
  unit: UPeriodUnit;
  periods: INamedPeriod[];
}

export interface FinancialYearFormProps {
  id?: string;
  currentDate: string;
  maxFiscalMonths?: number;
  initialValues?: Partial<IFinancialYearFormValues>;
  disabled?: boolean;
  onSubmit?: (values: IFinancialYearFormValues) => void | Promise<void>;
}
