import type { UPeriodUnit } from '@/shared/lib/api/Api';

export interface IFinancialYearPeriod {
  name: string;
  startDate: string;
  endDate: string;
}

export interface IFinancialYearFormValues {
  name: string;
  startDate: string;
  endDate: string;
  unit: UPeriodUnit;
  periods: IFinancialYearPeriod[];
}

export type TPeriodNameFactory = (unit: UPeriodUnit, index: number) => string;

export interface FinancialYearFormProps {
  id?: string;
  currentDate: string;
  maxFiscalMonths?: number;
  initialValues?: Partial<IFinancialYearFormValues>;
  disabled?: boolean;
  onSubmit?: (values: IFinancialYearFormValues) => void | Promise<void>;
}

export interface AccountingPeriodsProps {
  periods: IFinancialYearPeriod[];
  unit: UPeriodUnit;
  currentDate: string;
  disabled: boolean;
  getError: (field: string) => Array<{ message?: string }>;
  onNameChange: (index: number, value: string) => void;
  onNameBlur: (index: number) => void;
}
