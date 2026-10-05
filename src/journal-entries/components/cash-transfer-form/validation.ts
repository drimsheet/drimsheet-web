import type { IExchangeRate, ILedgerAccountDto } from '@/shared/lib/api/Api';
import { dateUtils } from '@/shared/lib/utils/date';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import cashTransferFormHelpers from './helper';
import type { ICashTransferFormValues } from './types';

const MAX_ATTACHMENT_SIZE_BYTES = 2 * 1024 * 1024;

const ACCEPTED_ATTACHMENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
]);

const ACCEPTED_ATTACHMENT_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.pdf'];

export interface ICashTransferFormValidationMessages {
  sourceAccountRequired: string;
  destinationAccountRequired: string;
  accountsDifferent: string;
  amountSentPositive: string;
  amountSentRequired: string;
  amountReceivedPositive: string;
  amountReceivedRequired: string;
  amountsUnbalanced: string;
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
  attachmentSize: string;
  attachmentType: string;
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

function isExchangeRateRequired(values: ICashTransferFormValues) {
  return cashTransferFormHelpers.isExchangeRateRequired(
    values.amountSent.currencyCode,
    values.amountReceived.currencyCode
  );
}

export function createCashTransferFormValidation(
  sourceAccounts: ILedgerAccountDto[],
  destinationAccounts: ILedgerAccountDto[],
  messages: ICashTransferFormValidationMessages,
  officialExchangeRate?: IExchangeRate
) {
  const exchangeRateValidation = yup
    .mixed<NonNullable<ICashTransferFormValues['exchangeRate']>>()
    .nullable()
    .test(
      'required-exchange-rate',
      messages.exchangeRateRequired,
      function (exchangeRate) {
        const values = this.parent as ICashTransferFormValues;
        if (!isExchangeRateRequired(values)) return true;

        const hasRate =
          exchangeRate != null ||
          cashTransferFormHelpers.getEffectiveExchangeRate(
            values,
            officialExchangeRate
          ) !== undefined;

        return (
          hasRate ||
          this.createError({ message: messages.exchangeRateRequired })
        );
      }
    )
    .test(
      'numeric-exchange-rate',
      messages.exchangeRateNumber,
      function (exchangeRate) {
        const values = this.parent as ICashTransferFormValues;
        const rate = exchangeRate?.value;

        if (
          !isExchangeRateRequired(values) ||
          rate === null ||
          rate === undefined ||
          Number.isNaN(rate)
        ) {
          return true;
        }

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
        const values = this.parent as ICashTransferFormValues;
        const rate = exchangeRate?.value;

        if (
          !isExchangeRateRequired(values) ||
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

  const itemMoneyValidation = yup.object({
    amount: yup
      .number()
      .typeError(messages.itemAmountRequired)
      .required(messages.itemAmountRequired)
      .moreThan(0, messages.itemAmountPositive),
    currencyCode: yup.string().defined(),
    isMinorUnit: yup.boolean().defined(),
  });

  return yup
    .object({
      sourceAccountId: yup.string().required(messages.sourceAccountRequired),
      destinationAccountId: yup
        .string()
        .required(messages.destinationAccountRequired)
        .test(
          'different-account',
          messages.accountsDifferent,
          function (value) {
            const values = this.parent as ICashTransferFormValues;
            if (!value || !values.sourceAccountId) return true;

            return value !== values.sourceAccountId;
          }
        ),
      amountSent: yup.object({
        amount: yup
          .number()
          .typeError(messages.amountSentRequired)
          .required(messages.amountSentRequired)
          .moreThan(0, messages.amountSentPositive),
        currencyCode: yup.string().defined(),
        isMinorUnit: yup.boolean().defined(),
      }),
      amountReceived: yup.object({
        amount: yup
          .number()
          .typeError(messages.amountReceivedRequired)
          .required(messages.amountReceivedRequired)
          .moreThan(0, messages.amountReceivedPositive),
        currencyCode: yup.string().defined(),
        isMinorUnit: yup.boolean().defined(),
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

            const values = this.parent as ICashTransferFormValues;

            const sourceOpeningDate = sourceAccounts.find(
              (account) => account.id === values.sourceAccountId
            )?.openingBalanceDate;

            const destinationOpeningDate = destinationAccounts.find(
              (account) => account.id === values.destinationAccountId
            )?.openingBalanceDate;

            return [sourceOpeningDate, destinationOpeningDate].every(
              (openingDate) =>
                !openingDate || dateUtils.isOnOrAfter(value, openingDate)
            );
          }
        ),
      exchangeRate: exchangeRateValidation,
      isItemized: yup.boolean().defined(),
      items: yup
        .array()
        .of(
          yup.object({
            id: yup.string().defined(),
            amount: itemMoneyValidation,
            accountId: yup.string().required(messages.itemCategoryRequired),
            description: yup.string().optional(),
          })
        )
        .when('isItemized', {
          is: true,
          then: (schema) => schema.min(1, messages.itemsRequired),
          otherwise: (schema) => schema.optional(),
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
    })
    .test('balanced-transfer', messages.amountsUnbalanced, function (values) {
      const transferValues = values as ICashTransferFormValues;
      if (
        !Number.isFinite(transferValues.amountSent?.amount) ||
        !Number.isFinite(transferValues.amountReceived?.amount)
      ) {
        return true;
      }

      if (
        transferValues.isItemized &&
        transferValues.items.some(
          (item) => !Number.isFinite(item.amount.amount)
        )
      ) {
        return true;
      }

      if (
        cashTransferFormHelpers.isBalanced(transferValues, officialExchangeRate)
      ) {
        return true;
      }

      return this.createError({
        path: 'amountReceived.amount',
        message: messages.amountsUnbalanced,
      });
    });
}

export function useCashTransferFormValidation(
  sourceAccounts: ILedgerAccountDto[],
  destinationAccounts: ILedgerAccountDto[],
  officialExchangeRate?: IExchangeRate
) {
  const { t } = useTranslation<'journal-entries'>('journal-entries');

  return useMemo(
    () =>
      createCashTransferFormValidation(
        sourceAccounts,
        destinationAccounts,
        {
          sourceAccountRequired: t(
            'cash_transfer_source_account_required_text'
          ),
          destinationAccountRequired: t(
            'cash_transfer_destination_account_required_text'
          ),
          accountsDifferent: t('cash_transfer_accounts_different_text'),
          amountSentPositive: t('cash_transfer_amount_sent_positive_text'),
          amountSentRequired: t('cash_transfer_amount_sent_required_text'),
          amountReceivedPositive: t(
            'cash_transfer_amount_received_positive_text'
          ),
          amountReceivedRequired: t(
            'cash_transfer_amount_received_required_text'
          ),
          amountsUnbalanced: t('cash_transfer_amounts_unbalanced_text'),
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
          attachmentSize: t('cash_transaction_attachment_size_text'),
          attachmentType: t('cash_transaction_attachment_type_text'),
        },
        officialExchangeRate
      ),
    [destinationAccounts, officialExchangeRate, sourceAccounts, t]
  );
}
