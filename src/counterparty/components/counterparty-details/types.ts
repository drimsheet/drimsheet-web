import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface CounterpartyDetailsProps {
  counterparty: ICounterpartyDto;
  children?: ReactNode;
  onEdit?: () => void;
  editDisabled?: boolean;
}
