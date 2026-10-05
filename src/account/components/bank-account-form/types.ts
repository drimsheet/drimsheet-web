import type { IOpeningBalanceExchangeRateContext } from '@/account/lib/types/opening-balance-exchange-rate.types';
import type { ICurrencyExchangeRateInputValue } from '@/shared/components/currency-exchange-rate-input';
import type {
  IBankDirectoryDto,
  ICurrencyDto,
  IExchangeRate,
} from '@/shared/lib/api/Api';

export interface IBankAccountFormValues {
  name: string;
  currencyCode: string;
  bankLocation: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  createWithoutOpeningBalance: boolean;
  openingBalance: number | '';
  openingDate: string;
  exchangeRate: ICurrencyExchangeRateInputValue | null;
  isSubAccount: boolean;
}

export interface BankAccountFormProps {
  accountingCurrencyCode: string;
  currencies: ICurrencyDto[];
  bankLocations: Array<{ code: string; name: string }>;
  banks: IBankDirectoryDto[];
  isBanksLoading?: boolean;
  officialExchangeRate?: IExchangeRate;
  onBankLocationChange: (location: string) => void;
  onExchangeRateContextChange: (
    context: IOpeningBalanceExchangeRateContext
  ) => void;
  initialValues?: Partial<IBankAccountFormValues>;
  loading?: boolean;
  disabled?: boolean;
  onSubmit: (values: IBankAccountFormValues) => void | Promise<void>;
}

export type BankAccountFormContainerProps = Pick<
  BankAccountFormProps,
  | 'accountingCurrencyCode'
  | 'currencies'
  | 'bankLocations'
  | 'initialValues'
  | 'loading'
  | 'disabled'
  | 'officialExchangeRate'
  | 'onExchangeRateContextChange'
  | 'onSubmit'
> & {
  initialBankLocation?: string;
};
