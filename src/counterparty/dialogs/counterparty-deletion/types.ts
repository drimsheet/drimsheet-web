import type { ICounterpartyDto } from '@/shared/lib/api/Api';

export interface CounterpartyDeletionDialogProps {
  counterparty: Pick<ICounterpartyDto, 'id' | 'name'> | null;
  onClose: () => void;
  onDeleted?: (counterpartyId: string) => void;
}

export interface CounterpartyDeleteConfirmationProps {
  counterpartyName: string;
  onDelete: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}
