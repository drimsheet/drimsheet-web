import type { ICurrencyDto } from '@/shared/lib/api/Api';

export interface CurrencySelectProps {
  label: string;
  id?: string;
  disabled?: boolean;
  value: string;
  currencies: ICurrencyDto[];
  onChange: (value: string) => void;
  error?: Array<{ message?: string } | undefined>;
  displayCode?: boolean;
}

export interface ICurrency extends ICurrencyDto {
  logo: string;
}
