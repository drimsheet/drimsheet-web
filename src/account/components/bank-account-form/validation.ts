import type { IExchangeRate } from '@/shared/lib/api/Api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

export interface BankAccountValidationMessages {
  accountNameRequired: string;
  accountNameMinLength: string;
  accountNameMaxLength: string;
  currencyRequired: string;
  bankLocationRequired: string;
  bankNameRequired: string;
  bankAccountNumberRequired: string;
  bankAccountNameRequired: string;
  openingBalanceRequired: string;
  openingBalanceNumber: string;
  openingDateRequired: string;
  exchangeRateRequired: string;
  exchangeRateNumber: string;
  exchangeRatePositive: string;
}

const optionalNumber = (typeErrorMessage: string) =>
  yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === null || originalValue === '') return undefined;

      return value;
    })
    .typeError(typeErrorMessage);

export function createBankAccountFormValidation(
  accountingCurrencyCode: string,
  messages: BankAccountValidationMessages,
  officialExchangeRate?: IExchangeRate
) {
  return yup.object({
    name: yup
      .string()
      .required(messages.accountNameRequired)
      .min(3, messages.accountNameMinLength)
      .max(100, messages.accountNameMaxLength),
    currencyCode: yup.string().required(messages.currencyRequired),
    bankLocation: yup.string().required(messages.bankLocationRequired),
    bankName: yup.string().required(messages.bankNameRequired),
    accountNumber: yup.string().required(messages.bankAccountNumberRequired),
    accountName: yup.string().required(messages.bankAccountNameRequired),
    createWithoutOpeningBalance: yup.boolean().required(),
    openingBalance: optionalNumber(messages.openingBalanceNumber).when(
      'createWithoutOpeningBalance',
      {
        is: false,
        then: (schema) => schema.required(messages.openingBalanceRequired),
        otherwise: (schema) => schema.notRequired(),
      }
    ),
    openingDate: yup.string().when('createWithoutOpeningBalance', {
      is: false,
      then: (schema) => schema.required(messages.openingDateRequired),
      otherwise: (schema) => schema.notRequired(),
    }),
    exchangeRate: yup
      .mixed<{ value: number; inverted: boolean }>()
      .nullable()
      .test('required', messages.exchangeRateRequired, function (exchangeRate) {
        const values = this.parent as {
          createWithoutOpeningBalance: boolean;
          currencyCode: string;
        };

        const required =
          !values.createWithoutOpeningBalance &&
          Boolean(values.currencyCode) &&
          values.currencyCode !== accountingCurrencyCode;

        return (
          !required || Boolean(officialExchangeRate) || exchangeRate !== null
        );
      })
      .test('number', messages.exchangeRateNumber, (exchangeRate) =>
        exchangeRate == null ? true : Number.isFinite(exchangeRate.value)
      )
      .test('positive', messages.exchangeRatePositive, (exchangeRate) =>
        exchangeRate == null || !Number.isFinite(exchangeRate.value)
          ? true
          : exchangeRate.value > 0
      ),
    isSubAccount: yup.boolean().required(),
  });
}

export function useBankAccountFormValidation(
  accountingCurrencyCode: string,
  officialExchangeRate?: IExchangeRate
) {
  const { t } = useTranslation<'ledger-accounts'>('ledger-accounts');

  const account_name_required_text = t('account_name_required_text');
  const account_name_min_length_text = t('account_name_min_length_text');
  const account_name_max_length_text = t('account_name_max_length_text');
  const currency_required_text = t('currency_required_text');
  const bank_location_required_text = t('bank_location_required_text');
  const bank_name_required_text = t('bank_name_required_text');

  const bank_account_number_required_text = t(
    'bank_account_number_required_text'
  );

  const bank_account_name_required_text = t('bank_account_name_required_text');
  const opening_balance_required_text = t('opening_balance_required_text');
  const opening_balance_number_text = t('opening_balance_number_text');
  const opening_date_required_text = t('opening_date_required_text');
  const exchange_rate_required_text = t('exchange_rate_required_text');
  const exchange_rate_number_text = t('exchange_rate_number_text');
  const exchange_rate_positive_text = t('exchange_rate_positive_text');

  return useMemo(
    () =>
      createBankAccountFormValidation(
        accountingCurrencyCode,
        {
          accountNameRequired: account_name_required_text,
          accountNameMinLength: account_name_min_length_text,
          accountNameMaxLength: account_name_max_length_text,
          currencyRequired: currency_required_text,
          bankLocationRequired: bank_location_required_text,
          bankNameRequired: bank_name_required_text,
          bankAccountNumberRequired: bank_account_number_required_text,
          bankAccountNameRequired: bank_account_name_required_text,
          openingBalanceRequired: opening_balance_required_text,
          openingBalanceNumber: opening_balance_number_text,
          openingDateRequired: opening_date_required_text,
          exchangeRateRequired: exchange_rate_required_text,
          exchangeRateNumber: exchange_rate_number_text,
          exchangeRatePositive: exchange_rate_positive_text,
        },
        officialExchangeRate
      ),
    [
      accountingCurrencyCode,
      account_name_required_text,
      account_name_min_length_text,
      account_name_max_length_text,
      currency_required_text,
      bank_location_required_text,
      bank_name_required_text,
      bank_account_number_required_text,
      bank_account_name_required_text,
      opening_balance_required_text,
      opening_balance_number_text,
      opening_date_required_text,
      officialExchangeRate,
      exchange_rate_required_text,
      exchange_rate_number_text,
      exchange_rate_positive_text,
    ]
  );
}
