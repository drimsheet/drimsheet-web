import type { INamedPeriod } from '@/accounting/lib/types/period.types';
import type { UAccountingIntervalUnit } from '@/shared/lib/api/Api';
export type { INamedPeriod as IFinancialYearPeriod } from '@/accounting/lib/types/period.types';

export interface IFinancialYearFormValues {
  name: string;
  startDate: string;
  endDate: string;
  unit: UAccountingIntervalUnit;
  periods: INamedPeriod[];
}

export interface FinancialYearFormProps {
  id?: string;
  currentDate: string;
  jurisdictionCode?: string;
  maxFiscalMonths?: number;
  initialValues?: Partial<IFinancialYearFormValues>;
  disabled?: boolean;
  onSubmit?: (values: IFinancialYearFormValues) => void | Promise<void>;
}
