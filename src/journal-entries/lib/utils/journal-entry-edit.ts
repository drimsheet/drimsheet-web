import type { ICashTransactionFormValues } from '@/journal-entries/components/cash-transaction-form';
import type { ICashTransferFormValues } from '@/journal-entries/components/cash-transfer-form';
import {
  EJournalEntryStatus,
  type IJournalEntryListDto,
} from '@/shared/lib/api/Api';
import { isEqual } from 'lodash';

export const EJournalEntryEditAction = {
  UpdateDraft: 'updateDraft',
  UpdateMeta: 'updateMeta',
  VoidAndReplace: 'voidAndReplace',
} as const;

export type UJournalEntryEditAction =
  (typeof EJournalEntryEditAction)[keyof typeof EJournalEntryEditAction];

type TEditValues = ICashTransactionFormValues | ICashTransferFormValues;

function getChangedMemo(entry: IJournalEntryListDto, description: string) {
  const memo = description.trim() || null;

  return memo === (entry.memo?.trim() || null) ? undefined : memo;
}

function getChangedDescriptions(
  entry: IJournalEntryListDto,
  values: TEditValues
) {
  if (!values.isItemized) {
    return [];
  }

  return values.items.filter((item) => {
    const line = entry.lines.find(({ id }) => id === item.id);

    return (
      line &&
      (line.description?.trim() || null) !== (item.description.trim() || null)
    );
  });
}

function getFinancialFields(values: TEditValues) {
  const items = values.isItemized
    ? values.items.map(({ id, accountId, amount }) => ({
        id,
        accountId,
        amount,
      }))
    : [];

  const common = {
    date: values.date,
    items,
  };

  if ('accountId' in values) {
    return {
      ...common,
      accountId: values.accountId,
      categoryId: values.isItemized ? undefined : values.categoryId,
      counterpartyId: values.counterparty.id,
      amount: values.amount,
    };
  }

  return {
    ...common,
    sourceAccountId: values.sourceAccountId,
    destinationAccountId: values.destinationAccountId,
    amountSent: values.amountSent,
    amountReceived: values.amountReceived,
  };
}

function toCanonicalRate(rate: TEditValues['exchangeRate']) {
  if (!rate) {
    return null;
  }

  return rate.inverted ? 1 / rate.value : rate.value;
}

function hasSameExchangeRate(
  initial: TEditValues['exchangeRate'],
  edited: TEditValues['exchangeRate']
) {
  const initialRate = toCanonicalRate(initial);
  const editedRate = toCanonicalRate(edited);

  if (initialRate === editedRate) {
    return true;
  }

  // Taking a reciprocal twice can introduce floating-point roundoff.
  return (
    initialRate !== null &&
    editedRate !== null &&
    Math.abs(initialRate - editedRate) <=
      Number.EPSILON * Math.max(Math.abs(initialRate), Math.abs(editedRate))
  );
}

function getSavedAttachments(values: TEditValues) {
  return values.attachments.filter((attachment) => 'url' in attachment);
}

function getRemovedAttachmentUrls(
  entry: IJournalEntryListDto,
  savedAttachments: IJournalEntryListDto['attachments']
) {
  return entry.attachments
    .filter(
      ({ url }) =>
        !savedAttachments.some((attachment) => attachment.url === url)
    )
    .map(({ url }) => url);
}

function getAction(
  entry: IJournalEntryListDto,
  initialValues: TEditValues,
  values: TEditValues
): UJournalEntryEditAction | undefined {
  // TODO: Recognize equivalent single and itemized representations of one line.
  const financialChanged =
    !hasSameExchangeRate(initialValues.exchangeRate, values.exchangeRate) ||
    !isEqual(getFinancialFields(initialValues), getFinancialFields(values));

  const hasNewFiles = values.attachments.some(
    (attachment) => attachment instanceof File
  );

  const metadataChanged =
    getChangedMemo(entry, values.description) !== undefined ||
    getChangedDescriptions(entry, values).length > 0 ||
    hasNewFiles ||
    getRemovedAttachmentUrls(entry, getSavedAttachments(values)).length > 0;

  if (!financialChanged && !metadataChanged) {
    return undefined;
  }

  if (entry.status === EJournalEntryStatus.Draft) {
    return EJournalEntryEditAction.UpdateDraft;
  }

  return financialChanged
    ? EJournalEntryEditAction.VoidAndReplace
    : EJournalEntryEditAction.UpdateMeta;
}

export const journalEntryEdit = Object.freeze({
  getAction,
  getChangedMemo,
  getChangedDescriptions,
  getRemovedAttachmentUrls,
  getSavedAttachments,
});
