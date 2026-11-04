import type { IItemizedFieldValue } from '@/journal-entries/components/itemized-fields';
import type { UTransactionAccountField } from '@/journal-entries/lib/types/transaction-continuation.types';
import type { ICurrencyExchangeRateInputValue } from '@/shared/components/currency-exchange-rate-input';
import type {
  IExchangeRate,
  IJournalEntryListDto,
  ILedgerAccountDto,
  IMoneyDto,
} from '@/shared/lib/api/Api';

export interface ICashTransferFormValues {
  sourceAccountId: string;
  destinationAccountId: string;
  amountSent: IMoneyDto;
  amountReceived: IMoneyDto;
  date: string;
  exchangeRate: ICurrencyExchangeRateInputValue | null;
  isItemized: boolean;
  items: IItemizedFieldValue[];
  description: string;
  attachment: File | null;
}

// TODO: remove this absurdity of separate initial value types from value types
export interface ICashTransferFormInitialValues {
  sourceAccountId?: string;
  destinationAccountId?: string;
  amountSent?: Partial<IMoneyDto>;
  amountReceived?: Partial<IMoneyDto>;
  date?: string;
  exchangeRate?: ICurrencyExchangeRateInputValue | null;
  isItemized?: boolean;
  items?: IItemizedFieldValue[];
  description?: string;
  attachment?: File | null;
}

export interface ICashTransferCurrencyContext {
  sourceCurrencyCode: string;
  destinationCurrencyCode: string;
  date: string;
}

export interface CashTransferFormProps {
  sourceAccounts: ILedgerAccountDto[];
  destinationAccounts: ILedgerAccountDto[];
  categories: ILedgerAccountDto[];
  disabled?: boolean;
  functionalCurrencyCode: string;
  initialValues?: ICashTransferFormInitialValues;
  loading?: boolean;
  officialExchangeRate?: IExchangeRate;
  initialEditItemId?: string;
  onAddCategory?: (values: ICashTransferFormValues, itemId?: string) => void;
  onAddAccount?: (
    values: ICashTransferFormValues,
    field: UTransactionAccountField
  ) => void;
  onCurrencyContextChange: (context: ICashTransferCurrencyContext) => void;
  onSaveDraft?: (values: ICashTransferFormValues) => void;
  onSubmit: (values: ICashTransferFormValues) => void;
  savingDraft?: boolean;
  submitLabel?: string;
}

export interface CashTransferFormContainerProps {
  journalEntry?: IJournalEntryListDto;
  initialValues?: Partial<ICashTransferFormValues>;
  restoring?: boolean;
  initialEditItemId?: string;
  onAddCategory?: (values: ICashTransferFormValues, itemId?: string) => void;
  onAddAccount?: (
    values: ICashTransferFormValues,
    field?: UTransactionAccountField
  ) => void;
  onSuccess?: () => Promise<void>;
}
