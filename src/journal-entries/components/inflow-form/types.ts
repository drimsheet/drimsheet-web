import type { ICashTransactionFormValues } from '@/journal-entries/components/cash-transaction-form';
import type { UTransactionAccountField } from '@/journal-entries/lib/types/transaction-continuation.types';
import type { IJournalEntryListDto } from '@/shared/lib/api/Api';

export interface InflowFormContainerProps {
  journalEntry?: IJournalEntryListDto;
  initialValues?: Partial<ICashTransactionFormValues>;
  restoring?: boolean;
  onAddCounterparty?: (
    values: ICashTransactionFormValues,
    name: string
  ) => void;
  initialEditItemId?: string;
  onAddCategory?: (values: ICashTransactionFormValues, itemId?: string) => void;
  onAddAccount?: (
    values: ICashTransactionFormValues,
    field?: UTransactionAccountField
  ) => void;
  onSuccess: () => Promise<void>;
}
