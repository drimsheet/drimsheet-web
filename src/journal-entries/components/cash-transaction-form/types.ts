import type { IItemizedFieldValue } from '@/journal-entries/components/itemized-fields';
import type { ICurrencyExchangeRateInputValue } from '@/shared/components/currency-exchange-rate-input';
import type {
  IExchangeRate,
  IJournalCounterpartyReq,
  ILedgerAccountDto,
  IMoneyDto,
} from '@/shared/lib/api/Api';

export interface ICashTransactionFormValues {
  accountId: string;
  categoryId: string;
  amount: IMoneyDto;
  date: string;
  exchangeRate: ICurrencyExchangeRateInputValue | null;
  isItemized: boolean;
  items: IItemizedFieldValue[];
  counterparty: IJournalCounterpartyReq;
  description: string;
  attachment: File | null;
}

export interface ICashTransactionCurrencyContext {
  currencyCode: string;
  date: string;
}

export type UCashTransactionFormVariant = 'inflow' | 'outflow';

export interface CashTransactionFormProps {
  accounts: ILedgerAccountDto[];
  categories: ILedgerAccountDto[];
  counterpartyOptions?: IJournalCounterpartyReq[];
  disabled?: boolean;
  functionalCurrencyCode: string;
  initialValues?: Partial<ICashTransactionFormValues>;
  loading?: boolean;
  officialExchangeRate?: IExchangeRate;
  onAddAccount?: (values: ICashTransactionFormValues) => void;
  onCurrencyContextChange: (context: ICashTransactionCurrencyContext) => void;
  onSaveDraft?: (values: ICashTransactionFormValues) => void;
  onSubmit: (values: ICashTransactionFormValues) => void;
  savingDraft?: boolean;
  submitLabel?: string;
  variant?: UCashTransactionFormVariant;
}
