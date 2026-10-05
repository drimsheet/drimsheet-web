import { usePermittedPostingAccounts } from '@/account/hooks/use-permitted-posting-accounts';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { useCreateTransfer } from '@/journal-entries/hooks/use-create-transfer';
import { useRectifyJournalEntry } from '@/journal-entries/hooks/use-rectify-journal-entry';
import { journalEntryFormMapper } from '@/journal-entries/lib/mappers/journal-entry-form.mapper';
import { journalEntryMapper } from '@/journal-entries/lib/mappers/journal-entry.mapper';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useExchangeRates } from '@/shared/hooks/use-exchange-rates';
import {
  EJournalEntrySourceType,
  ELedgerAccountSubType,
  type IJournalEntryListDto,
} from '@/shared/lib/api/Api';
import { fileUploadService } from '@/shared/lib/services/file-upload.service';
import type { IReactQueryOptions } from '@/shared/types/query-options.types';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CashTransferForm } from './cash-transfer-form';
import { CashTransferFormSkeleton } from './skeleton';
import type {
  ICashTransferCurrencyContext,
  ICashTransferFormValues,
} from './types';

const requiredQueryOptions: IReactQueryOptions = {
  throwOnError: true,
};

interface CashTransferFormContainerProps {
  journalEntry?: IJournalEntryListDto;
}

export function CashTransferFormContainer({
  journalEntry,
}: Readonly<CashTransferFormContainerProps>) {
  const { t } = useTranslation<'journal-entries'>('journal-entries');
  const navigate = useNavigate();

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

  const { mutateAsync: rectifyJournalEntry, isPending: isRectifying } =
    useRectifyJournalEntry();

  const initialValues = useMemo(
    () =>
      journalEntry
        ? journalEntryFormMapper.toCashTransferFormValues(journalEntry)
        : undefined,
    [journalEntry]
  );

  const isFormDataPending =
    isSourcesPending || isDestinationsPending || isAccountingEntityPending;

  const permittedDestinationAccounts = permittedDestinations?.data ?? [];

  const destinationAccounts = permittedDestinationAccounts.filter(
    (account) => account.subType === ELedgerAccountSubType.CashAndCashEquivalent
  );

  const categories = permittedDestinationAccounts.filter(
    (account) => account.subType !== ELedgerAccountSubType.CashAndCashEquivalent
  );

  const handlePersistValues = async (
    values: ICashTransferFormValues,
    intent: 'submit' | 'draft'
  ) => {
    if (submissionIntent) return;

    setSubmissionIntent(intent);

    try {
      if (journalEntry) {
        const attachments = values.attachment
          ? [await fileUploadService.uploadAttachment(values.attachment)]
          : journalEntry.attachments;

        const payload =
          journalEntryMapper.toTransferJournalEntryRectificationReq(
            values,
            functionalCurrencyCode,
            journalEntry,
            attachments
          );

        await rectifyJournalEntry({ id: journalEntry.id, payload });
        toast.success(t('journal_entry_updated_success_text'));
      } else {
        const attachmentReferences = values.attachment
          ? [await fileUploadService.uploadFile(values.attachment)]
          : [];

        const postedAt = intent === 'draft' ? null : new Date().toISOString();

        const payload = journalEntryMapper.toTransferEntryReq(
          values,
          functionalCurrencyCode,
          postedAt,
          attachmentReferences
        );

        await createTransfer(payload);

        const successMessage =
          intent === 'draft'
            ? t('journal_entry_draft_saved_success_text')
            : t('transfer_created_success_text');

        toast.success(successMessage);
      }

      navigate('/transactions');
    } catch (error) {
      handleApiError(error, { showToast: true });
    } finally {
      setSubmissionIntent(undefined);
    }
  };

  const handleSubmit = (values: ICashTransferFormValues) =>
    handlePersistValues(values, 'submit');

  const handleSaveDraft = (values: ICashTransferFormValues) =>
    handlePersistValues(values, 'draft');

  if (isFormDataPending) return <CashTransferFormSkeleton />;

  return (
    <CashTransferForm
      sourceAccounts={permittedSources?.data ?? []}
      destinationAccounts={destinationAccounts}
      categories={categories}
      disabled={!functionalCurrencyCode}
      functionalCurrencyCode={functionalCurrencyCode}
      initialValues={initialValues}
      loading={submissionIntent === 'submit' || isRectifying}
      officialExchangeRate={officialExchangeRates?.[0]}
      onCurrencyContextChange={setCurrencyContext}
      onSaveDraft={journalEntry ? undefined : handleSaveDraft}
      onSubmit={handleSubmit}
      savingDraft={submissionIntent === 'draft'}
      submitLabel={journalEntry ? t('journal_entry_update_text') : undefined}
    />
  );
}
