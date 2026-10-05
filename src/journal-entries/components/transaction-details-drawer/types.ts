import type { UTransactionDetails } from '@/journal-entries/lib/types/transaction-details';

export interface TransactionDetailsDrawerProps {
  archiving?: boolean;
  onArchive?: () => Promise<void>;
  onDelete?: () => Promise<void> | void;
  details?: UTransactionDetails;
  editDisabled?: boolean;
  onEdit: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}
