import type { IBankAccountFormValues } from '@/account/components/bank-account-form';
import type { IPettyCashAccountFormValues } from '@/account/components/petty-cash-account-form';
import type { IOpeningBalanceExchangeRateContext } from '@/account/lib/types/opening-balance-exchange-rate.types';
import type {
  IBankAccountCreationReq,
  IBankDetailsCreationReq,
  IExchangeRate,
  IExchangeRateDto,
  IExchangeRateQueryParam,
  IPettyCashAccountCreationReq,
} from '@/shared/lib/api/Api';
import { EExchangeRateType } from '@/shared/lib/api/Api';
import { currencyMapper } from '@/shared/lib/mappers/currency.mapper';
import { moneyMapper } from '@/shared/lib/mappers/money.mapper';

function toEnteredExchangeRatePair(
  baseCurrencyCode: string,
  targetCurrencyCode: string,
  inverted: boolean
) {
  if (inverted) {
    return {
      baseCurrencyCode: targetCurrencyCode,
      targetCurrencyCode: baseCurrencyCode,
    };
  }

  return { baseCurrencyCode, targetCurrencyCode };
}

function toOpeningBalanceExchangeRateQuery(
  context: IOpeningBalanceExchangeRateContext,
  accountingCurrencyCode: string
): IExchangeRateQueryParam | undefined {
  if (
    context.createWithoutOpeningBalance ||
    !context.currencyCode ||
    !context.date ||
    !accountingCurrencyCode ||
    context.currencyCode === accountingCurrencyCode
  ) {
    return undefined;
  }

  return {
    currencyPair: `${context.currencyCode}/${accountingCurrencyCode}`,
    type: EExchangeRateType.Official,
    asOf: context.date,
    limit: 1,
  };
}

function toPettyCashAccountCreationDto(
  values: IPettyCashAccountFormValues,
  accountingCurrencyCode: string,
  officialExchangeRate?: IExchangeRate
): IPettyCashAccountCreationReq {
  if (values.createWithoutOpeningBalance) {
    return {
      name: values.name,
      currencyCode: values.currencyCode,
      isControlAccount: false,
      openingBalance: null,
    };
  }

  const hasForeignCurrency = values.currencyCode !== accountingCurrencyCode;
  let exchangeRate: IExchangeRateDto | null = null;

  if (hasForeignCurrency) {
    const enteredExchangeRate = values.exchangeRate ?? {
      value: officialExchangeRate?.rate ?? null,
      inverted: false,
    };

    exchangeRate = currencyMapper.toUserEnteredExchangeRate(
      {
        baseCurrencyCode: values.currencyCode,
        targetCurrencyCode: accountingCurrencyCode,
        rate: enteredExchangeRate.value,
        asOf: values.openingDate,
      },
      toEnteredExchangeRatePair(
        values.currencyCode,
        accountingCurrencyCode,
        enteredExchangeRate.inverted
      )
    );
  }

  return {
    name: values.name,
    currencyCode: values.currencyCode,
    isControlAccount: false,
    openingBalance: {
      amount: moneyMapper.toMoneyDto(
        values.openingBalance,
        values.currencyCode
      ),
      date: values.openingDate,
      exchangeRate,
    },
  };
}

function toBankAccountCreationDto(
  values: IBankAccountFormValues,
  accountingCurrencyCode: string,
  officialExchangeRate?: IExchangeRate
): IBankAccountCreationReq {
  const bankAccount: IBankDetailsCreationReq = {
    bankName: values.bankName,
    accountName: values.accountName,
    accountNumber: values.accountNumber,
  };

  if (values.createWithoutOpeningBalance) {
    return {
      name: values.name,
      currencyCode: values.currencyCode,
      bankAccount,
      openingBalance: null,
    };
  }

  const hasForeignCurrency = values.currencyCode !== accountingCurrencyCode;
  let exchangeRate: IExchangeRateDto | null = null;

  if (hasForeignCurrency) {
    const enteredExchangeRate = values.exchangeRate ?? {
      value: officialExchangeRate?.rate ?? null,
      inverted: false,
    };

    exchangeRate = currencyMapper.toUserEnteredExchangeRate(
      {
        baseCurrencyCode: values.currencyCode,
        targetCurrencyCode: accountingCurrencyCode,
        rate: enteredExchangeRate.value,
        asOf: values.openingDate,
      },
      toEnteredExchangeRatePair(
        values.currencyCode,
        accountingCurrencyCode,
        enteredExchangeRate.inverted
      )
    );
  }

  return {
    name: values.name,
    currencyCode: values.currencyCode,
    bankAccount,
    openingBalance: {
      amount: moneyMapper.toMoneyDto(
        values.openingBalance,
        values.currencyCode
      ),
      date: values.openingDate,
      exchangeRate,
    },
  };
}

export const assetAccountMapper = Object.freeze({
  toOpeningBalanceExchangeRateQuery,
  toPettyCashAccountCreationDto,
  toBankAccountCreationDto,
});
