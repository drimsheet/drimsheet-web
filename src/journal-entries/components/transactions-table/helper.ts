import type {
  ICashTransactionDetails,
  ITransactionDetailsCounterparty,
  ITransactionDetailsLine,
  ITransferTransactionDetails,
  UCashTransactionDirection,
  UTransactionDetails,
} from '@/journal-entries/lib/types/transaction-details';
import {
  EJournalEntrySourceType,
  type IExchangeRate,
  type IFileAttachment,
  type IJournalEntryListDto,
  type IJournalLineListDto,
  type IMoneyDto,
  type UJournalEntrySourceType,
} from '@/shared/lib/api/Api';
import type {
  ITransactionsTableRow,
  UTransactionsTableDirection,
} from './types';

interface ICreateRowInput {
  entry: IJournalEntryListDto;
}

interface ICreateRowsInput {
  entries: IJournalEntryListDto[];
}

const transactionSourceTypes: Set<string> = new Set([
  EJournalEntrySourceType.Payment,
  EJournalEntrySourceType.Receipt,
  EJournalEntrySourceType.Transfer,
]);

function isTransactionSourceType(
  sourceType: UJournalEntrySourceType
): sourceType is UTransactionsTableDirection {
  return transactionSourceTypes.has(sourceType);
}

function isCashTransactionSourceType(
  sourceType: UJournalEntrySourceType
): sourceType is UCashTransactionDirection {
  return (
    sourceType === EJournalEntrySourceType.Payment ||
    sourceType === EJournalEntrySourceType.Receipt
  );
}

function sortLines(lines: readonly IJournalLineListDto[]) {
  return [...lines].sort(
    (left, right) => left.sequenceOrder - right.sequenceOrder
  );
}

function getRowCashLine(
  lines: readonly IJournalLineListDto[],
  sourceType: UTransactionsTableDirection
) {
  if (sourceType === EJournalEntrySourceType.Receipt) return lines.at(-1);

  return lines.at(0);
}

function getRowCategoryLines(
  lines: readonly IJournalLineListDto[],
  sourceType: UTransactionsTableDirection
) {
  if (sourceType === EJournalEntrySourceType.Receipt) return lines.slice(0, -1);

  if (sourceType === EJournalEntrySourceType.Payment) return lines.slice(1);

  return [];
}

function toMoney(value: IMoneyDto): IMoneyDto {
  return {
    amount: value.amount,
    currencyCode: value.currencyCode,
    isMinorUnit: value.isMinorUnit,
  };
}

function toExchangeRate(value: IExchangeRate | null): IExchangeRate | null {
  if (!value) return null;

  return {
    asOf: value.asOf,
    baseCurrencyCode: value.baseCurrencyCode,
    createdAt: value.createdAt,
    currencyPair: value.currencyPair,
    rate: value.rate,
    source: value.source,
    targetCurrencyCode: value.targetCurrencyCode,
    type: value.type,
  };
}

function toAttachment(value: IFileAttachment): IFileAttachment {
  return {
    name: value.name,
    size: value.size,
    type: value.type,
    url: value.url,
  };
}

function toDetailsLine(line: IJournalLineListDto): ITransactionDetailsLine {
  return {
    accountId: line.account.id,
    accountName: line.account.name,
    amount: toMoney(line.amount),
    description: line.description,
    id: line.id,
  };
}

function getCounterparties(
  lines: readonly IJournalLineListDto[]
): ITransactionDetailsCounterparty[] {
  return Array.from(
    new Map(
      lines.flatMap((line) =>
        line.counterparty
          ? [
              [
                line.counterparty.id,
                {
                  id: line.counterparty.id,
                  name: line.counterparty.name,
                },
              ] as const,
            ]
          : []
      )
    ).values()
  );
}

function createCashDetails(
  entry: IJournalEntryListDto,
  lines: readonly IJournalLineListDto[]
): ICashTransactionDetails | undefined {
  if (!isCashTransactionSourceType(entry.sourceType)) return undefined;

  const cashLine = getRowCashLine(lines, entry.sourceType);
  const categoryLines = getRowCategoryLines(lines, entry.sourceType);

  if (!cashLine || categoryLines.length === 0) return undefined;

  return {
    amount: toMoney(cashLine.amount),
    attachments: entry.attachments.map(toAttachment),
    cashAccountName: cashLine.account.name,
    categories: categoryLines.map(toDetailsLine),
    counterparties: getCounterparties(lines),
    direction: entry.sourceType,
    effectiveDate: entry.effectiveDate,
    exchangeRate: toExchangeRate(cashLine.exchangeRate),
    functionalAmount: toMoney(cashLine.functionalAmount),
    kind: 'cash',
    memo: entry.memo,
  };
}

function createTransferDetails(
  entry: IJournalEntryListDto,
  lines: readonly IJournalLineListDto[]
): ITransferTransactionDetails | undefined {
  if (entry.sourceType !== EJournalEntrySourceType.Transfer) return undefined;

  const sourceLine = lines.at(0);
  const destinationLine = lines.at(1);

  if (!sourceLine || !destinationLine) return undefined;

  return {
    attachments: entry.attachments.map(toAttachment),
    destinationAccountName: destinationLine.account.name,
    destinationAmount: toMoney(destinationLine.amount),
    direction: entry.sourceType,
    effectiveDate: entry.effectiveDate,
    exchangeRate: toExchangeRate(
      sourceLine.exchangeRate ?? destinationLine.exchangeRate
    ),
    fees: lines.slice(2).map(toDetailsLine),
    kind: 'transfer',
    memo: entry.memo,
    sourceAccountName: sourceLine.account.name,
    sourceAmount: toMoney(sourceLine.amount),
  };
}

function createDetails(
  entry: IJournalEntryListDto
): UTransactionDetails | undefined {
  if (!isTransactionSourceType(entry.sourceType)) return undefined;

  const lines = sortLines(entry.lines);

  if (entry.sourceType === EJournalEntrySourceType.Transfer) {
    return createTransferDetails(entry, lines);
  }

  return createCashDetails(entry, lines);
}

function createRow({
  entry,
}: ICreateRowInput): ITransactionsTableRow | undefined {
  const details = createDetails(entry);

  if (!details) return undefined;

  if (details.kind === 'transfer') {
    return {
      id: entry.id,
      action: null,
      accountName: details.sourceAccountName,
      additionalCategoryCount: 0,
      additionalCounterpartyCount: 0,
      amount: details.sourceAmount,
      destinationAccountName: details.destinationAccountName,
      direction: details.direction,
      effectiveDate: details.effectiveDate,
      entry,
      sourceAccountName: details.sourceAccountName,
      summary: null,
    };
  }

  const categories = Array.from(
    new Map(
      details.categories.map((line) => [line.accountId, line.accountName])
    ).values()
  );

  return {
    id: entry.id,
    action: null,
    accountName: details.cashAccountName,
    additionalCategoryCount: Math.max(categories.length - 1, 0),
    additionalCounterpartyCount: Math.max(details.counterparties.length - 1, 0),
    amount: details.amount,
    direction: details.direction,
    effectiveDate: details.effectiveDate,
    entry,
    firstCategoryName: categories.at(0),
    firstCounterpartyName: details.counterparties.at(0)?.name,
    summary: null,
  };
}

function createRows({ entries }: ICreateRowsInput) {
  return entries.flatMap((entry) => {
    const row = createRow({ entry });

    return row ? [row] : [];
  });
}

const transactionsTableHelpers = Object.freeze({
  createDetails,
  createRows,
});

export default transactionsTableHelpers;
