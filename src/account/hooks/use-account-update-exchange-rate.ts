import { assetAccountMapper } from '@/account/lib/mappers/asset-account.mapper';
import type { IOpeningBalanceExchangeRateContext } from '@/account/lib/types/opening-balance-exchange-rate.types';
import { useExchangeRates } from '@/shared/hooks/use-exchange-rates';
import type { ILedgerAccountDto } from '@/shared/lib/api/Api';
import { useState } from 'react';

export function useAccountUpdateExchangeRate(account: ILedgerAccountDto) {
  const [context, setContext] = useState<IOpeningBalanceExchangeRateContext>({
    currencyCode: account.balance.currencyCode,
    date: account.openingBalanceDate?.slice(0, 10) ?? '',
    createWithoutOpeningBalance: true,
  });

  const rates = useExchangeRates(
    assetAccountMapper.toOpeningBalanceExchangeRateQuery(
      context,
      account.functionalBalance.currencyCode
    )
  );

  return {
    officialExchangeRate: rates.data?.[0],
    onExchangeRateContextChange: setContext,
  };
}
