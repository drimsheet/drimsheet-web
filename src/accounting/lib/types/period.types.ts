import type { UPeriodUnit } from '@/shared/lib/api/Api';

export interface INamedPeriod {
  name: string;
  startDate: string;
  endDate: string;
}
export interface IPeriodSettings {
  startDate: string;
  endDate: string;
  unit: UPeriodUnit;
}
export type TPeriodNameFactory = (unit: UPeriodUnit, index: number) => string;
