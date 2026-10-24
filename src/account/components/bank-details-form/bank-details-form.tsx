import { OpeningBalanceFields } from '@/account/components/opening-balance-fields';
import { Button } from '@/shared/components/button';
import { CurrencySelect } from '@/shared/components/currency-select';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldSet,
} from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { useFieldErrorMessage } from '@/shared/hooks/use-field-error-message';
import { cn } from '@/shared/lib/utils/cn';
import { useFormik } from 'formik';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { BankDetailsHelp } from './parts/bank-details-help';
import { BankSelection } from './parts/bank-selection';
import type { BankDetailsFormProps, IBankDetailsFormValues } from './types';
import { useBankDetailsFormValidation } from './validation';

const defaultInitialValues: IBankDetailsFormValues = {
  name: '',
  currencyCode: '',
  bankLocation: '',
  bankName: '',
  accountNumber: '',
  accountName: '',
  createWithoutOpeningBalance: false,
  openingBalance: '',
  openingDate: '',
  exchangeRate: null,
};

export function BankDetailsForm({
  mode = 'create',
  hasExistingOpeningBalance = false,
  canUpdateCurrency = false,
  onCancel,
  accountingCurrencyCode,
  currencies,
  bankLocations,
  banks,
  isBanksLoading = false,
  officialExchangeRate,
  onBankLocationChange,
  onExchangeRateContextChange,
  initialValues,
  loading = false,
  disabled = false,
  onSubmit,
}: Readonly<BankDetailsFormProps>) {
  const { t } = useTranslation<'ledger-accounts'>('ledger-accounts');
  const accountDetailsHeadingId = useId();
  const bankAccountDetailsHeadingId = useId();

  const validationSchema = useBankDetailsFormValidation(
    accountingCurrencyCode,
    officialExchangeRate
  );

  const handleSubmit = (values: IBankDetailsFormValues) => onSubmit(values);

  const formik = useFormik<IBankDetailsFormValues>({
    enableReinitialize: true,
    initialValues: { ...defaultInitialValues, ...initialValues },
    validationSchema,
    onSubmit: handleSubmit,
  });

  const getErrorMessage = useFieldErrorMessage({
    errors: formik.errors,
    touched: formik.touched,
  });

  const handleCurrencyChange = (value: string) => {
    void formik.setFieldValue('currencyCode', value);
    void formik.setFieldValue('exchangeRate', null);
    onExchangeRateContextChange({
      currencyCode: value,
      date: formik.values.openingDate,
      createWithoutOpeningBalance: formik.values.createWithoutOpeningBalance,
    });
  };

  const handleLocationChange = (location: string) => {
    void formik.setFieldValue('bankLocation', location);
    onBankLocationChange(location);
  };

  const handleBankNameChange = (bankName: string) => {
    void formik.setFieldValue('bankName', bankName);
  };

  const handleCreateWithoutOpeningBalanceChange = (checked: boolean) => {
    void formik.setFieldValue('createWithoutOpeningBalance', checked);
    if (checked && mode === 'create') {
      formik.setFieldValue('exchangeRate', null);
    }

    onExchangeRateContextChange({
      currencyCode: formik.values.currencyCode,
      date: formik.values.openingDate,
      createWithoutOpeningBalance: checked,
    });
  };

  const handleOpeningDateChange = (value: string) => {
    void formik.setFieldValue('openingDate', value);
    onExchangeRateContextChange({
      currencyCode: formik.values.currencyCode,
      date: value,
      createWithoutOpeningBalance: formik.values.createWithoutOpeningBalance,
    });
  };

  const account_name_label = t('account_display_name');
  const currency_label = t('currency_label');
  const bank_account_number_label = t('bank_account_number_label');
  const bank_account_name_label = t('bank_account_name_label');
  const account_details_section_title = t('account_details_section_title');

  const bank_account_details_section_title = t(
    'bank_account_details_section_title'
  );

  const bank_details_info_trigger_label = t('bank_details_info_trigger_label');

  const bank_details_info_alert = t('bank_details_info_alert');

  const submit_label = t(
    mode === 'update' ? 'save_changes_label' : 'create_account_text'
  );

  const cancel_label = t('update_cancel_label');

  const leave_opening_balance_unset_label = t(
    'leave_opening_balance_unset_label'
  );

  return (
    <form className="w-full" noValidate onSubmit={formik.handleSubmit}>
      <FieldSet disabled={disabled || loading}>
        <FieldGroup className={cn('gap-8', mode === 'create' && 'md:gap-12')}>
          <section
            aria-labelledby={accountDetailsHeadingId}
            className="flex flex-col gap-5"
          >
            <h2
              id={accountDetailsHeadingId}
              className="m-0 text-xs font-medium uppercase tracking-[0.07em] text-muted-foreground"
            >
              {account_details_section_title}
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(getErrorMessage('name').length)}>
                <Label htmlFor="name">{account_name_label}</Label>
                <Input
                  aria-invalid={Boolean(getErrorMessage('name').length)}
                  id="name"
                  name="name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
                <FieldError errors={getErrorMessage('name')} />
              </Field>

              {mode === 'update' && !canUpdateCurrency ? (
                <Field>
                  <Label htmlFor="account-currency">{currency_label}</Label>
                  <Input
                    id="account-currency"
                    value={formik.values.currencyCode}
                    readOnly
                  />
                </Field>
              ) : (
                <CurrencySelect
                  currencies={currencies}
                  displayCode
                  error={getErrorMessage('currencyCode')}
                  label={currency_label}
                  onChange={handleCurrencyChange}
                  value={formik.values.currencyCode}
                />
              )}
            </div>

            <OpeningBalanceFields
              skipOpeningBalanceLabel={
                mode === 'update'
                  ? leave_opening_balance_unset_label
                  : undefined
              }
              showSkipOpeningBalance={
                mode !== 'update' || !hasExistingOpeningBalance
              }
              accountingCurrencyCode={accountingCurrencyCode}
              createWithoutOpeningBalance={
                formik.values.createWithoutOpeningBalance
              }
              currencyCode={formik.values.currencyCode}
              disabled={
                disabled ||
                loading ||
                (mode === 'update' && hasExistingOpeningBalance)
              }
              exchangeRate={formik.values.exchangeRate}
              exchangeRateError={getErrorMessage('exchangeRate')}
              officialExchangeRate={officialExchangeRate}
              onCreateWithoutOpeningBalanceChange={
                handleCreateWithoutOpeningBalanceChange
              }
              onExchangeRateChange={(value) =>
                formik.setFieldValue('exchangeRate', value)
              }
              onOpeningBalanceChange={formik.handleChange}
              onOpeningDateChange={handleOpeningDateChange}
              openingBalance={formik.values.openingBalance}
              openingBalanceError={getErrorMessage('openingBalance')}
              openingDate={formik.values.openingDate}
              openingDateError={getErrorMessage('openingDate')}
            />
          </section>

          <section
            aria-labelledby={bankAccountDetailsHeadingId}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1">
              <h2
                id={bankAccountDetailsHeadingId}
                className="m-0 text-xs font-medium uppercase tracking-[0.07em] text-muted-foreground"
              >
                {bank_account_details_section_title}
              </h2>
              <BankDetailsHelp
                description={bank_details_info_alert}
                triggerLabel={bank_details_info_trigger_label}
              />
            </div>

            <BankSelection
              bankLocation={formik.values.bankLocation}
              bankLocations={bankLocations}
              bankName={formik.values.bankName}
              bankNameError={getErrorMessage('bankName')}
              banks={banks}
              disabled={disabled || loading}
              isBanksLoading={isBanksLoading}
              locationError={getErrorMessage('bankLocation')}
              onBankNameChange={handleBankNameChange}
              onLocationChange={handleLocationChange}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                data-invalid={Boolean(getErrorMessage('accountNumber').length)}
              >
                <Label htmlFor="accountNumber">
                  {bank_account_number_label}
                </Label>
                <Input
                  aria-invalid={Boolean(
                    getErrorMessage('accountNumber').length
                  )}
                  id="accountNumber"
                  name="accountNumber"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.accountNumber}
                />
                <FieldError errors={getErrorMessage('accountNumber')} />
              </Field>

              <Field
                data-invalid={Boolean(getErrorMessage('accountName').length)}
              >
                <Label htmlFor="accountName">{bank_account_name_label}</Label>
                <Input
                  aria-invalid={Boolean(getErrorMessage('accountName').length)}
                  id="accountName"
                  name="accountName"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.accountName}
                />
                <FieldError errors={getErrorMessage('accountName')} />
              </Field>
            </div>
          </section>

          <Field orientation="horizontal" className="justify-end">
            {onCancel && (
              <Button
                variant="outline"
                type="button"
                disabled={loading}
                onClick={onCancel}
              >
                {cancel_label}
              </Button>
            )}
            <Button
              className={onCancel ? 'w-auto' : 'w-full sm:w-auto'}
              disabled={disabled}
              loading={loading}
              type="submit"
            >
              {submit_label}
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
