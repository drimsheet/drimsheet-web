import type { ChangeEvent, ComponentProps } from 'react';

export type UMoneyInputDecimalType = 'money' | 'number';

export interface MoneyInputProps extends Omit<
  ComponentProps<'input'>,
  'value' | 'onChange'
> {
  currencyCode?: string;
  decimalType?: UMoneyInputDecimalType;
  locale?: string;
  value?: string | number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}
