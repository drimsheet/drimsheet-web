import type { ICashTransactionFormValues } from '@/journal-entries/components/cash-transaction-form';
import type { UTransactionAccountField } from '@/journal-entries/lib/types/transaction-continuation.types';
import type { IJournalEntryListDto } from '@/shared/lib/api/Api';

export interface OutflowFormContainerProps {
  journalEntry?: IJournalEntryListDto;
  initialValues?: Partial<ICashTransactionFormValues>;
  restoring?: boolean;
  onAddAccount?: (
    values: ICashTransactionFormValues,
    field?: UTransactionAccountField
  ) => void;
  onSuccess?: () => Promise<void>;
}
