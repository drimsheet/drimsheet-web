import type { MoneyInputProps } from '@/shared/components/money-input';
import type { ICurrencyDto, IMoneyDto } from '@/shared/lib/api/Api';
import type { ChangeEvent } from 'react';

export interface MoneyWithCurrencyInputProps extends Omit<
  MoneyInputProps,
  'className' | 'currencyCode' | 'onChange' | 'value'
> {
  amountClassName?: string;
  className?: string;
  currencies?: ICurrencyDto[];
  currencyDisabled?: boolean;
  currencyLabel?: string;
  currencyLabelFormat?: 'code' | 'symbol' | 'none';
  onChange?: (value: IMoneyDto, event?: ChangeEvent<HTMLInputElement>) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  showFlag?: boolean;
  value?: IMoneyDto;
}
