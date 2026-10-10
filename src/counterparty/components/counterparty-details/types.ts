import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface CounterpartyDetailsProps {
  counterparty: ICounterpartyDto;
  children?: ReactNode;
  deleteEligibilityChecking?: boolean;
  deletable?: boolean;
  onActionsOpenChange?: (open: boolean) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  editDisabled?: boolean;
}

export type CounterpartyProfileActionsProps = Pick<
  CounterpartyDetailsProps,
  | 'deleteEligibilityChecking'
  | 'deletable'
  | 'onActionsOpenChange'
  | 'onDelete'
  | 'onEdit'
  | 'editDisabled'
>;
