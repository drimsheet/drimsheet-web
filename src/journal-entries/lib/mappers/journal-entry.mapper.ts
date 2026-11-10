import type {
  ICashTransactionCurrencyContext,
  ICashTransactionFormValues,
} from '@/journal-entries/components/cash-transaction-form';
import type {
  ICashTransferCurrencyContext,
  ICashTransferFormValues,
} from '@/journal-entries/components/cash-transfer-form';
import type {
  UPaymentRectificationRequest,
  UReceiptRectificationRequest,
  UTransferRectificationRequest,
} from '@/journal-entries/lib/types/journal-entry-rectification.types';
import {
  EJournalEntryEditAction,
  journalEntryEdit,
} from '@/journal-entries/lib/utils/journal-entry-edit';
import {
  EExchangeRateType,
  type IExchangeRateDto,
  type IExchangeRateQueryParam,
  type IJournalEntryAttachmentsUpdateReq,
  type IJournalEntryListDto,
  type IJournalEntryMetaUpdateReq,
  type IJournalLineReq,
  type IPaymentEntryLineReq,
  type IPaymentEntryReq,
  type IReceiptEntryLineReq,
  type IReceiptEntryReq,
  type ITransferEntryLineReq,
  type ITransferEntryReq,
  type IUpdateDraftPaymentLineReq,
  type IUpdateDraftPaymentReq,
  type IUpdateDraftReceiptReq,
  type IUpdateDraftTransferAssetLineReq,
  type IUpdateDraftTransferReq,
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
    counterpartyId: counterparty.id,
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
  attachmentReferences?: string[]
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

  const request: IPaymentEntryReq = {
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

  if (attachmentReferences !== undefined) {
    request.attachmentReferences = attachmentReferences.slice();
  }

  return request;
}

function toReceiptEntryReq(
  values: ICashTransactionFormValues,
  functionalCurrencyCode: string,
  postedAt: string | null,
  attachmentReferences?: string[]
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

  const request: IReceiptEntryReq = {
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

  if (attachmentReferences !== undefined) {
    request.attachmentReferences = attachmentReferences.slice();
  }

  return request;
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
    counterpartyId: null,
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
  attachmentReferences?: string[]
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

  const request: ITransferEntryReq = {
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

  if (attachmentReferences !== undefined) {
    request.attachmentReferences = attachmentReferences.slice();
  }

  return request;
}

function toDraftCounterpartyLine(
  line: IPaymentEntryLineReq | IReceiptEntryLineReq,
  id: string | undefined,
  description?: string | null
): IUpdateDraftPaymentLineReq {
  const patch: IUpdateDraftPaymentLineReq = {
    accountId: line.accountId,
    counterpartyId: line.counterpartyId,
    amount: moneyMapper.toMoneyDto(
      line.amount.amount,
      line.amount.currencyCode,
      line.amount.isMinorUnit
    ),
    exchangeRate: copyExchangeRate(line.exchangeRate),
    description,
    sequenceOrder: line.sequenceOrder,
  };

  if (id !== undefined) {
    patch.id = id;
  }

  return patch;
}

function copyExchangeRate(
  rate: IExchangeRateDto | null
): IExchangeRateDto | null {
  return (
    rate && {
      baseCurrencyCode: rate.baseCurrencyCode,
      targetCurrencyCode: rate.targetCurrencyCode,
      rate: rate.rate,
      type: rate.type,
      asOf: rate.asOf,
      source: rate.source,
    }
  );
}

function toDraftAssetLine(
  line: ITransferEntryLineReq,
  id: string | undefined,
  description?: string | null
): IUpdateDraftTransferAssetLineReq {
  const patch: IUpdateDraftTransferAssetLineReq = {
    accountId: line.accountId,
    amount: moneyMapper.toMoneyDto(
      line.amount.amount,
      line.amount.currencyCode,
      line.amount.isMinorUnit
    ),
    exchangeRate: copyExchangeRate(line.exchangeRate),
    description,
    sequenceOrder: line.sequenceOrder,
  };

  if (id !== undefined) {
    patch.id = id;
  }

  return patch;
}

function findCategoryLineId(
  values: ICashTransactionFormValues,
  originalLines: IJournalEntryListDto['lines'],
  index: number
) {
  // TODO: Carry line identity across a switch between single and itemized editing.
  if (!values.isItemized) {
    return originalLines.length === 1 ? originalLines[0].id : undefined;
  }

  return originalLines.find((line) => line.id === values.items[index]?.id)?.id;
}

function toReplacementAttachmentReferences(
  savedAttachments: IJournalEntryListDto['attachments'],
  uploadedReferences: string[]
): string[] {
  const references = savedAttachments.map(({ url }) => url);

  return references.concat(uploadedReferences);
}

function toAttachmentsUpdateReq(
  entry: IJournalEntryListDto,
  savedAttachments: IJournalEntryListDto['attachments'],
  uploadedReferences: string[]
): IJournalEntryAttachmentsUpdateReq | undefined {
  const removedUrls = journalEntryEdit.getRemovedAttachmentUrls(
    entry,
    savedAttachments
  );

  if (!uploadedReferences.length && !removedUrls.length) {
    return undefined;
  }

  const request: IJournalEntryAttachmentsUpdateReq = {};
  if (uploadedReferences.length > 0) {
    request.add = uploadedReferences.slice();
  }

  if (removedUrls.length) {
    request.remove = removedUrls;
  }

  return request;
}

function toUpdateDraftPaymentReq(
  values: ICashTransactionFormValues,
  functionalCurrencyCode: string,
  journalEntry: IJournalEntryListDto,
  uploadedReferences: string[]
): IUpdateDraftPaymentReq {
  const payment = toPaymentEntryReq(values, functionalCurrencyCode, null);

  const [sourceLine, ...destinationLines] = [...journalEntry.lines].sort(
    (left, right) => left.sequenceOrder - right.sequenceOrder
  );

  const request: IUpdateDraftPaymentReq = {
    effectiveDate: payment.effectiveDate,
    memo: payment.memo,
    sourceLine: toDraftCounterpartyLine(payment.sourceLine, sourceLine?.id),
    destinationLines: payment.destinationLines.map((line, index) =>
      toDraftCounterpartyLine(
        line,
        findCategoryLineId(values, destinationLines, index),
        values.isItemized ? line.description : undefined
      )
    ),
  };

  const attachments = toAttachmentsUpdateReq(
    journalEntry,
    journalEntryEdit.getSavedAttachments(values),
    uploadedReferences
  );

  if (attachments) {
    request.attachments = attachments;
  }

  return request;
}

function toUpdateDraftReceiptReq(
  values: ICashTransactionFormValues,
  functionalCurrencyCode: string,
  journalEntry: IJournalEntryListDto,
  uploadedReferences: string[]
): IUpdateDraftReceiptReq {
  const receipt = toReceiptEntryReq(values, functionalCurrencyCode, null);

  const originalLines = [...journalEntry.lines].sort(
    (left, right) => left.sequenceOrder - right.sequenceOrder
  );

  const sourceLines = originalLines.slice(0, -1);
  const destinationLine = originalLines.at(-1);

  const request: IUpdateDraftReceiptReq = {
    effectiveDate: receipt.effectiveDate,
    memo: receipt.memo,
    sourceLines: receipt.sourceLines.map((line, index) =>
      toDraftCounterpartyLine(
        line,
        findCategoryLineId(values, sourceLines, index),
        values.isItemized ? line.description : undefined
      )
    ),
    destinationLine: toDraftCounterpartyLine(
      receipt.destinationLine,
      destinationLine?.id
    ),
  };

  const attachments = toAttachmentsUpdateReq(
    journalEntry,
    journalEntryEdit.getSavedAttachments(values),
    uploadedReferences
  );

  if (attachments) {
    request.attachments = attachments;
  }

  return request;
}

function toUpdateDraftTransferReq(
  values: ICashTransferFormValues,
  functionalCurrencyCode: string,
  journalEntry: IJournalEntryListDto,
  uploadedReferences: string[]
): IUpdateDraftTransferReq {
  const transfer = toTransferEntryReq(values, functionalCurrencyCode, null);

  const [sourceLine, destinationLine, ...chargeLines] = [
    ...journalEntry.lines,
  ].sort((left, right) => left.sequenceOrder - right.sequenceOrder);

  const request: IUpdateDraftTransferReq = {
    effectiveDate: transfer.effectiveDate,
    memo: transfer.memo,
    sourceLine: toDraftAssetLine(transfer.sourceLine, sourceLine?.id),
    destinationLine: toDraftAssetLine(
      transfer.destinationLine,
      destinationLine?.id
    ),
    chargeLines: transfer.chargeLines.map((line, index) =>
      // TODO: Expose counterparties on transfer charge lines in the editor.
      toDraftAssetLine(
        line,
        chargeLines.find((original) => original.id === values.items[index]?.id)
          ?.id,
        line.description
      )
    ),
  };

  const attachments = toAttachmentsUpdateReq(
    journalEntry,
    journalEntryEdit.getSavedAttachments(values),
    uploadedReferences
  );

  if (attachments) {
    request.attachments = attachments;
  }

  return request;
}

function toMetaUpdateReq(
  entry: IJournalEntryListDto,
  values: ICashTransactionFormValues | ICashTransferFormValues,
  uploadedReferences: string[]
): IJournalEntryMetaUpdateReq {
  const memo = journalEntryEdit.getChangedMemo(entry, values.description);

  const lines = journalEntryEdit
    .getChangedDescriptions(entry, values)
    .map((item) => ({
      id: item.id,
      description: item.description.trim() || null,
    }));

  const request: IJournalEntryMetaUpdateReq = {};

  const attachments = toAttachmentsUpdateReq(
    entry,
    journalEntryEdit.getSavedAttachments(values),
    uploadedReferences
  );

  if (attachments) {
    request.attachments = attachments;
  }

  if (memo !== undefined) {
    request.header = { memo };
  }

  if (lines.length > 0) {
    request.lines = lines;
  }

  return request;
}

function toPaymentRectificationRequest(
  entry: IJournalEntryListDto,
  initialValues: ICashTransactionFormValues,
  values: ICashTransactionFormValues,
  functionalCurrencyCode: string,
  uploadedReferences: string[] = []
): UPaymentRectificationRequest | undefined {
  switch (journalEntryEdit.getAction(entry, initialValues, values)) {
    case EJournalEntryEditAction.UpdateDraft:
      return {
        action: EJournalEntryEditAction.UpdateDraft,
        payload: toUpdateDraftPaymentReq(
          values,
          functionalCurrencyCode,
          entry,
          uploadedReferences
        ),
      };
    case EJournalEntryEditAction.UpdateMeta:
      return {
        action: EJournalEntryEditAction.UpdateMeta,
        payload: toMetaUpdateReq(entry, values, uploadedReferences),
      };
    case EJournalEntryEditAction.VoidAndReplace:
      return {
        action: EJournalEntryEditAction.VoidAndReplace,
        payload: toPaymentEntryReq(
          values,
          functionalCurrencyCode,
          entry.postedAt,
          toReplacementAttachmentReferences(
            journalEntryEdit.getSavedAttachments(values),
            uploadedReferences
          )
        ),
      };
    default:
      return undefined;
  }
}

function toReceiptRectificationRequest(
  entry: IJournalEntryListDto,
  initialValues: ICashTransactionFormValues,
  values: ICashTransactionFormValues,
  functionalCurrencyCode: string,
  uploadedReferences: string[] = []
): UReceiptRectificationRequest | undefined {
  switch (journalEntryEdit.getAction(entry, initialValues, values)) {
    case EJournalEntryEditAction.UpdateDraft:
      return {
        action: EJournalEntryEditAction.UpdateDraft,
        payload: toUpdateDraftReceiptReq(
          values,
          functionalCurrencyCode,
          entry,
          uploadedReferences
        ),
      };
    case EJournalEntryEditAction.UpdateMeta:
      return {
        action: EJournalEntryEditAction.UpdateMeta,
        payload: toMetaUpdateReq(entry, values, uploadedReferences),
      };
    case EJournalEntryEditAction.VoidAndReplace:
      return {
        action: EJournalEntryEditAction.VoidAndReplace,
        payload: toReceiptEntryReq(
          values,
          functionalCurrencyCode,
          entry.postedAt,
          toReplacementAttachmentReferences(
            journalEntryEdit.getSavedAttachments(values),
            uploadedReferences
          )
        ),
      };
    default:
      return undefined;
  }
}

function toTransferRectificationRequest(
  entry: IJournalEntryListDto,
  initialValues: ICashTransferFormValues,
  values: ICashTransferFormValues,
  functionalCurrencyCode: string,
  uploadedReferences: string[] = []
): UTransferRectificationRequest | undefined {
  switch (journalEntryEdit.getAction(entry, initialValues, values)) {
    case EJournalEntryEditAction.UpdateDraft:
      return {
        action: EJournalEntryEditAction.UpdateDraft,
        payload: toUpdateDraftTransferReq(
          values,
          functionalCurrencyCode,
          entry,
          uploadedReferences
        ),
      };
    case EJournalEntryEditAction.UpdateMeta:
      return {
        action: EJournalEntryEditAction.UpdateMeta,
        payload: toMetaUpdateReq(entry, values, uploadedReferences),
      };
    case EJournalEntryEditAction.VoidAndReplace:
      return {
        action: EJournalEntryEditAction.VoidAndReplace,
        payload: toTransferEntryReq(
          values,
          functionalCurrencyCode,
          entry.postedAt,
          toReplacementAttachmentReferences(
            journalEntryEdit.getSavedAttachments(values),
            uploadedReferences
          )
        ),
      };
    default:
      return undefined;
  }
}

export const journalEntryMapper = Object.freeze({
  toExchangeRateQuery,
  toPaymentEntryReq,
  toPaymentRectificationRequest,
  toReceiptEntryReq,
  toReceiptRectificationRequest,
  toTransferExchangeRateQuery,
  toTransferEntryReq,
  toTransferRectificationRequest,
});
