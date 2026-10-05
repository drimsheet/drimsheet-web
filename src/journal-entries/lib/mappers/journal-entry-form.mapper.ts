import type { ICashTransactionFormValues } from '@/journal-entries/components/cash-transaction-form';
import type { ICashTransferFormInitialValues } from '@/journal-entries/components/cash-transfer-form';
import {
  EJournalEntrySourceType,
  type IExchangeRate,
  type IJournalEntryListDto,
  type IJournalLineListDto,
} from '@/shared/lib/api/Api';
import { dateUtils } from '@/shared/lib/utils/date';

function sortLines(lines: IJournalLineListDto[]) {
  return [...lines].sort(
    (left, right) => left.sequenceOrder - right.sequenceOrder
  );
}

function toExchangeRateValue(
  exchangeRate: IExchangeRate | null,
  baseCurrencyCode: string,
  targetCurrencyCode: string
) {
  if (!exchangeRate || baseCurrencyCode === targetCurrencyCode) return null;

  return {
    value: exchangeRate.rate,
    inverted:
      exchangeRate.baseCurrencyCode === targetCurrencyCode &&
      exchangeRate.targetCurrencyCode === baseCurrencyCode,
  };
}

function toCashTransactionFormValues(
  journalEntry: IJournalEntryListDto,
  functionalCurrencyCode: string
): ICashTransactionFormValues {
  const lines = sortLines(journalEntry.lines);
  const isReceipt = journalEntry.sourceType === EJournalEntrySourceType.Receipt;
  const cashLine = isReceipt ? lines.at(-1) : lines[0];
  const categoryLines = isReceipt ? lines.slice(0, -1) : lines.slice(1);
  const firstCategoryLine = categoryLines[0];

  if (!cashLine || !firstCategoryLine) {
    throw new Error(`Journal entry ${journalEntry.id} has incomplete lines`);
  }

  const exchangeRate =
    cashLine.exchangeRate ?? firstCategoryLine.exchangeRate ?? null;

  const counterparty =
    lines.find((line) => line.counterparty)?.counterparty ?? null;

  const isItemized = categoryLines.length > 1;

  return {
    accountId: cashLine.account.id,
    categoryId: firstCategoryLine.account.id,
    amount: {
      amount: cashLine.amount.amount,
      currencyCode: cashLine.amount.currencyCode,
      isMinorUnit: cashLine.amount.isMinorUnit,
    },
    date: dateUtils.formatDateForApi(journalEntry.effectiveDate),
    exchangeRate: toExchangeRateValue(
      exchangeRate,
      cashLine.amount.currencyCode,
      functionalCurrencyCode
    ),
    isItemized,
    items: isItemized
      ? categoryLines.map((line) => ({
          id: line.id,
          amount: {
            amount: line.amount.amount,
            currencyCode: line.amount.currencyCode,
            isMinorUnit: line.amount.isMinorUnit,
          },
          accountId: line.account.id,
          description: line.description ?? '',
        }))
      : [],
    counterparty: {
      id: counterparty?.id,
      name: counterparty?.name ?? '',
    },
    description: journalEntry.memo ?? '',
    attachment: null,
  };
}

function toCashTransferFormValues(
  journalEntry: IJournalEntryListDto
): ICashTransferFormInitialValues {
  const lines = sortLines(journalEntry.lines);
  const sourceLine = lines[0];
  const destinationLine = lines[1];
  const chargeLines = lines.slice(2);

  if (!sourceLine || !destinationLine) {
    throw new Error(`Journal entry ${journalEntry.id} has incomplete lines`);
  }

  const exchangeRate =
    sourceLine.exchangeRate ?? destinationLine.exchangeRate ?? null;

  return {
    sourceAccountId: sourceLine.account.id,
    destinationAccountId: destinationLine.account.id,
    amountSent: {
      amount: sourceLine.amount.amount,
      currencyCode: sourceLine.amount.currencyCode,
      isMinorUnit: sourceLine.amount.isMinorUnit,
    },
    amountReceived: {
      amount: destinationLine.amount.amount,
      currencyCode: destinationLine.amount.currencyCode,
      isMinorUnit: destinationLine.amount.isMinorUnit,
    },
    date: dateUtils.formatDateForApi(journalEntry.effectiveDate),
    exchangeRate: toExchangeRateValue(
      exchangeRate,
      sourceLine.amount.currencyCode,
      destinationLine.amount.currencyCode
    ),
    isItemized: chargeLines.length > 0,
    items: chargeLines.map((line) => ({
      id: line.id,
      amount: {
        amount: line.amount.amount,
        currencyCode: line.amount.currencyCode,
        isMinorUnit: line.amount.isMinorUnit,
      },
      accountId: line.account.id,
      description: line.description ?? '',
    })),
    description: journalEntry.memo ?? '',
    attachment: null,
  };
}

export const journalEntryFormMapper = Object.freeze({
  toCashTransactionFormValues,
  toCashTransferFormValues,
});
