import type {
  UAccountingIntervalUnit,
  UReportingIntervalUnit,
} from '@/shared/lib/api/Api';

export type UIntervalUnit = UAccountingIntervalUnit | UReportingIntervalUnit;

export interface INamedPeriod {
  name: string;
  startDate: string;
  endDate: string;
}
export interface IPeriodSettings<TUnit extends UIntervalUnit> {
  startDate: string;
  endDate: string;
  unit: TUnit;
}
export type TPeriodNameFactory<TUnit extends UIntervalUnit> = (
  unit: TUnit,
  index: number
) => string;
