import type { accountingService } from '@/accounting/lib/services/accounting.service';
import type {
  IAccountingEntity,
  IAccountingInterval,
  IFiscalYear,
  IReportingInterval,
  UAccountingPeriodStatus,
} from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export type TFiscalYearContext = Awaited<
  ReturnType<typeof accountingService.getFiscalYearContext>
>;
export interface EntitySummaryProps {
  entity: IAccountingEntity;
  actions: ReactNode;
}
export interface EntityActionsProps {
  isCurrent: boolean;
  archived: boolean;
  pending: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onSwitch: () => void;
}
export interface EntityActionsContainerProps {
  entity: IAccountingEntity;
  isCurrent: boolean;
}
export interface FiscalYearSummaryProps {
  years: IFiscalYear[];
  selected: IFiscalYear;
  onChange: (id: string) => void;
}
export interface ContextDetailsProps {
  context: TFiscalYearContext;
  now: number;
}
export interface IntervalDetailsProps {
  kind: 'accounting' | 'reporting';
  interval: IAccountingInterval | IReportingInterval;
  now: number;
}
export interface PeriodSummaryProps {
  name: string;
  ordinal: number;
  count: number;
  startDate: string;
  endDate: string;
  status?: UAccountingPeriodStatus;
}
