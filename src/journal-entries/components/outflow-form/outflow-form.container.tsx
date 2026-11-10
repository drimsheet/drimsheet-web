import { usePermittedPostingAccounts } from '@/account/hooks/use-permitted-posting-accounts';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { useCounterparties } from '@/counterparty/hooks/use-counterparties';
import {
  CashTransactionForm,
  CashTransactionFormSkeleton,
  type ICashTransactionCurrencyContext,
  type ICashTransactionFormValues,
} from '@/journal-entries/components/cash-transaction-form';
import { useCreatePayment } from '@/journal-entries/hooks/use-create-payment';
import { useRectifyPayment } from '@/journal-entries/hooks/use-rectify-payment';
import { journalEntryFormMapper } from '@/journal-entries/lib/mappers/journal-entry-form.mapper';
import { journalEntryMapper } from '@/journal-entries/lib/mappers/journal-entry.mapper';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useExchangeRates } from '@/shared/hooks/use-exchange-rates';
import { useUploadFile } from '@/shared/hooks/use-upload-file';
import {
  EJournalEntrySourceType,
  EJournalEntryStatus,
} from '@/shared/lib/api/Api';
import type { IReactQueryOptions } from '@/shared/types/query-options.types';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { OutflowFormContainerProps } from './types';

const requiredQueryOptions: IReactQueryOptions = {
  throwOnError: true,
};

export function OutflowFormContainer({
  journalEntry,
  initialValues: creationInitialValues,
  restoring = false,
  onAddCounterparty,
  onAddAccount,
  onAddCategory,
  initialEditItemId,
  onSuccess,
}: Readonly<OutflowFormContainerProps>) {
  const { t } = useTranslation<'journal-entries'>('journal-entries');

  const [currencyContext, setCurrencyContext] =
    useState<ICashTransactionCurrencyContext>();

  const [submissionIntent, setSubmissionIntent] = useState<
    'submit' | 'draft'
  >();

  const handleApiError = useApiErrorHandler();

  const { data: permittedAccounts, isPending: isPermittedAccountsPending } =
    usePermittedPostingAccounts({
      sourceType: EJournalEntrySourceType.Payment,
      side: 'source',
      filterSuspense: true,
      limit: 100,
      ...requiredQueryOptions,
    });

  const { data: permittedCategories, isPending: isPermittedCategoriesPending } =
    usePermittedPostingAccounts({
      sourceType: EJournalEntrySourceType.Payment,
      side: 'destination',
      filterSuspense: true,
      limit: 100,
      ...requiredQueryOptions,
    });

  const { data: counterpartiesData, isPending: isCounterpartiesPending } =
    useCounterparties({ limit: 100, ...requiredQueryOptions });

  const { data: accountingEntity, isPending: isAccountingEntityPending } =
    useAccountingEntity(requiredQueryOptions);

  const functionalCurrencyCode = accountingEntity?.functionalCurrencyCode ?? '';

  const exchangeRateQuery = journalEntryMapper.toExchangeRateQuery(
    currencyContext,
    functionalCurrencyCode
  );

  const { data: officialExchangeRates } = useExchangeRates(exchangeRateQuery);
  const { mutateAsync: createPayment } = useCreatePayment();
  const { mutateAsync: rectifyPayment } = useRectifyPayment();
  const { mutateAsync: uploadFile } = useUploadFile();

  const editInitialValues = useMemo(
    () =>
      journalEntry
        ? journalEntryFormMapper.toCashTransactionFormValues(
            journalEntry,
            functionalCurrencyCode
          )
        : undefined,
    [functionalCurrencyCode, journalEntry]
  );

  const isDraft = journalEntry?.status === EJournalEntryStatus.Draft;

  const isFormDataPending =
    isPermittedAccountsPending ||
    isPermittedCategoriesPending ||
    isCounterpartiesPending ||
    isAccountingEntityPending;

  const uploadAttachments = (values: ICashTransactionFormValues) =>
    Promise.all(
      values.attachments
        .filter((attachment) => attachment instanceof File)
        .map((file) => uploadFile(file))
    );

  const createEntry = (
    values: ICashTransactionFormValues,
    postedAt: string | null,
    attachmentReferences: string[]
  ) =>
    createPayment(
      journalEntryMapper.toPaymentEntryReq(
        values,
        functionalCurrencyCode,
        postedAt,
        attachmentReferences
      )
    );

  const handleCreate = async (values: ICashTransactionFormValues) => {
    const attachmentReferences = await uploadAttachments(values);
    await createEntry(values, new Date().toISOString(), attachmentReferences);
    toast.success(t('outflow_payment_created_success_text'));
    await onSuccess();
  };

  const handleCreateDraft = async (values: ICashTransactionFormValues) => {
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

  const handleRectify = async (values: ICashTransactionFormValues) => {
    if (!journalEntry || !editInitialValues) {
      return;
    }

    const attachmentReferences = await uploadAttachments(values);

    const request = journalEntryMapper.toPaymentRectificationRequest(
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

    await rectifyPayment({ id: journalEntry.id, request });

    const successMessage = isDraft
      ? t('journal_entry_draft_saved_success_text')
      : t('journal_entry_updated_success_text');

    toast.success(successMessage);
    await onSuccess();
  };

  const handleSubmit = async (values: ICashTransactionFormValues) => {
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
    return <CashTransactionFormSkeleton />;
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
    <CashTransactionForm
      accounts={permittedAccounts?.data ?? []}
      categories={permittedCategories?.data ?? []}
      counterpartyOptions={counterpartiesData?.data ?? []}
      disabled={!functionalCurrencyCode}
      functionalCurrencyCode={functionalCurrencyCode}
      initialValues={editInitialValues ?? creationInitialValues}
      loading={submissionIntent === 'submit'}
      officialExchangeRate={officialExchangeRates?.[0]}
      onAddCounterparty={journalEntry ? undefined : onAddCounterparty}
      onAddAccount={onAddAccount}
      onAddCategory={onAddCategory}
      initialEditItemId={initialEditItemId}
      onCurrencyContextChange={setCurrencyContext}
      onSaveDraft={journalEntry ? undefined : handleCreateDraft}
      onSubmit={handleSubmit}
      savingDraft={submissionIntent === 'draft'}
      submitLabel={getEditSubmitLabel()}
      variant="outflow"
    />
  );
}
