import { AccountCombobox } from '@/account/components/account-combobox';
import { ItemizedFields } from '@/journal-entries/components/itemized-fields';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/alert-dialog';
import { Button } from '@/shared/components/button';
import {
  CurrencyExchangeRateInput,
  type ICurrencyExchangeRateInputValue,
} from '@/shared/components/currency-exchange-rate-input';
import { DateInput } from '@/shared/components/date-input';
import { Field, FieldError, FieldGroup } from '@/shared/components/field';
import { FileUpload } from '@/shared/components/file-upload';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { MoneyWithCurrencyInput } from '@/shared/components/money-with-currency-input';
import { useFieldErrorMessage } from '@/shared/hooks/use-field-error-message';
import { dateUtils } from '@/shared/lib/utils/date';
import { generateUUID } from '@/shared/lib/utils/uuid';
import { useFormik } from 'formik';
import { ArrowLeft, ListPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cashTransferFormHelpers from './helper';
import type { CashTransferFormProps, ICashTransferFormValues } from './types';
import { useCashTransferFormValidation } from './validation';

const ATTACHMENT_ACCEPT = ['image/jpeg', 'image/png', 'application/pdf'];

export function CashTransferForm({
  sourceAccounts,
  destinationAccounts,
  categories,
  disabled = false,
  functionalCurrencyCode,
  initialValues,
  loading = false,
  officialExchangeRate,
  onCurrencyContextChange,
  onSaveDraft,
  onSubmit,
  savingDraft = false,
  submitLabel,
}: Readonly<CashTransferFormProps>) {
  const { t } = useTranslation<'journal-entries'>('journal-entries');

  const [singleEntryConfirmationOpen, setSingleEntryConfirmationOpen] =
    useState(false);

  const [isItemizedRowEditing, setIsItemizedRowEditing] = useState(false);

  const [initialItemizedEditItemId, setInitialItemizedEditItemId] =
    useState<string>();

  const validationSchema = useCashTransferFormValidation(
    sourceAccounts,
    destinationAccounts,
    officialExchangeRate
  );

  const resolvedInitialValues = useMemo(
    () =>
      cashTransferFormHelpers.createInitialValues(
        initialValues,
        sourceAccounts,
        destinationAccounts,
        functionalCurrencyCode
      ),
    [destinationAccounts, functionalCurrencyCode, initialValues, sourceAccounts]
  );

  const handleSubmit = (values: ICashTransferFormValues) => {
    onSubmit(
      cashTransferFormHelpers.normalizeValues(values, officialExchangeRate)
    );
  };

  const formik = useFormik<ICashTransferFormValues>({
    enableReinitialize: true,
    initialValues: resolvedInitialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  const getErrorMessage = useFieldErrorMessage({
    errors: formik.errors,
    touched: formik.touched,
  });

  const selectedSourceAccount = sourceAccounts.find(
    (account) => account.id === formik.values.sourceAccountId
  );

  const selectedDestinationAccount = destinationAccounts.find(
    (account) => account.id === formik.values.destinationAccountId
  );

  const sourceCurrencyCode = formik.values.amountSent.currencyCode;
  const destinationCurrencyCode = formik.values.amountReceived.currencyCode;
  const sourceOpeningDate = selectedSourceAccount?.openingBalanceDate;
  const destinationOpeningDate = selectedDestinationAccount?.openingBalanceDate;

  const exchangeRateRequired = cashTransferFormHelpers.isExchangeRateRequired(
    sourceCurrencyCode,
    destinationCurrencyCode
  );

  const officialRateMatches = cashTransferFormHelpers.matchesOfficialRate(
    officialExchangeRate,
    sourceCurrencyCode,
    destinationCurrencyCode,
    formik.values.date
  );

  const effectiveExchangeRate =
    cashTransferFormHelpers.getEffectiveExchangeRate(
      formik.values,
      officialExchangeRate
    );

  const sourceAccountOptions = sourceAccounts.filter(
    (account) => account.id !== formik.values.destinationAccountId
  );

  const destinationAccountOptions = destinationAccounts.filter(
    (account) => account.id !== formik.values.sourceAccountId
  );

  const handleSourceAccountChange = (sourceAccountId: string) => {
    const nextSourceCurrencyCode =
      cashTransferFormHelpers.getAccountCurrencyCode(
        sourceAccounts,
        sourceAccountId
      ) || functionalCurrencyCode;

    formik.setValues(
      cashTransferFormHelpers.updateSourceAccount(
        formik.values,
        sourceAccountId,
        nextSourceCurrencyCode
      )
    );
    formik.setFieldTouched('sourceAccountId', true, false);
    onCurrencyContextChange({
      sourceCurrencyCode: nextSourceCurrencyCode,
      destinationCurrencyCode,
      date: formik.values.date,
    });
  };

  const handleDestinationAccountChange = (destinationAccountId: string) => {
    const nextDestinationCurrencyCode =
      cashTransferFormHelpers.getAccountCurrencyCode(
        destinationAccounts,
        destinationAccountId
      ) || sourceCurrencyCode;

    const itemizedFieldsWillRemount =
      nextDestinationCurrencyCode !== destinationCurrencyCode;

    if (itemizedFieldsWillRemount) {
      setInitialItemizedEditItemId(undefined);
      setIsItemizedRowEditing(false);
    }

    formik.setValues(
      cashTransferFormHelpers.updateDestinationAccount(
        formik.values,
        destinationAccountId,
        nextDestinationCurrencyCode
      )
    );
    formik.setFieldTouched('destinationAccountId', true, false);
    onCurrencyContextChange({
      sourceCurrencyCode,
      destinationCurrencyCode: nextDestinationCurrencyCode,
      date: formik.values.date,
    });
  };

  const handleAmountSentChange = (
    amountSent: ICashTransferFormValues['amountSent']
  ) => {
    void formik.setValues(
      cashTransferFormHelpers.updateAmountSent(
        formik.values,
        amountSent,
        effectiveExchangeRate
      )
    );
  };

  const handleAmountReceivedChange = (
    amountReceived: ICashTransferFormValues['amountReceived']
  ) => {
    void formik.setValues(
      cashTransferFormHelpers.updateAmountReceived(
        formik.values,
        amountReceived
      )
    );
  };

  const handleExchangeRateChange = (
    exchangeRate: ICurrencyExchangeRateInputValue | null
  ) => {
    void formik.setValues(
      cashTransferFormHelpers.updateExchangeRate(formik.values, exchangeRate)
    );
  };

  const handleDateChange = (date: string) => {
    void formik.setFieldValue('date', date);
    onCurrencyContextChange({
      sourceCurrencyCode,
      destinationCurrencyCode,
      date,
    });
  };

  const handleDateDisabled = (date: Date) => {
    if (!dateUtils.isNotInTheFuture(date)) return true;

    return [sourceOpeningDate, destinationOpeningDate].some((openingDate) =>
      Boolean(openingDate && !dateUtils.isOnOrAfter(date, openingDate))
    );
  };

  const handleAttachmentChange = (attachment: File | null) => {
    void formik.setFieldValue('attachment', attachment);
    void formik.setFieldTouched('attachment', true, false);
  };

  const handleSaveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      await formik.submitForm();

      return;
    }

    onSaveDraft?.(
      cashTransferFormHelpers.normalizeValues(
        formik.values,
        officialExchangeRate
      )
    );
  };

  const handleItemize = () => {
    const item = cashTransferFormHelpers.createItem(
      generateUUID(),
      destinationCurrencyCode
    );

    const itemizedValues = {
      ...formik.values,
      isItemized: true,
    };

    setInitialItemizedEditItemId(item.id);
    setIsItemizedRowEditing(true);
    void formik.setValues(
      cashTransferFormHelpers.updateItems(
        itemizedValues,
        [item],
        effectiveExchangeRate
      )
    );
    void formik.setFieldTouched('items', false, false);
  };

  const handleItemsChange = (items: ICashTransferFormValues['items']) => {
    setInitialItemizedEditItemId(undefined);
    void formik.setValues(
      cashTransferFormHelpers.updateItems(
        formik.values,
        items,
        effectiveExchangeRate
      )
    );
  };

  const handleItemizedEditModeChange = (isEditing: boolean) => {
    setIsItemizedRowEditing(isEditing);
    if (!isEditing) setInitialItemizedEditItemId(undefined);
  };

  const collapseToSingleEntry = () => {
    const singleEntryValues = {
      ...formik.values,
      isItemized: false,
    };

    void formik.setValues(
      cashTransferFormHelpers.updateItems(
        singleEntryValues,
        [],
        effectiveExchangeRate
      )
    );
    void formik.setFieldTouched('items', false, false);
    setInitialItemizedEditItemId(undefined);
    setIsItemizedRowEditing(false);
    setSingleEntryConfirmationOpen(false);
  };

  const handleBackToSingleEntry = () => {
    if (formik.values.items.length <= 1) collapseToSingleEntry();
    else setSingleEntryConfirmationOpen(true);
  };

  const interactionDisabled = disabled || loading || savingDraft;
  const sourceAccountError = getErrorMessage('sourceAccountId');
  const destinationAccountError = getErrorMessage('destinationAccountId');
  const amountSentError = getErrorMessage('amountSent.amount');
  const amountReceivedError = getErrorMessage('amountReceived.amount');
  const dateError = getErrorMessage('date');
  const exchangeRateError = getErrorMessage('exchangeRate');
  const attachmentError = getErrorMessage('attachment');

  const source_account_label = t('source_account_label');
  const destination_account_label = t('destination_account_label');
  const amount_sent_label = t('amount_sent_label');
  const amount_received_label = t('amount_received_label');
  const date_label = t('cash_transaction_date_label');
  const date_placeholder = t('cash_transaction_date_placeholder');
  const exchange_rate_label = t('exchange_rate_label');
  const add_fees_text = t('cash_transfer_add_fees_text');
  const back_to_single_text = t('cash_transaction_back_to_single_entry_text');
  const description_label = t('description_label');
  const description_placeholder = t('description_placeholder');
  const attachment_label = t('cash_transfer_attachment_label');
  const attachment_action_text = t('cash_transaction_attachment_action_text');
  const attachment_replace_text = t('cash_transaction_attachment_replace_text');
  const attachment_remove_text = t('cash_transaction_attachment_remove_text');

  const attachment_guidance_text = t(
    'cash_transaction_attachment_guidance_text'
  );

  const create_text = submitLabel ?? t('cash_transaction_create_text');
  const save_draft_text = t('cash_transaction_save_draft_text');
  const return_title = t('cash_transfer_return_to_single_title');
  const return_description = t('cash_transfer_return_to_single_description');
  const return_cancel_text = t('cash_transfer_return_to_single_cancel_text');
  const return_confirm_text = t('cash_transfer_return_to_single_confirm_text');

  return (
    <>
      <form
        aria-busy={loading || savingDraft}
        className="w-full max-w-xl"
        onSubmit={formik.handleSubmit}
      >
        <FieldGroup className="gap-5">
          <AccountCombobox
            id="cash-transfer-source-account"
            accounts={sourceAccountOptions}
            disabled={interactionDisabled}
            error={sourceAccountError}
            label={source_account_label}
            onChange={handleSourceAccountChange}
            value={formik.values.sourceAccountId}
          />

          <AccountCombobox
            id="cash-transfer-destination-account"
            accounts={destinationAccountOptions}
            disabled={interactionDisabled}
            error={destinationAccountError}
            label={destination_account_label}
            onChange={handleDestinationAccountChange}
            value={formik.values.destinationAccountId}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field data-invalid={Boolean(amountSentError.length)}>
              <Label htmlFor="cash-transfer-amount-sent">
                {amount_sent_label}
              </Label>
              <MoneyWithCurrencyInput
                id="cash-transfer-amount-sent"
                aria-label={amount_sent_label}
                aria-invalid={Boolean(amountSentError.length)}
                currencyDisabled
                currencyLabelFormat="code"
                disabled={interactionDisabled}
                name="amountSent.amount"
                onBlur={formik.handleBlur}
                onChange={handleAmountSentChange}
                showFlag
                value={formik.values.amountSent}
              />
              <FieldError errors={amountSentError} />
            </Field>

            <Field data-invalid={Boolean(amountReceivedError.length)}>
              <Label htmlFor="cash-transfer-amount-received">
                {amount_received_label}
              </Label>
              <MoneyWithCurrencyInput
                id="cash-transfer-amount-received"
                aria-label={amount_received_label}
                aria-invalid={Boolean(amountReceivedError.length)}
                currencyDisabled
                currencyLabelFormat="code"
                disabled={interactionDisabled}
                name="amountReceived.amount"
                onBlur={formik.handleBlur}
                onChange={handleAmountReceivedChange}
                showFlag
                value={formik.values.amountReceived}
              />
              <FieldError errors={amountReceivedError} />
            </Field>
          </div>

          {formik.values.isItemized ? (
            <div className="space-y-3">
              <Button
                className="h-auto px-0"
                disabled={interactionDisabled}
                onClick={handleBackToSingleEntry}
                type="button"
                variant="link"
              >
                <ArrowLeft />
                {back_to_single_text}
              </Button>
              <ItemizedFields
                key={destinationCurrencyCode}
                accounts={categories}
                currencyCode={destinationCurrencyCode}
                defaultValue={formik.values.items}
                disabled={interactionDisabled}
                initialEditItemId={initialItemizedEditItemId}
                onChange={handleItemsChange}
                onEditModeChange={handleItemizedEditModeChange}
              />
            </div>
          ) : (
            <Button
              className="h-auto justify-start px-0"
              disabled={interactionDisabled}
              onClick={handleItemize}
              type="button"
              variant="link"
            >
              <ListPlus />
              {add_fees_text}
            </Button>
          )}

          {exchangeRateRequired ? (
            <Field data-invalid={Boolean(exchangeRateError.length)}>
              <Label htmlFor="cash-transfer-exchange-rate">
                {exchange_rate_label}
              </Label>
              <CurrencyExchangeRateInput
                id="cash-transfer-exchange-rate"
                aria-invalid={Boolean(exchangeRateError.length)}
                aria-label={exchange_rate_label}
                baseCurrency={sourceCurrencyCode}
                disabled={interactionDisabled}
                layout="compact"
                name="exchangeRate"
                officialRate={
                  officialRateMatches ? officialExchangeRate : undefined
                }
                onBlur={formik.handleBlur}
                onChange={handleExchangeRateChange}
                targetCurrency={destinationCurrencyCode}
                value={formik.values.exchangeRate}
              />
              <FieldError errors={exchangeRateError} />
            </Field>
          ) : (
            <div aria-hidden="true" className="hidden sm:block" />
          )}

          <Field data-invalid={Boolean(dateError.length)}>
            <Label htmlFor="cash-transfer-date">{date_label}</Label>
            <DateInput
              id="cash-transfer-date"
              aria-invalid={Boolean(dateError.length)}
              disabled={interactionDisabled}
              disabledDates={handleDateDisabled}
              onBlur={() => void formik.setFieldTouched('date', true)}
              onValueChange={handleDateChange}
              placeholder={date_placeholder}
              value={formik.values.date}
            />
            <FieldError errors={dateError} />
          </Field>

          <Field>
            <Label htmlFor="cash-transfer-description">
              {description_label}
            </Label>
            <Input
              id="cash-transfer-description"
              disabled={interactionDisabled}
              name="description"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              placeholder={description_placeholder}
              value={formik.values.description}
            />
          </Field>

          <FileUpload
            accept={ATTACHMENT_ACCEPT}
            actionText={attachment_action_text}
            description={attachment_guidance_text}
            disabled={interactionDisabled}
            errors={attachmentError}
            id="cash-transfer-attachment"
            label={attachment_label}
            onValueChange={handleAttachmentChange}
            removeText={attachment_remove_text}
            replaceText={attachment_replace_text}
            value={formik.values.attachment}
          />

          <div className="flex justify-end gap-2 pt-2">
            {onSaveDraft && (
              <Button
                disabled={disabled || loading || isItemizedRowEditing}
                loading={savingDraft}
                onClick={() => void handleSaveDraft()}
                type="button"
                variant="outline"
              >
                {save_draft_text}
              </Button>
            )}
            <Button
              disabled={disabled || savingDraft || isItemizedRowEditing}
              loading={loading}
              type="submit"
            >
              {create_text}
            </Button>
          </div>
        </FieldGroup>
      </form>

      <AlertDialog
        open={singleEntryConfirmationOpen}
        onOpenChange={setSingleEntryConfirmationOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{return_title}</AlertDialogTitle>
            <AlertDialogDescription>
              {return_description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{return_cancel_text}</AlertDialogCancel>
            <AlertDialogAction onClick={collapseToSingleEntry}>
              {return_confirm_text}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
