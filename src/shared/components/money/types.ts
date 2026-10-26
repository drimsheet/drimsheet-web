import type { IMoneyDto } from '@/shared/lib/api/Api';
import type { ComponentProps } from 'react';
export interface MoneyProps extends ComponentProps<'span'> {
  value: IMoneyDto;
  localCode?: string;
  hide?: boolean;
  isConverted?: boolean;
  hideZeroMinorUnit?: boolean;
}
