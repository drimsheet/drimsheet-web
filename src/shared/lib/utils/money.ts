import currencies from '@/shared/configs/currencies.json';
import type { IMoneyDto } from '@/shared/lib/api/Api';

export function toMajorUnits(money: IMoneyDto): number {
  const currency = currencies.find(
    ({ code }) => code.toLowerCase() === money.currencyCode.toLowerCase()
  );

  return money.isMinorUnit
    ? money.amount / 10 ** (currency?.minorUnit ?? 0)
    : money.amount;
}
