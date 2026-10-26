import type { IBankDetailsFormValues } from '@/account/components/bank-details-form';
import type { IPettyCashAccountFormValues } from '@/account/components/petty-cash-account-form';
import { assetAccountMapper } from '@/account/lib/mappers/asset-account.mapper';
import currencies from '@/shared/configs/currencies.json' with { type: 'json' };
import type {
  IBankAccountUpdateReq,
  IBankDetails,
  IExchangeRate,
  ILedgerAccountDto,
  IOpeningBalanceDto,
  IPettyCashAccountUpdateReq,
} from '@/shared/lib/api/Api';

function toOpeningBalanceAmount(
  openingBalance: IOpeningBalanceDto | null
): number | '' {
  if (!openingBalance) {
    return '';
  }

  const money = openingBalance.amount;

  const minorUnit =
    currencies.find((currency) => currency.code === money.currencyCode)
      ?.minorUnit ??
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: money.currencyCode,
    }).resolvedOptions().maximumFractionDigits ??
    2;

  return money.isMinorUnit ? money.amount / 10 ** minorUnit : money.amount;
}

function toPettyCashValues(
  account: ILedgerAccountDto,
  openingBalance: IOpeningBalanceDto | null
): IPettyCashAccountFormValues {
  return {
    name: account.name,
    currencyCode: account.balance.currencyCode,
    createWithoutOpeningBalance: openingBalance !== null,
    openingBalance: toOpeningBalanceAmount(openingBalance),
    openingDate: openingBalance?.date.slice(0, 10) ?? '',
    exchangeRate: openingBalance?.exchangeRate
      ? { value: openingBalance.exchangeRate.rate, inverted: false }
      : null,
  };
}

function toBankValues(
  account: ILedgerAccountDto,
  bank: IBankDetails,
  openingBalance: IOpeningBalanceDto | null
): IBankDetailsFormValues {
  return {
    name: account.name,
    currencyCode: account.balance.currencyCode,
    bankLocation: bank.countryCode,
    bankName: bank.bankName,
    accountName: bank.accountName,
    accountNumber: bank.accountNumber,
    createWithoutOpeningBalance: openingBalance !== null,
    openingBalance: toOpeningBalanceAmount(openingBalance),
    openingDate: openingBalance?.date.slice(0, 10) ?? '',
    exchangeRate: openingBalance?.exchangeRate
      ? { value: openingBalance.exchangeRate.rate, inverted: false }
      : null,
  };
}

function toPettyCashUpdateReq(
  values: IPettyCashAccountFormValues,
  baseline: ILedgerAccountDto,
  officialExchangeRate?: IExchangeRate
): IPettyCashAccountUpdateReq {
  return {
    name: values.name === baseline.name ? undefined : values.name,
    currencyCode:
      values.currencyCode === baseline.balance.currencyCode
        ? undefined
        : values.currencyCode,
    openingBalance:
      assetAccountMapper.toOpeningBalanceDto(
        values,
        baseline.functionalBalance.currencyCode,
        officialExchangeRate
      ) ?? undefined,
  };
}

function toBankUpdateReq(
  values: IBankDetailsFormValues,
  baseline: ILedgerAccountDto,
  bank: IBankDetails,
  officialExchangeRate?: IExchangeRate
): IBankAccountUpdateReq {
  const bankChanged =
    values.bankName !== bank.bankName ||
    values.accountName !== bank.accountName ||
    values.accountNumber !== bank.accountNumber;

  return {
    name: values.name === baseline.name ? undefined : values.name,
    currencyCode:
      values.currencyCode === baseline.balance.currencyCode
        ? undefined
        : values.currencyCode,
    bankAccount: bankChanged
      ? {
          bankName: values.bankName,
          accountName: values.accountName,
          accountNumber: values.accountNumber,
        }
      : undefined,
    openingBalance:
      assetAccountMapper.toOpeningBalanceDto(
        values,
        baseline.functionalBalance.currencyCode,
        officialExchangeRate
      ) ?? undefined,
  };
}

export const assetAccountUpdateMapper = Object.freeze({
  toPettyCashValues,
  toBankValues,
  toPettyCashUpdateReq,
  toBankUpdateReq,
});
