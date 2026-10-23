import type { INamedPeriod } from '@/accounting/lib/types/period.types';
import type { UPeriodUnit } from '@/shared/lib/api/Api';

export interface PeriodNameFieldsProps {
  title: string;
  periods: INamedPeriod[];
  unit: UPeriodUnit;
  currentDate: string;
  disabled: boolean;
  getError: (index: number) => Array<{ message?: string }>;
  onNameChange: (index: number, value: string) => void;
  onNameBlur: (index: number) => void;
}
