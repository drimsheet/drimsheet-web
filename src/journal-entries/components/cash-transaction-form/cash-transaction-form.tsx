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
import { CurrencyExchangeRateInput } from '@/shared/components/currency-exchange-rate-input';
import { DateInput } from '@/shared/components/date-input';
import { Field, FieldError, FieldGroup } from '@/shared/components/field';
import { FileUpload } from '@/shared/components/file-upload';
import {
  FreeSoloCombobox,
  type UFreeSoloComboboxValue,
} from '@/shared/components/free-solo-combobox';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { MoneyWithCurrencyInput } from '@/shared/components/money-with-currency-input';
import { useFieldErrorMessage } from '@/shared/hooks/use-field-error-message';
import type { IJournalCounterpartyReq } from '@/shared/lib/api/Api';
import { dateUtils } from '@/shared/lib/utils/date';
import { generateUUID } from '@/shared/lib/utils/uuid';
import { useFormik } from 'formik';
import { ArrowLeft, ListCollapse } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cashTransactionFormHelpers from './helper';
import type {
  CashTransactionFormProps,
  ICashTransactionFormValues,
} from './types';
import { useCashTransactionFormValidation } from './validation';

const ATTACHMENT_ACCEPT = ['image/jpeg', 'image/png', 'application/pdf'];

export function CashTransactionForm({
  accounts,
  categories,
  counterpartyOptions = [],
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
  variant,
}: Readonly<CashTransactionFormProps>) {
  const { t } = useTranslation<'journal-entries'>('journal-entries');

  const [singleEntryConfirmationOpen, setSingleEntryConfirmationOpen] =
    useState(false);

  const [isItemizedRowEditing, setIsItemizedRowEditing] = useState(false);

  const [initialItemizedEditItemId, setInitialItemizedEditItemId] =
    useState<string>();

  const validationSchema = useCashTransactionFormValidation(
    accounts,
    functionalCurrencyCode,
    variant,
    officialExchangeRate
  );

  const resolvedInitialValues = useMemo(
    () =>
      cashTransactionFormHelpers.createInitialValues(
        initialValues,
        accounts,
        functionalCurrencyCode
      ),
    [accounts, functionalCurrencyCode, initialValues]
  );

  const normalizeValues = (values: ICashTransactionFormValues) => {
    const accountCurrencyCode =
      cashTransactionFormHelpers.getAccountCurrencyCode(
        accounts,
        values.accountId
      );

    const officialRateMatches = cashTransactionFormHelpers.matchesOfficialRate(
      officialExchangeRate,
      accountCurrencyCode ?? '',
      functionalCurrencyCode,
      values.date
    );

    return cashTransactionFormHelpers.normalizeValues(
      values,
      cashTransactionFormHelpers.isExchangeRateRequired(
        accountCurrencyCode,
        functionalCurrencyCode
      ),
      officialRateMatches ? officialExchangeRate?.rate : undefined
    );
  };

  const handleSubmit = (values: ICashTransactionFormValues) => {
    onSubmit(normalizeValues(values));
  };

  const formik = useFormik<ICashTransactionFormValues>({
    enableReinitialize: true,
    initialValues: resolvedInitialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  const getErrorMessage = useFieldErrorMessage({
    errors: formik.errors,
    touched: formik.touched,
  });

  const selectedAccount = accounts.find(
    (account) => account.id === formik.values.accountId
  );

  const accountCurrencyCode =
    selectedAccount?.balance.currencyCode ?? functionalCurrencyCode;

  const accountOpeningDate = selectedAccount?.openingBalanceDate;

  const itemizedTotal = cashTransactionFormHelpers.getItemTotal(
    formik.values.items
  );

  /**
   * ================= Handlers ================
   */
  const handleAccountChange = (accountId: string) => {
    const currencyCode = cashTransactionFormHelpers.getAccountCurrencyCode(
      accounts,
      accountId
    );

    const itemizedFieldsWillRemount = currencyCode !== accountCurrencyCode;

    if (itemizedFieldsWillRemount) {
      setIsItemizedRowEditing(!!initialItemizedEditItemId);
    }

    void formik.setValues(
      cashTransactionFormHelpers.updateAccount(
        formik.values,
        accountId,
        currencyCode,
        functionalCurrencyCode
      )
    );
    void formik.setFieldTouched('accountId', true, false);

    onCurrencyContextChange({
      currencyCode,
      date: formik.values.date,
    });
  };

  const handleDateChange = (date: string) => {
    void formik.setFieldValue('date', date);
    onCurrencyContextChange({
      currencyCode: accountCurrencyCode,
      date,
    });
  };

  const handleDateDisabled = (date: Date) => {
    if (!dateUtils.isNotInTheFuture(date)) return true;

    if (!accountOpeningDate) return false;

    return !dateUtils.isOnOrAfter(date, accountOpeningDate);
  };

  const handleCounterpartyChange = (
    counterparty: UFreeSoloComboboxValue<IJournalCounterpartyReq>
  ) => {
    let nextCounterparty: IJournalCounterpartyReq;

    if (typeof counterparty === 'string') {
      nextCounterparty = { name: counterparty };
    } else if (counterparty === null) nextCounterparty = { name: '' };
    else nextCounterparty = counterparty;

    void formik.setFieldValue('counterparty', nextCounterparty);
  };

  const handleCategoryChange = (categoryId: string) => {
    void formik.setFieldValue('categoryId', categoryId);
    void formik.setFieldTouched('categoryId', true, false);
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

    onSaveDraft?.(normalizeValues(formik.values));
  };

  const handleItemize = () => {
    const item = cashTransactionFormHelpers.createItem(
      generateUUID(),
      formik.values.amount.currencyCode,
      formik.values.amount.amount,
      formik.values.categoryId
    );

    setInitialItemizedEditItemId(item.id);
    setIsItemizedRowEditing(true);
    void formik.setFieldValue('items', [item]);
    void formik.setFieldTouched('items', false, false);
    void formik.setFieldTouched('amount.amount', false, false);
    void formik.setFieldValue('isItemized', true);
  };

  const handleItemsChange = (items: ICashTransactionFormValues['items']) => {
    setInitialItemizedEditItemId(undefined);
    void formik.setFieldValue('items', items);
  };

  const handleItemizedEditModeChange = (isEditing: boolean) => {
    setIsItemizedRowEditing(isEditing);
    if (!isEditing) setInitialItemizedEditItemId(undefined);
  };

  const collapseToSingleEntry = () => {
    const firstItem = formik.values.items[0];
    if (firstItem) {
      void formik.setFieldValue('categoryId', firstItem.accountId);
    }

    void formik.setFieldValue('amount', {
      amount: itemizedTotal,
      currencyCode: formik.values.amount.currencyCode,
      isMinorUnit: formik.values.amount.isMinorUnit,
    });
    void formik.setFieldValue('items', []);
    void formik.setFieldTouched('items', false, false);
    void formik.setFieldValue('isItemized', false);
    setInitialItemizedEditItemId(undefined);
    setIsItemizedRowEditing(false);
    setSingleEntryConfirmationOpen(false);
  };

  const handleBackToSingleEntry = () => {
    if (formik.values.items.length <= 1) collapseToSingleEntry();
    else setSingleEntryConfirmationOpen(true);
  };

  /**
   * ================= Derived values ================
   */

  const displayedAmount = formik.values.isItemized
    ? {
        amount: itemizedTotal,
        currencyCode: formik.values.amount.currencyCode,
        isMinorUnit: formik.values.amount.isMinorUnit,
      }
    : formik.values.amount;

  const officialRateMatches = cashTransactionFormHelpers.matchesOfficialRate(
    officialExchangeRate,
    accountCurrencyCode,
    functionalCurrencyCode,
    formik.values.date
  );

  const exchangeRateRequired =
    cashTransactionFormHelpers.isExchangeRateRequired(
      accountCurrencyCode,
      functionalCurrencyCode
    );

  const interactionDisabled = disabled || loading || savingDraft;

  /**
   * Errors
   */
  const accountError = getErrorMessage('accountId');

  const amountError = formik.values.isItemized
    ? []
    : getErrorMessage('amount.amount');

  const dateError = getErrorMessage('date');
  const categoryError = getErrorMessage('categoryId');
  const exchangeRateError = getErrorMessage('exchangeRate');
  const counterpartyError = getErrorMessage('counterparty.name');
  const attachmentError = getErrorMessage('attachment');

  /**
   * ================= Translations ================
   */
  const account_label = t('cash_transaction_account_label');
  const amount_label = t('amount_label');
  const date_label = t('cash_transaction_date_label');
  const date_placeholder = t('cash_transaction_date_placeholder');
  const category_label = t('category_label');
  const category_placeholder = t('category_placeholder');
  const create_text = submitLabel ?? t('cash_transaction_create_text');
  const save_draft_text = t('cash_transaction_save_draft_text');
  const description_label = t('description_label');
  const description_placeholder = t('description_placeholder');
  const exchange_rate_label = t('exchange_rate_label');

  const itemize_transaction_text = t(
    'cash_transaction_itemize_transaction_text'
  );

  const back_to_single_text = t('cash_transaction_back_to_single_entry_text');

  const counterparty_text_keys =
    cashTransactionFormHelpers.getCounterpartyTextKeys(variant);

  const counterparty_empty_text = t(counterparty_text_keys.empty);
  const counterparty_label = t(counterparty_text_keys.label);
  const counterparty_placeholder = t(counterparty_text_keys.placeholder);
  const attachment_label = t('cash_transaction_attachment_label');
  const attachment_action_text = t('cash_transaction_attachment_action_text');
  const attachment_replace_text = t('cash_transaction_attachment_replace_text');
  const attachment_remove_text = t('cash_transaction_attachment_remove_text');

  const attachment_guidance_text = t(
    'cash_transaction_attachment_guidance_text'
  );

  const return_title = t('cash_transaction_return_to_single_title');
  const return_description = t('cash_transaction_return_to_single_description');
  const return_cancel_text = t('cash_transaction_return_to_single_cancel_text');

  const return_confirm_text = t(
    'cash_transaction_return_to_single_confirm_text'
  );

  return (
    <>
      <form
        aria-busy={loading || savingDraft}
        className="w-full max-w-xl"
        onSubmit={formik.handleSubmit}
      >
        <FieldGroup className="gap-5">
          <AccountCombobox
            id="cash-transaction-account"
            accounts={accounts}
            disabled={interactionDisabled}
            error={accountError}
            label={account_label}
            onChange={handleAccountChange}
            value={formik.values.accountId}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field data-invalid={Boolean(amountError.length)}>
              <Label htmlFor="cash-transaction-amount">{amount_label}</Label>
              <MoneyWithCurrencyInput
                id="cash-transaction-amount"
                aria-invalid={Boolean(amountError.length)}
                currencyDisabled
                showFlag
                currencyLabelFormat="code"
                disabled={interactionDisabled || formik.values.isItemized}
                name="amount.amount"
                onBlur={formik.handleBlur}
                onChange={(amount) =>
                  void formik.setFieldValue('amount', amount)
                }
                value={displayedAmount}
              />
              <FieldError errors={amountError} />
            </Field>

            <Field data-invalid={Boolean(dateError.length)}>
              <Label htmlFor="cash-transaction-date">{date_label}</Label>
              <DateInput
                id="cash-transaction-date"
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
          </div>

          {exchangeRateRequired && (
            <Field data-invalid={Boolean(exchangeRateError.length)}>
              <Label htmlFor="cash-transaction-exchange-rate">
                {exchange_rate_label}
              </Label>
              <CurrencyExchangeRateInput
                id="cash-transaction-exchange-rate"
                aria-invalid={Boolean(exchangeRateError.length)}
                aria-label={exchange_rate_label}
                baseCurrency={accountCurrencyCode}
                disabled={interactionDisabled}
                displayOfficialRate
                layout="compact"
                name="exchangeRate"
                officialRate={
                  officialRateMatches ? officialExchangeRate : undefined
                }
                onBlur={formik.handleBlur}
                onChange={(v) => formik.setFieldValue('exchangeRate', v)}
                targetCurrency={functionalCurrencyCode}
                value={formik.values.exchangeRate}
              />
              <FieldError errors={exchangeRateError} />
            </Field>
          )}

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
                key={accountCurrencyCode}
                accounts={categories}
                currencyCode={accountCurrencyCode}
                defaultValue={formik.values.items}
                disabled={interactionDisabled}
                excludeSelectedAccounts
                initialEditItemId={initialItemizedEditItemId}
                onChange={handleItemsChange}
                onEditModeChange={handleItemizedEditModeChange}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <AccountCombobox
                id="cash-transaction-category"
                accounts={categories}
                disabled={interactionDisabled}
                error={categoryError}
                label={category_label}
                onChange={handleCategoryChange}
                placeholder={category_placeholder}
                value={formik.values.categoryId}
              />
              <Button
                className="h-auto justify-start px-0"
                disabled={interactionDisabled}
                onClick={handleItemize}
                type="button"
                variant="link"
              >
                <ListCollapse />
                {itemize_transaction_text}
              </Button>
            </div>
          )}

          <FreeSoloCombobox<IJournalCounterpartyReq>
            id="cash-transaction-counterparty"
            disabled={interactionDisabled}
            emptyMessage={counterparty_empty_text}
            error={counterpartyError}
            getOptionLabel={(counterparty) => counterparty.name}
            isOptionEqualToValue={(counterparty, value) =>
              counterparty.id !== undefined && counterparty.id === value.id
            }
            label={counterparty_label}
            name="counterparty.name"
            onBlur={() =>
              void formik.setFieldTouched('counterparty.name', true)
            }
            onValueChange={handleCounterpartyChange}
            options={counterpartyOptions}
            placeholder={counterparty_placeholder}
            required
            value={formik.values.counterparty}
          />

          <Field>
            <Label htmlFor="cash-transaction-description">
              {description_label}
            </Label>
            <Input
              id="cash-transaction-description"
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
            id="cash-transaction-attachment"
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
