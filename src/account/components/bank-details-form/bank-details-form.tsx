import { OpeningBalanceFields } from '@/account/components/opening-balance-fields';
import { Alert, AlertDescription } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import { Checkbox } from '@/shared/components/checkbox';
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
import { useFormik } from 'formik';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  isSubAccount: false,
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
  const bank_details_info_alert = t('bank_details_info_alert');
  const create_as_sub_account_label = t('create_as_sub_account_label');

  const submit_label = t(
    mode === 'update' ? 'save_changes_label' : 'create_account_text'
  );

  const cancel_label = t('update_cancel_label');

  const leave_opening_balance_unset_label = t(
    'leave_opening_balance_unset_label'
  );

  return (
    <form
      className="w-full max-w-2xl"
      noValidate
      onSubmit={formik.handleSubmit}
    >
      <FieldSet disabled={disabled || loading}>
        <FieldGroup className="gap-5">
          {/* Row 1: Currency (left, 2/5) & Account name (right, 3/5) */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[2fr_3fr]">
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
          </div>

          {/* Row 2: Bank location (left, using CountryComboBox) & Bank name (right) */}
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

          {/* Row 3: Bank account number (left) & Bank account name (right) */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[2fr_3fr]">
            <Field
              data-invalid={Boolean(getErrorMessage('accountNumber').length)}
            >
              <Label htmlFor="accountNumber">{bank_account_number_label}</Label>
              <Input
                aria-invalid={Boolean(getErrorMessage('accountNumber').length)}
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

          {/* Info Alert explaining bank details collection */}
          <Alert variant="info" className="bg-muted/40 mb-3">
            <Info className="size-4 text-muted-foreground" />
            <AlertDescription>{bank_details_info_alert}</AlertDescription>
          </Alert>

          {/* Opening balance fields: checkbox, 2-col opening balance/date, exchange rate */}
          <OpeningBalanceFields
            skipOpeningBalanceLabel={
              mode === 'update' ? leave_opening_balance_unset_label : undefined
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
            onExchangeRateChange={(v) =>
              formik.setFieldValue('exchangeRate', v)
            }
            onOpeningBalanceChange={formik.handleChange}
            onOpeningDateChange={handleOpeningDateChange}
            openingBalance={formik.values.openingBalance}
            openingBalanceError={getErrorMessage('openingBalance')}
            openingDate={formik.values.openingDate}
            openingDateError={getErrorMessage('openingDate')}
          />

          {/* Sub account checkbox */}
          {mode === 'create' && (
            <Field orientation="horizontal">
              <Checkbox
                aria-label={create_as_sub_account_label}
                checked={formik.values.isSubAccount}
                disabled={disabled || loading}
                id="isSubAccount"
                name="isSubAccount"
                onCheckedChange={(checked) => {
                  void formik.setFieldValue('isSubAccount', checked === true);
                }}
              />
              <Label htmlFor="isSubAccount">
                {create_as_sub_account_label}
              </Label>
            </Field>
          )}

          {/* Submit button */}
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
