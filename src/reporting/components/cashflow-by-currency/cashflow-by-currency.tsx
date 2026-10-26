import { CurrencyLogo } from '@/shared/components/currency-logo';
import { Money } from '@/shared/components/money';
import currencies from '@/shared/configs/currencies.json';
import { CashflowByCurrencyError } from './state';
import type { CashflowByCurrencyProps } from './types';
import { hasMatchingCurrencies } from './validation';

export function CashflowByCurrency({
  in: moneyIn,
  out: moneyOut,
}: Readonly<CashflowByCurrencyProps>) {
  if (!hasMatchingCurrencies(moneyIn, moneyOut)) {
    return <CashflowByCurrencyError />;
  }

  const currencyCode = moneyIn.currencyCode.toUpperCase();
  const logo = currencies.find(({ code }) => code === currencyCode)?.logo;

  return (
    <div
      className="flex w-fit flex-none items-center gap-4"
      aria-label={currencyCode}
    >
      <CurrencyLogo aria-hidden url={logo} className="size-12 shrink-0" />
      <div className="flex flex-col gap-1 whitespace-nowrap text-2xl font-medium tabular-nums">
        <div
          className={
            moneyIn.amount > 0
              ? 'text-financial-income'
              : 'text-financial-neutral'
          }
        >
          {moneyIn.amount > 0 && '+'}
          <Money value={moneyIn} />
        </div>
        <Money
          value={{ ...moneyOut, amount: -Math.abs(moneyOut.amount) || 0 }}
          className={
            moneyOut.amount > 0
              ? 'text-financial-expense'
              : 'text-financial-neutral'
          }
        />
      </div>
    </div>
  );
}
