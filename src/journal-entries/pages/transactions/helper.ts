import currencies from '@/shared/configs/currencies.json';
import type { ILedgerTotalDebitsAndCreditsByCurrencyDto } from '@/shared/lib/api/Api';
import type { ICurrencyActivity } from './types';

function mergeCurrencies(
  revenue: ILedgerTotalDebitsAndCreditsByCurrencyDto,
  expense: ILedgerTotalDebitsAndCreditsByCurrencyDto
): ICurrencyActivity[] {
  const inflows = new Map(
    revenue.totalsByCurrency.map(({ delta }) => [delta.currencyCode, delta])
  );

  const outflows = new Map(
    expense.totalsByCurrency.map(({ delta }) => [delta.currencyCode, delta])
  );

  const codes = [...new Set([...inflows.keys(), ...outflows.keys()])].sort();

  return codes.map((currencyCode) => {
    const inflow = inflows.get(currencyCode);
    const outflow = outflows.get(currencyCode);

    return {
      currencyCode,
      logo: currencies.find(({ code }) => code === currencyCode)?.logo,
      inflow: {
        amount: inflow?.amount ?? 0,
        currencyCode,
        isMinorUnit: inflow?.isMinorUnit ?? false,
      },
      outflow: {
        amount: outflow?.amount ? -outflow.amount : 0,
        currencyCode,
        isMinorUnit: outflow?.isMinorUnit ?? false,
      },
    };
  });
}

const transactionsHelpers = Object.freeze({ mergeCurrencies });
export default transactionsHelpers;
