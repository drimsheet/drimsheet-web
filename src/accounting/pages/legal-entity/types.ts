import type {
  IAccountingContextDto,
  IAccountingEntity,
  IReportingContextDto,
} from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface EntityDetailsProps {
  entity: IAccountingEntity;
}
export interface AccountingContextDetailsProps {
  context: IAccountingContextDto;
}
export interface ReportingContextDetailsProps {
  context: IReportingContextDto;
}
export interface RecordFieldsProps {
  fields: { label: string; value: ReactNode }[];
  className?: string;
}
export interface SectionStateProps {
  label: string;
  state: 'loading' | 'error' | 'empty';
  onRetry?: () => void;
}
