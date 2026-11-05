import type { IItemizedFieldValue } from '@/journal-entries/components/itemized-fields';
import type { ICurrencyExchangeRateInputValue } from '@/shared/components/currency-exchange-rate-input';
import type {
  ICounterpartyDto,
  IExchangeRate,
  ILedgerAccountDto,
  IMoneyDto,
} from '@/shared/lib/api/Api';

export type TCashTransactionCounterparty = Pick<
  ICounterpartyDto,
  'id' | 'name'
> &
  Partial<Pick<ICounterpartyDto, 'type'>>;

export interface ICashTransactionFormValues {
  accountId: string;
  categoryId: string;
  amount: IMoneyDto;
  date: string;
  exchangeRate: ICurrencyExchangeRateInputValue | null;
  isItemized: boolean;
  items: IItemizedFieldValue[];
  counterparty: TCashTransactionCounterparty;
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
  counterpartyOptions?: TCashTransactionCounterparty[];
  disabled?: boolean;
  functionalCurrencyCode: string;
  initialValues?: Partial<ICashTransactionFormValues>;
  loading?: boolean;
  onAddCounterparty?: (
    values: ICashTransactionFormValues,
    name: string
  ) => void;
  officialExchangeRate?: IExchangeRate;
  initialEditItemId?: string;
  onAddCategory?: (values: ICashTransactionFormValues, itemId?: string) => void;
  onAddAccount?: (values: ICashTransactionFormValues) => void;
  onCurrencyContextChange: (context: ICashTransactionCurrencyContext) => void;
  onSaveDraft?: (values: ICashTransactionFormValues) => void;
  onSubmit: (values: ICashTransactionFormValues) => void;
  savingDraft?: boolean;
  submitLabel?: string;
  variant?: UCashTransactionFormVariant;
}

export interface CounterpartySelectProps {
  value: TCashTransactionCounterparty;
  options: TCashTransactionCounterparty[];
  onChange: (value: TCashTransactionCounterparty | null) => void;
  onCreate?: (name: string) => void;
  creationDisabled?: boolean;
  disabled?: boolean;
  error?: Array<{ message?: string } | undefined>;
  label: string;
  placeholder: string;
  emptyMessage: string;
  createLabel: string;
  onBlur: () => void;
}

export type UCounterpartySelectItem =
  | TCashTransactionCounterparty
  | 'create-counterparty';
