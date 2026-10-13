import type { IOpeningBalanceExchangeRateContext } from '@/account/lib/types/opening-balance-exchange-rate.types';
import type { ICurrencyExchangeRateInputValue } from '@/shared/components/currency-exchange-rate-input';
import type {
  ICurrencyDto,
  IExchangeRate,
  ILedgerAccountDto,
} from '@/shared/lib/api/Api';

export interface IPettyCashAccountFormValues {
  name: string;
  currencyCode: string;
  createWithoutOpeningBalance: boolean;
  openingBalance: number | '';
  openingDate: string;
  exchangeRate: ICurrencyExchangeRateInputValue | null;
  isSubAccount: boolean;
}

export interface PettyCashAccountFormProps {
  mode?: 'create' | 'update';
  hasExistingOpeningBalance?: boolean;
  canUpdateCurrency?: boolean;
  onCancel?: () => void;
  accountingCurrencyCode: string;
  currencies: ICurrencyDto[];
  officialExchangeRate?: IExchangeRate;
  initialValues?: Partial<IPettyCashAccountFormValues>;
  loading?: boolean;
  disabled?: boolean;
  onExchangeRateContextChange: (
    context: IOpeningBalanceExchangeRateContext
  ) => void;
  onSubmit: (values: IPettyCashAccountFormValues) => Promise<void> | void;
}

export interface PettyCashAccountFormUpdateContainerProps {
  account: ILedgerAccountDto;
  onSuccess: () => void;
  onCancel: () => void;
  onBusyChange: (busy: boolean) => void;
}
