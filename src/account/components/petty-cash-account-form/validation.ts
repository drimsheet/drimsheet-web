import type { IExchangeRate } from '@/shared/lib/api/Api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

interface PettyCashAccountValidationMessages {
  accountNameRequired: string;
  accountNameMinLength: string;
  accountNameMaxLength: string;
  currencyRequired: string;
  openingBalanceRequired: string;
  openingBalanceNumber: string;
  openingBalanceNegative: string;
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

export function createPettyCashAccountFormValidation(
  accountingCurrencyCode: string,
  messages: PettyCashAccountValidationMessages,
  officialExchangeRate?: IExchangeRate
) {
  return yup.object({
    name: yup
      .string()
      .required(messages.accountNameRequired)
      .min(3, messages.accountNameMinLength)
      .max(100, messages.accountNameMaxLength),
    currencyCode: yup.string().required(messages.currencyRequired),
    createWithoutOpeningBalance: yup.boolean().required(),
    openingBalance: optionalNumber(messages.openingBalanceNumber).when(
      'createWithoutOpeningBalance',
      {
        is: false,
        then: (schema) =>
          schema
            .required(messages.openingBalanceRequired)
            .min(0, messages.openingBalanceNegative),
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

export function usePettyCashAccountFormValidation(
  accountingCurrencyCode: string,
  officialExchangeRate?: IExchangeRate
) {
  const { t } = useTranslation<'ledger-accounts'>('ledger-accounts');

  const account_name_required_text = t('account_name_required_text');
  const account_name_min_length_text = t('account_name_min_length_text');
  const account_name_max_length_text = t('account_name_max_length_text');
  const currency_required_text = t('currency_required_text');
  const opening_balance_required_text = t('opening_balance_required_text');
  const opening_balance_number_text = t('opening_balance_number_text');
  const opening_balance_negative_text = t('opening_balance_negative_text');
  const opening_date_required_text = t('opening_date_required_text');
  const exchange_rate_required_text = t('exchange_rate_required_text');
  const exchange_rate_number_text = t('exchange_rate_number_text');
  const exchange_rate_positive_text = t('exchange_rate_positive_text');

  return useMemo(
    () =>
      createPettyCashAccountFormValidation(
        accountingCurrencyCode,
        {
          accountNameRequired: account_name_required_text,
          accountNameMinLength: account_name_min_length_text,
          accountNameMaxLength: account_name_max_length_text,
          currencyRequired: currency_required_text,
          openingBalanceRequired: opening_balance_required_text,
          openingBalanceNumber: opening_balance_number_text,
          openingBalanceNegative: opening_balance_negative_text,
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
      opening_balance_required_text,
      opening_balance_number_text,
      opening_balance_negative_text,
      opening_date_required_text,
      officialExchangeRate,
      exchange_rate_required_text,
      exchange_rate_number_text,
      exchange_rate_positive_text,
    ]
  );
}
