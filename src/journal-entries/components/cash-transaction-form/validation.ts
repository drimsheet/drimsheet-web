import type { IExchangeRate, ILedgerAccountDto } from '@/shared/lib/api/Api';
import { dateUtils } from '@/shared/lib/utils/date';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import cashTransactionFormHelpers from './helper';
import type {
  ICashTransactionFormValues,
  UCashTransactionFormVariant,
} from './types';

const MAX_ATTACHMENT_SIZE_BYTES = 2 * 1024 * 1024;

const ACCEPTED_ATTACHMENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
]);

const ACCEPTED_ATTACHMENT_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.pdf'];

export interface ICashTransactionFormValidationMessages {
  accountRequired: string;
  amountPositive: string;
  amountRequired: string;
  categoryRequired: string;
  dateBeforeAccountOpening: string;
  dateFuture: string;
  dateRequired: string;
  exchangeRateNumber: string;
  exchangeRatePositive: string;
  exchangeRateRequired: string;
  itemAmountPositive: string;
  itemAmountRequired: string;
  itemCategoryRequired: string;
  itemsRequired: string;
  counterpartyRequired: string;
  attachmentSize: string;
  attachmentType: string;
}

function requiresExchangeRate(
  accountId: string,
  accounts: ILedgerAccountDto[],
  functionalCurrencyCode: string
) {
  const accountCurrencyCode = accounts.find(
    (account) => account.id === accountId
  )?.balance.currencyCode;

  return cashTransactionFormHelpers.isExchangeRateRequired(
    accountCurrencyCode,
    functionalCurrencyCode
  );
}

function isAcceptedAttachment(file: File) {
  const lowerName = file.name.toLowerCase();

  return (
    ACCEPTED_ATTACHMENT_TYPES.has(file.type) &&
    ACCEPTED_ATTACHMENT_EXTENSIONS.some((extension) =>
      lowerName.endsWith(extension)
    )
  );
}

export function createCashTransactionFormValidation(
  accounts: ILedgerAccountDto[],
  functionalCurrencyCode: string,
  messages: ICashTransactionFormValidationMessages,
  officialExchangeRate?: IExchangeRate
) {
  const exchangeRateValidation = yup
    .mixed<NonNullable<ICashTransactionFormValues['exchangeRate']>>()
    .nullable()
    .test(
      'required-exchange-rate',
      messages.exchangeRateRequired,
      function (exchangeRate) {
        const values = this.parent as ICashTransactionFormValues;

        const required = requiresExchangeRate(
          values.accountId,
          accounts,
          functionalCurrencyCode
        );

        const accountCurrencyCode = accounts.find(
          (account) => account.id === values.accountId
        )?.balance.currencyCode;

        const hasOfficialRate = cashTransactionFormHelpers.matchesOfficialRate(
          officialExchangeRate,
          accountCurrencyCode ?? '',
          functionalCurrencyCode,
          values.date
        );

        if (!required || hasOfficialRate || exchangeRate != null) {
          return true;
        }

        return false;
      }
    )
    .test(
      'numeric-exchange-rate',
      messages.exchangeRateNumber,
      function (exchangeRate) {
        const values = this.parent as ICashTransactionFormValues;

        const required = requiresExchangeRate(
          values.accountId,
          accounts,
          functionalCurrencyCode
        );

        const rate = exchangeRate?.value;

        if (!required || rate === null || rate === undefined) return true;

        return (
          Number.isFinite(rate) ||
          this.createError({ message: messages.exchangeRateNumber })
        );
      }
    )
    .test(
      'positive-exchange-rate',
      messages.exchangeRatePositive,
      function (exchangeRate) {
        const values = this.parent as ICashTransactionFormValues;

        const required = requiresExchangeRate(
          values.accountId,
          accounts,
          functionalCurrencyCode
        );

        const rate = exchangeRate?.value;

        if (
          !required ||
          rate === null ||
          rate === undefined ||
          !Number.isFinite(rate)
        ) {
          return true;
        }

        return (
          rate > 0 ||
          this.createError({ message: messages.exchangeRatePositive })
        );
      }
    );

  const moneyValidation = yup.object({
    amount: yup
      .number()
      .typeError(messages.itemAmountRequired)
      .required(messages.itemAmountRequired)
      .moreThan(0, messages.itemAmountPositive),
    currencyCode: yup.string().defined(),
    isMinorUnit: yup.boolean().defined(),
  });

  return yup.object({
    accountId: yup.string().required(messages.accountRequired),
    categoryId: yup.string().when('isItemized', {
      is: false,
      then: (schema) => schema.required(messages.categoryRequired),
      otherwise: (schema) => schema.optional(),
    }),
    amount: yup.mixed().when('isItemized', {
      is: true,
      then: () =>
        yup.object({
          amount: yup.mixed<number>().defined(),
          currencyCode: yup.string().defined(),
          isMinorUnit: yup.boolean().defined(),
        }),
      otherwise: () =>
        yup.object({
          amount: yup
            .number()
            .typeError(messages.amountRequired)
            .required(messages.amountRequired)
            .moreThan(0, messages.amountPositive),
          currencyCode: yup.string().defined(),
          isMinorUnit: yup.boolean().defined(),
        }),
    }),
    date: yup
      .string()
      .required(messages.dateRequired)
      .test('not-in-future', messages.dateFuture, (value) =>
        value ? dateUtils.isNotInTheFuture(value) : true
      )
      .test(
        'not-before-account-opening',
        messages.dateBeforeAccountOpening,
        function (value) {
          if (!value) return true;

          const values = this.parent as ICashTransactionFormValues;

          const openingBalanceDate = accounts.find(
            (account) => account.id === values.accountId
          )?.openingBalanceDate;

          return openingBalanceDate
            ? dateUtils.isOnOrAfter(value, openingBalanceDate)
            : true;
        }
      ),
    exchangeRate: exchangeRateValidation,
    isItemized: yup.boolean().defined(),
    items: yup
      .array()
      .of(
        yup.object({
          id: yup.string().defined(),
          amount: moneyValidation,
          accountId: yup.string().required(messages.itemCategoryRequired),
          description: yup.string().optional(),
        })
      )
      .when('isItemized', {
        is: true,
        then: (schema) => schema.min(1, messages.itemsRequired),
        otherwise: (schema) => schema.optional(),
      }),
    counterparty: yup.object({
      id: yup.string().optional(),
      name: yup.string().trim().required(messages.counterpartyRequired),
      type: yup.string().optional(),
    }),
    description: yup.string().optional(),
    attachment: yup
      .mixed<File>()
      .nullable()
      .test('attachment-type', messages.attachmentType, (file) =>
        file ? isAcceptedAttachment(file) : true
      )
      .test('attachment-size', messages.attachmentSize, (file) =>
        file ? file.size <= MAX_ATTACHMENT_SIZE_BYTES : true
      ),
  });
}

export function useCashTransactionFormValidation(
  accounts: ILedgerAccountDto[],
  functionalCurrencyCode: string,
  variant?: UCashTransactionFormVariant,
  officialExchangeRate?: IExchangeRate
) {
  const { t } = useTranslation<'journal-entries'>('journal-entries');

  const counterpartyTextKeys =
    cashTransactionFormHelpers.getCounterpartyTextKeys(variant);

  return useMemo(
    () =>
      createCashTransactionFormValidation(
        accounts,
        functionalCurrencyCode,
        {
          accountRequired: t('cash_transaction_account_required_text'),
          amountPositive: t('cash_transaction_amount_positive_text'),
          amountRequired: t('cash_transaction_amount_required_text'),
          categoryRequired: t('cash_transaction_category_required_text'),
          dateBeforeAccountOpening: t(
            'cash_transaction_date_before_account_opening_text'
          ),
          dateFuture: t('cash_transaction_date_future_text'),
          dateRequired: t('cash_transaction_date_required_text'),
          exchangeRateNumber: t('cash_transaction_exchange_rate_number_text'),
          exchangeRatePositive: t(
            'cash_transaction_exchange_rate_positive_text'
          ),
          exchangeRateRequired: t(
            'cash_transaction_exchange_rate_required_text'
          ),
          itemAmountPositive: t('itemized_amount_positive_text'),
          itemAmountRequired: t('itemized_amount_required_text'),
          itemCategoryRequired: t('itemized_category_required_text'),
          itemsRequired: t('itemized_items_required_text'),
          counterpartyRequired: t(counterpartyTextKeys.required),
          attachmentSize: t('cash_transaction_attachment_size_text'),
          attachmentType: t('cash_transaction_attachment_type_text'),
        },
        officialExchangeRate
      ),
    [
      accounts,
      counterpartyTextKeys.required,
      functionalCurrencyCode,
      officialExchangeRate,
      t,
    ]
  );
}
