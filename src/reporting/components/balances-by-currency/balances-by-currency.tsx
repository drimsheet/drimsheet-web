import { CurrencyLogo } from '@/shared/components/currency-logo';
import { Money } from '@/shared/components/money';
import balancesByCurrencyHelpers from './helper';
import type { BalancesByCurrencyProps } from './types';

export function BalancesByCurrency({
  balances,
}: Readonly<BalancesByCurrencyProps>) {
  return (
    <>
      {balances.map((balance) => (
        <div
          key={balance.currencyCode}
          className="flex w-fit flex-none flex-col items-start gap-1"
        >
          <dt>
            <span className="sr-only">{balance.currencyCode}</span>
            <CurrencyLogo
              aria-hidden
              url={balancesByCurrencyHelpers.currencyLogo(balance.currencyCode)}
              className="size-5"
            />
          </dt>
          <dd className="m-0 whitespace-nowrap text-base font-medium tabular-nums">
            <Money value={balance} />
          </dd>
        </div>
      ))}
    </>
  );
}
