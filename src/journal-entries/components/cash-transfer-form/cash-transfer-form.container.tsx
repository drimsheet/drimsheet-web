import { usePermittedPostingAccounts } from '@/account/hooks/use-permitted-posting-accounts';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { useCreateTransfer } from '@/journal-entries/hooks/use-create-transfer';
import { useRectifyTransfer } from '@/journal-entries/hooks/use-rectify-transfer';
import { journalEntryFormMapper } from '@/journal-entries/lib/mappers/journal-entry-form.mapper';
import { journalEntryMapper } from '@/journal-entries/lib/mappers/journal-entry.mapper';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useExchangeRates } from '@/shared/hooks/use-exchange-rates';
import { useUploadFile } from '@/shared/hooks/use-upload-file';
import {
  EAssetSubType,
  EJournalEntrySourceType,
  EJournalEntryStatus,
} from '@/shared/lib/api/Api';
import type { IReactQueryOptions } from '@/shared/types/query-options.types';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CashTransferForm } from './cash-transfer-form';
import { CashTransferFormSkeleton } from './state';
import type {
  CashTransferFormContainerProps,
  ICashTransferCurrencyContext,
  ICashTransferFormValues,
} from './types';

const requiredQueryOptions: IReactQueryOptions = {
  throwOnError: true,
};

export function CashTransferFormContainer({
  journalEntry,
  initialValues: creationInitialValues,
  restoring = false,
  onAddAccount,
  onAddCategory,
  initialEditItemId,
  onSuccess,
}: Readonly<CashTransferFormContainerProps>) {
  const { t } = useTranslation<'journal-entries'>('journal-entries');

  const [currencyContext, setCurrencyContext] =
    useState<ICashTransferCurrencyContext>();

  const [submissionIntent, setSubmissionIntent] = useState<
    'submit' | 'draft'
  >();

  const handleApiError = useApiErrorHandler();

  const { data: permittedSources, isPending: isSourcesPending } =
    usePermittedPostingAccounts({
      sourceType: EJournalEntrySourceType.Transfer,
      side: 'source',
      limit: 100,
      ...requiredQueryOptions,
    });

  const { data: permittedDestinations, isPending: isDestinationsPending } =
    usePermittedPostingAccounts({
      sourceType: EJournalEntrySourceType.Transfer,
      side: 'destination',
      limit: 100,
      ...requiredQueryOptions,
    });

  const { data: accountingEntity, isPending: isAccountingEntityPending } =
    useAccountingEntity(requiredQueryOptions);

  const functionalCurrencyCode = accountingEntity?.functionalCurrencyCode ?? '';

  const exchangeRateQuery =
    journalEntryMapper.toTransferExchangeRateQuery(currencyContext);

  const { data: officialExchangeRates } = useExchangeRates(exchangeRateQuery);
  const { mutateAsync: createTransfer } = useCreateTransfer();
  const { mutateAsync: rectifyTransfer } = useRectifyTransfer();
  const { mutateAsync: uploadFile } = useUploadFile();

  const editInitialValues = useMemo(
    () =>
      journalEntry
        ? journalEntryFormMapper.toCashTransferFormValues(journalEntry)
        : undefined,
    [journalEntry]
  );

  const isDraft = journalEntry?.status === EJournalEntryStatus.Draft;

  const isFormDataPending =
    isSourcesPending || isDestinationsPending || isAccountingEntityPending;

  const permittedDestinationAccounts = permittedDestinations?.data ?? [];

  const destinationAccounts = permittedDestinationAccounts.filter(
    (account) => account.subType === EAssetSubType.CashAndCashEquivalent
  );

  const categories = permittedDestinationAccounts.filter(
    (account) => account.subType !== EAssetSubType.CashAndCashEquivalent
  );

  const uploadAttachments = (values: ICashTransferFormValues) =>
    Promise.all(
      values.attachments
        .filter((attachment) => attachment instanceof File)
        .map((file) => uploadFile(file))
    );

  const createEntry = (
    values: ICashTransferFormValues,
    postedAt: string | null,
    attachmentReferences: string[]
  ) =>
    createTransfer(
      journalEntryMapper.toTransferEntryReq(
        values,
        functionalCurrencyCode,
        postedAt,
        attachmentReferences
      )
    );

  const handleCreate = async (values: ICashTransferFormValues) => {
    const attachmentReferences = await uploadAttachments(values);
    await createEntry(values, new Date().toISOString(), attachmentReferences);
    toast.success(t('transfer_created_success_text'));
    await onSuccess();
  };

  const handleCreateDraft = async (values: ICashTransferFormValues) => {
    if (submissionIntent) {
      return;
    }

    setSubmissionIntent('draft');

    try {
      const attachmentReferences = await uploadAttachments(values);
      await createEntry(values, null, attachmentReferences);
      toast.success(t('journal_entry_draft_saved_success_text'));
      await onSuccess();
    } catch (error) {
      handleApiError(error, { showToast: true });
    } finally {
      setSubmissionIntent(undefined);
    }
  };

  const handleRectify = async (values: ICashTransferFormValues) => {
    if (!journalEntry || !editInitialValues) {
      return;
    }

    const attachmentReferences = await uploadAttachments(values);

    const request = journalEntryMapper.toTransferRectificationRequest(
      journalEntry,
      editInitialValues,
      values,
      functionalCurrencyCode,
      attachmentReferences
    );

    if (!request) {
      toast.info(t('journal_entry_no_changes_text'));

      return;
    }

    await rectifyTransfer({ id: journalEntry.id, request });

    const successMessage = isDraft
      ? t('journal_entry_draft_saved_success_text')
      : t('journal_entry_updated_success_text');

    toast.success(successMessage);
    await onSuccess();
  };

  const handleSubmit = async (values: ICashTransferFormValues) => {
    if (submissionIntent) {
      return;
    }

    setSubmissionIntent('submit');

    try {
      if (journalEntry) {
        await handleRectify(values);
      } else {
        await handleCreate(values);
      }
    } catch (error) {
      handleApiError(error, { showToast: true });
    } finally {
      setSubmissionIntent(undefined);
    }
  };

  if (isFormDataPending || restoring) {
    return <CashTransferFormSkeleton />;
  }

  const getEditSubmitLabel = () => {
    if (!journalEntry) {
      return undefined;
    }

    return isDraft
      ? t('cash_transaction_save_draft_text')
      : t('journal_entry_update_text');
  };

  return (
    <CashTransferForm
      sourceAccounts={permittedSources?.data ?? []}
      destinationAccounts={destinationAccounts}
      categories={categories}
      disabled={!functionalCurrencyCode}
      functionalCurrencyCode={functionalCurrencyCode}
      initialValues={editInitialValues ?? creationInitialValues}
      loading={submissionIntent === 'submit'}
      officialExchangeRate={officialExchangeRates?.[0]}
      onAddAccount={onAddAccount}
      onAddCategory={onAddCategory}
      initialEditItemId={initialEditItemId}
      onCurrencyContextChange={setCurrencyContext}
      onSaveDraft={journalEntry ? undefined : handleCreateDraft}
      onSubmit={handleSubmit}
      savingDraft={submissionIntent === 'draft'}
      submitLabel={getEditSubmitLabel()}
    />
  );
}
