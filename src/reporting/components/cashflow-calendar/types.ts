import type { UTransitionState } from '@/shared/components/with-transition-state';
import type { IMoneyDto } from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export type UCashflowCalendarVariant = 'month' | 'week';
export type UCashflowCalendarColor = 'primary' | 'secondary';

export interface ICashflowCalendarDay {
  /** Local calendar date, YYYY-MM-DD. Supply one entry per date. */
  date: string;
  in: IMoneyDto;
  out: IMoneyDto;
}

export interface ICashflowCalendarLabels {
  calendarLabel: string;
  previousLabel: string;
  nextLabel: string;
  inflowLabel: string;
  outflowLabel: string;
}

export interface CashflowCalendarProps {
  days: readonly ICashflowCalendarDay[];
  /** A date in the visible period. Navigation emits its new start date. */
  date: Date;
  /** Supplied by the caller in the user's calendar timezone. */
  today: Date;
  variant?: UCashflowCalendarVariant;
  color?: UCashflowCalendarColor;
  labels: ICashflowCalendarLabels;
  onDateChange: (date: Date) => void;
}

export type CashflowCalendarErrorProps = Pick<
  CashflowCalendarProps,
  'date' | 'today' | 'variant' | 'labels' | 'onDateChange'
>;

export interface CalendarFrameProps extends CashflowCalendarErrorProps {
  children: ReactNode;
}

export interface CashflowCalendarSkeletonProps {
  date: Date;
  variant?: UCashflowCalendarVariant;
  'aria-label': string;
}

export interface CashflowCalendarWithStateProps extends Pick<
  CashflowCalendarProps,
  'date' | 'today' | 'variant' | 'color' | 'labels' | 'onDateChange'
> {
  state?: UTransitionState;
  days?: readonly ICashflowCalendarDay[] | null;
  loadingLabel: string;
}

export interface CashflowDayProps {
  date: Date;
  today: Date;
  color: UCashflowCalendarColor;
  entry?: ICashflowCalendarDay;
  labels: Pick<ICashflowCalendarLabels, 'inflowLabel' | 'outflowLabel'>;
  locale: string;
}
