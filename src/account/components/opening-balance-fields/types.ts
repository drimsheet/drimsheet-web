import type { ICurrencyExchangeRateInputValue } from '@/shared/components/currency-exchange-rate-input';
import type { IExchangeRate } from '@/shared/lib/api/Api';

interface FieldError {
  message?: string;
}

export interface OpeningBalanceFieldsProps {
  showSkipOpeningBalance?: boolean;
  skipOpeningBalanceLabel?: string;
  accountingCurrencyCode: string;
  currencyCode: string;
  createWithoutOpeningBalance: boolean;
  openingBalance: number | '';
  openingDate: string;
  exchangeRate: ICurrencyExchangeRateInputValue | null;
  officialExchangeRate?: IExchangeRate;
  disabled?: boolean;
  openingBalanceError?: Array<FieldError | undefined>;
  openingDateError?: Array<FieldError | undefined>;
  exchangeRateError?: Array<FieldError | undefined>;
  onCreateWithoutOpeningBalanceChange: (checked: boolean) => void;
  onOpeningBalanceChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpeningDateChange: (value: string) => void;
  onExchangeRateChange: (value: ICurrencyExchangeRateInputValue | null) => void;
}
