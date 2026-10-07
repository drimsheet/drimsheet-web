import type {
  ICashTransactionCurrencyContext,
  ICashTransactionFormValues,
} from '@/journal-entries/components/cash-transaction-form';
import type {
  ICashTransferCurrencyContext,
  ICashTransferFormValues,
} from '@/journal-entries/components/cash-transfer-form';
import {
  EExchangeRateType,
  type IExchangeRateDto,
  type IExchangeRateQueryParam,
  type IFileAttachment,
  type IJournalCounterpartyReq,
  type IJournalEntryListDto,
  type IJournalEntryRectificationCounterpartyLineReq,
  type IJournalEntryRectificationLineReq,
  type IJournalLineReq,
  type IPaymentEntryLineReq,
  type IPaymentEntryReq,
  type IPaymentJournalEntryRectificationReq,
  type IReceiptEntryLineReq,
  type IReceiptEntryReq,
  type IReceiptJournalEntryRectificationReq,
  type ITransferEntryLineReq,
  type ITransferEntryReq,
  type ITransferJournalEntryRectificationLineReq,
  type ITransferJournalEntryRectificationReq,
} from '@/shared/lib/api/Api';
import { currencyMapper } from '@/shared/lib/mappers/currency.mapper';
import { moneyMapper } from '@/shared/lib/mappers/money.mapper';

interface IJournalEntryLineMappingInput {
  accountId: string;
  amount: ICashTransactionFormValues['amount'];
  counterparty: ICashTransactionFormValues['counterparty'];
  exchangeRate: IExchangeRateDto | null;
  description: string | null;
  sequenceOrder: number;
}

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

function toExchangeRateQuery(
  currencyContext: ICashTransactionCurrencyContext | undefined,
  functionalCurrencyCode: string
): IExchangeRateQueryParam | undefined {
  if (
    !currencyContext?.currencyCode ||
    !currencyContext.date ||
    !functionalCurrencyCode ||
    currencyContext.currencyCode === functionalCurrencyCode
  ) {
    return undefined;
  }

  return {
    currencyPair: `${currencyContext.currencyCode}/${functionalCurrencyCode}`,
    type: EExchangeRateType.Official,
    asOf: currencyContext.date,
    limit: 1,
  };
}

function toTransferExchangeRateQuery(
  currencyContext: ICashTransferCurrencyContext | undefined
): IExchangeRateQueryParam | undefined {
  if (
    !currencyContext?.sourceCurrencyCode ||
    !currencyContext.destinationCurrencyCode ||
    !currencyContext.date ||
    currencyContext.sourceCurrencyCode ===
      currencyContext.destinationCurrencyCode
  ) {
    return undefined;
  }

  return {
    currencyPair: `${currencyContext.sourceCurrencyCode}/${currencyContext.destinationCurrencyCode}`,
    type: EExchangeRateType.Official,
    asOf: currencyContext.date,
    limit: 1,
  };
}

function toJournalCounterpartyReq(
  value: ICashTransactionFormValues['counterparty']
): IJournalCounterpartyReq {
  const counterparty: IJournalCounterpartyReq = {
    name: value.name,
  };

  if (value.id !== undefined) counterparty.id = value.id;

  if (value.type !== undefined) counterparty.type = value.type;

  return counterparty;
}

function toJournalEntryLineReq({
  accountId,
  amount,
  counterparty,
  exchangeRate,
  description,
  sequenceOrder,
}: IJournalEntryLineMappingInput): IPaymentEntryLineReq & IReceiptEntryLineReq {
  return {
    accountId,
    counterparty: toJournalCounterpartyReq(counterparty),
    amount: moneyMapper.toMoneyDto(
      amount.amount,
      amount.currencyCode,
      amount.isMinorUnit
    ),
    exchangeRate,
    description,
    sequenceOrder,
  };
}

function toPaymentEntryReq(
  values: ICashTransactionFormValues,
  functionalCurrencyCode: string,
  postedAt: string | null,
  attachmentReferences: string[] = []
): IPaymentEntryReq {
  const currencyCode = values.amount.currencyCode;
  const description = values.description.trim() || null;
  let exchangeRate: IExchangeRateDto | null = null;

  if (currencyCode !== functionalCurrencyCode) {
    exchangeRate = currencyMapper.toUserEnteredExchangeRate(
      {
        baseCurrencyCode: currencyCode,
        targetCurrencyCode: functionalCurrencyCode,
        rate: values.exchangeRate?.value ?? null,
        asOf: values.date,
      },
      toEnteredExchangeRatePair(
        currencyCode,
        functionalCurrencyCode,
        values.exchangeRate?.inverted ?? false
      )
    );
  }

  const destinationLines = values.isItemized
    ? values.items.map((item, index) =>
        toJournalEntryLineReq({
          accountId: item.accountId,
          amount: item.amount,
          counterparty: values.counterparty,
          exchangeRate,
          description: item.description.trim() || null,
          sequenceOrder: index + 2,
        })
      )
    : [
        toJournalEntryLineReq({
          accountId: values.categoryId,
          amount: values.amount,
          counterparty: values.counterparty,
          exchangeRate,
          description,
          sequenceOrder: 2,
        }),
      ];

  return {
    attachmentReferences: attachmentReferences.map((reference) => reference),
    sourceLine: toJournalEntryLineReq({
      accountId: values.accountId,
      amount: values.amount,
      counterparty: values.counterparty,
      exchangeRate,
      description,
      sequenceOrder: 1,
    }),
    destinationLines,
    effectiveDate: values.date,
    postedAt,
    memo: description,
  };
}

function toReceiptEntryReq(
  values: ICashTransactionFormValues,
  functionalCurrencyCode: string,
  postedAt: string | null,
  attachmentReferences: string[] = []
): IReceiptEntryReq {
  const currencyCode = values.amount.currencyCode;
  const description = values.description.trim() || null;
  let exchangeRate: IExchangeRateDto | null = null;

  if (currencyCode !== functionalCurrencyCode) {
    exchangeRate = currencyMapper.toUserEnteredExchangeRate(
      {
        baseCurrencyCode: currencyCode,
        targetCurrencyCode: functionalCurrencyCode,
        rate: values.exchangeRate?.value ?? null,
        asOf: values.date,
      },
      toEnteredExchangeRatePair(
        currencyCode,
        functionalCurrencyCode,
        values.exchangeRate?.inverted ?? false
      )
    );
  }

  const sourceLines = values.isItemized
    ? values.items.map((item, index) =>
        toJournalEntryLineReq({
          accountId: item.accountId,
          amount: item.amount,
          counterparty: values.counterparty,
          exchangeRate,
          description: item.description.trim() || null,
          sequenceOrder: index + 1,
        })
      )
    : [
        toJournalEntryLineReq({
          accountId: values.categoryId,
          amount: values.amount,
          counterparty: values.counterparty,
          exchangeRate,
          description,
          sequenceOrder: 1,
        }),
      ];

  return {
    attachmentReferences: attachmentReferences.map((reference) => reference),
    sourceLines,
    destinationLine: toJournalEntryLineReq({
      accountId: values.accountId,
      amount: values.amount,
      counterparty: values.counterparty,
      exchangeRate,
      description,
      sequenceOrder: sourceLines.length + 1,
    }),
    effectiveDate: values.date,
    postedAt,
    memo: description,
  };
}

function toTransferEntryLineReq(
  accountId: string,
  amount: ICashTransferFormValues['amountSent'],
  exchangeRate: IExchangeRateDto | null,
  description: string | null,
  sequenceOrder: number
): ITransferEntryLineReq {
  return {
    accountId,
    amount: moneyMapper.toMoneyDto(
      amount.amount,
      amount.currencyCode,
      amount.isMinorUnit
    ),
    exchangeRate,
    description,
    sequenceOrder,
  };
}

function toTransferChargeLineReq(
  item: ICashTransferFormValues['items'][number],
  exchangeRate: IExchangeRateDto | null,
  sequenceOrder: number
): IJournalLineReq {
  return {
    accountId: item.accountId,
    counterparty: null,
    amount: moneyMapper.toMoneyDto(
      item.amount.amount,
      item.amount.currencyCode,
      item.amount.isMinorUnit
    ),
    exchangeRate,
    description: item.description.trim() || null,
    sequenceOrder,
  };
}

function toTransferEntryReq(
  values: ICashTransferFormValues,
  functionalCurrencyCode: string,
  postedAt: string | null,
  attachmentReferences: string[] = []
): ITransferEntryReq {
  const sourceCurrencyCode = values.amountSent.currencyCode;
  const destinationCurrencyCode = values.amountReceived.currencyCode;
  const description = values.description.trim() || null;
  let sourceExchangeRate: IExchangeRateDto | null = null;
  let destinationExchangeRate: IExchangeRateDto | null = null;

  if (
    sourceCurrencyCode !== destinationCurrencyCode &&
    destinationCurrencyCode === functionalCurrencyCode
  ) {
    sourceExchangeRate = currencyMapper.toUserEnteredExchangeRate(
      {
        baseCurrencyCode: sourceCurrencyCode,
        targetCurrencyCode: functionalCurrencyCode,
        rate: values.exchangeRate?.value ?? null,
        asOf: values.date,
      },
      toEnteredExchangeRatePair(
        sourceCurrencyCode,
        destinationCurrencyCode,
        values.exchangeRate?.inverted ?? false
      )
    );
  }

  if (
    sourceCurrencyCode !== destinationCurrencyCode &&
    sourceCurrencyCode === functionalCurrencyCode
  ) {
    destinationExchangeRate = currencyMapper.toUserEnteredExchangeRate(
      {
        baseCurrencyCode: destinationCurrencyCode,
        targetCurrencyCode: functionalCurrencyCode,
        rate: values.exchangeRate?.value ?? null,
        asOf: values.date,
      },
      toEnteredExchangeRatePair(
        sourceCurrencyCode,
        destinationCurrencyCode,
        values.exchangeRate?.inverted ?? false
      )
    );
  }

  const chargeLines = values.isItemized
    ? values.items.map((item, index) =>
        toTransferChargeLineReq(item, destinationExchangeRate, index + 3)
      )
    : [];

  return {
    attachmentReferences: attachmentReferences.map((reference) => reference),
    sourceLine: toTransferEntryLineReq(
      values.sourceAccountId,
      values.amountSent,
      sourceExchangeRate,
      description,
      1
    ),
    destinationLine: toTransferEntryLineReq(
      values.destinationAccountId,
      values.amountReceived,
      destinationExchangeRate,
      description,
      2
    ),
    chargeLines,
    effectiveDate: values.date,
    postedAt,
    memo: description,
  };
}

function copyAttachments(attachments: IFileAttachment[]) {
  return attachments.map((attachment) => ({
    url: attachment.url,
    name: attachment.name,
    type: attachment.type,
    size: attachment.size,
  }));
}

function toRectificationCounterpartyLine(
  line: IPaymentEntryLineReq & IReceiptEntryLineReq,
  id: string | undefined
): IJournalEntryRectificationCounterpartyLineReq {
  const rectificationLine: IJournalEntryRectificationCounterpartyLineReq = {
    accountId: line.accountId,
    counterparty: {
      id: line.counterparty.id,
      name: line.counterparty.name,
      type: line.counterparty.type,
    },
    amount: {
      amount: line.amount.amount,
      currencyCode: line.amount.currencyCode,
      isMinorUnit: line.amount.isMinorUnit,
    },
    exchangeRate: line.exchangeRate
      ? {
          baseCurrencyCode: line.exchangeRate.baseCurrencyCode,
          targetCurrencyCode: line.exchangeRate.targetCurrencyCode,
          rate: line.exchangeRate.rate,
          type: line.exchangeRate.type,
          asOf: line.exchangeRate.asOf,
          source: line.exchangeRate.source,
        }
      : null,
    description: line.description,
    sequenceOrder: line.sequenceOrder,
  };

  if (id !== undefined) rectificationLine.id = id;

  return rectificationLine;
}

function toTransferRectificationLine(
  line: ITransferEntryLineReq,
  id: string | undefined
): ITransferJournalEntryRectificationLineReq {
  const rectificationLine: ITransferJournalEntryRectificationLineReq = {
    accountId: line.accountId,
    amount: {
      amount: line.amount.amount,
      currencyCode: line.amount.currencyCode,
      isMinorUnit: line.amount.isMinorUnit,
    },
    exchangeRate: line.exchangeRate
      ? {
          baseCurrencyCode: line.exchangeRate.baseCurrencyCode,
          targetCurrencyCode: line.exchangeRate.targetCurrencyCode,
          rate: line.exchangeRate.rate,
          type: line.exchangeRate.type,
          asOf: line.exchangeRate.asOf,
          source: line.exchangeRate.source,
        }
      : null,
    description: line.description,
    sequenceOrder: line.sequenceOrder,
  };

  if (id !== undefined) rectificationLine.id = id;

  return rectificationLine;
}

function toRectificationChargeLine(
  line: IJournalLineReq,
  id: string | undefined
): IJournalEntryRectificationLineReq {
  const rectificationLine: IJournalEntryRectificationLineReq = {
    accountId: line.accountId,
    counterparty: null,
    amount: {
      amount: line.amount.amount,
      currencyCode: line.amount.currencyCode,
      isMinorUnit: line.amount.isMinorUnit,
    },
    exchangeRate: line.exchangeRate
      ? {
          baseCurrencyCode: line.exchangeRate.baseCurrencyCode,
          targetCurrencyCode: line.exchangeRate.targetCurrencyCode,
          rate: line.exchangeRate.rate,
          type: line.exchangeRate.type,
          asOf: line.exchangeRate.asOf,
          source: line.exchangeRate.source,
        }
      : null,
    description: line.description,
    sequenceOrder: line.sequenceOrder,
  };

  if (id !== undefined) rectificationLine.id = id;

  return rectificationLine;
}

function findReusableLineId(
  originalLines: IJournalEntryListDto['lines'],
  accountId: string
) {
  return originalLines.find((line) => line.account.id === accountId)?.id;
}

function resolveRectificationLineId(
  itemId: string | undefined,
  originalIds: ReadonlySet<string>,
  originalLines: IJournalEntryListDto['lines'],
  accountId: string,
  isItemized: boolean
) {
  if (itemId && originalIds.has(itemId)) return itemId;

  if (!isItemized) return findReusableLineId(originalLines, accountId);

  return undefined;
}

function toPaymentJournalEntryRectificationReq(
  values: ICashTransactionFormValues,
  functionalCurrencyCode: string,
  journalEntry: IJournalEntryListDto,
  attachments: IFileAttachment[]
): IPaymentJournalEntryRectificationReq {
  const payment = toPaymentEntryReq(
    values,
    functionalCurrencyCode,
    journalEntry.postedAt ?? journalEntry.createdAt
  );

  const originalLines = [...journalEntry.lines].sort(
    (left, right) => left.sequenceOrder - right.sequenceOrder
  );

  const sourceLine = originalLines[0];
  const destinationLines = originalLines.slice(1);

  const originalDestinationIds = new Set(
    destinationLines.map((line) => line.id)
  );

  return {
    attachments: copyAttachments(attachments),
    effectiveDate: payment.effectiveDate,
    postedAt: payment.postedAt,
    memo: payment.memo,
    sourceType: 'payment',
    sourceLine: toRectificationCounterpartyLine(
      payment.sourceLine,
      sourceLine?.id
    ),
    destinationLines: payment.destinationLines.map((line, index) => {
      const itemId = values.isItemized ? values.items[index]?.id : undefined;

      const id = resolveRectificationLineId(
        itemId,
        originalDestinationIds,
        destinationLines,
        line.accountId,
        values.isItemized
      );

      return toRectificationCounterpartyLine(line, id);
    }),
  };
}

function toReceiptJournalEntryRectificationReq(
  values: ICashTransactionFormValues,
  functionalCurrencyCode: string,
  journalEntry: IJournalEntryListDto,
  attachments: IFileAttachment[]
): IReceiptJournalEntryRectificationReq {
  const receipt = toReceiptEntryReq(
    values,
    functionalCurrencyCode,
    journalEntry.postedAt ?? journalEntry.createdAt
  );

  const originalLines = [...journalEntry.lines].sort(
    (left, right) => left.sequenceOrder - right.sequenceOrder
  );

  const destinationLine = originalLines.at(-1);
  const sourceLines = originalLines.slice(0, -1);
  const originalSourceIds = new Set(sourceLines.map((line) => line.id));

  return {
    attachments: copyAttachments(attachments),
    effectiveDate: receipt.effectiveDate,
    postedAt: receipt.postedAt,
    memo: receipt.memo,
    sourceType: 'receipt',
    sourceLines: receipt.sourceLines.map((line, index) => {
      const itemId = values.isItemized ? values.items[index]?.id : undefined;

      const id = resolveRectificationLineId(
        itemId,
        originalSourceIds,
        sourceLines,
        line.accountId,
        values.isItemized
      );

      return toRectificationCounterpartyLine(line, id);
    }),
    destinationLine: toRectificationCounterpartyLine(
      receipt.destinationLine,
      destinationLine?.id
    ),
  };
}

function toTransferJournalEntryRectificationReq(
  values: ICashTransferFormValues,
  functionalCurrencyCode: string,
  journalEntry: IJournalEntryListDto,
  attachments: IFileAttachment[]
): ITransferJournalEntryRectificationReq {
  const transfer = toTransferEntryReq(
    values,
    functionalCurrencyCode,
    journalEntry.postedAt ?? journalEntry.createdAt
  );

  const originalLines = [...journalEntry.lines].sort(
    (left, right) => left.sequenceOrder - right.sequenceOrder
  );

  const chargeLines = originalLines.slice(2);
  const originalChargeIds = new Set(chargeLines.map((line) => line.id));

  return {
    attachments: copyAttachments(attachments),
    effectiveDate: transfer.effectiveDate,
    postedAt: transfer.postedAt,
    memo: transfer.memo,
    sourceType: 'transfer',
    sourceLine: toTransferRectificationLine(
      transfer.sourceLine,
      originalLines[0]?.id
    ),
    destinationLine: toTransferRectificationLine(
      transfer.destinationLine,
      originalLines[1]?.id
    ),
    chargeLines: transfer.chargeLines.map((line, index) => {
      const itemId = values.items[index]?.id;
      const id = itemId && originalChargeIds.has(itemId) ? itemId : undefined;

      return toRectificationChargeLine(line, id);
    }),
  };
}

export const journalEntryMapper = Object.freeze({
  toExchangeRateQuery,
  toPaymentEntryReq,
  toPaymentJournalEntryRectificationReq,
  toReceiptEntryReq,
  toReceiptJournalEntryRectificationReq,
  toTransferExchangeRateQuery,
  toTransferEntryReq,
  toTransferJournalEntryRectificationReq,
});
