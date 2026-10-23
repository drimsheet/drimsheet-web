import type {
  INamedPeriod,
  UIntervalUnit,
} from '@/accounting/lib/types/period.types';

export interface PeriodNameFieldsProps {
  title: string;
  periods: INamedPeriod[];
  unit: UIntervalUnit;
  currentDate: string;
  disabled: boolean;
  getError: (index: number) => Array<{ message?: string }>;
  onNameChange: (index: number, value: string) => void;
  onNameBlur: (index: number) => void;
}
