import type { IMoneyDto } from '@/shared/lib/api/Api';

export function hasMatchingCurrencies(moneyIn: IMoneyDto, moneyOut: IMoneyDto) {
  return (
    moneyIn.currencyCode.toUpperCase() === moneyOut.currencyCode.toUpperCase()
  );
}
