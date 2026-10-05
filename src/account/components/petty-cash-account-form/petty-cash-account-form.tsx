import { OpeningBalanceFields } from '@/account/components/opening-balance-fields';
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
import { useTranslation } from 'react-i18next';
import type {
  IPettyCashAccountFormValues,
  PettyCashAccountFormProps,
} from './types';
import { usePettyCashAccountFormValidation } from './validation';

const defaultInitialValues: IPettyCashAccountFormValues = {
  name: '',
  currencyCode: '',
  createWithoutOpeningBalance: false,
  openingBalance: '',
  openingDate: '',
  exchangeRate: null,
  isSubAccount: false,
};

export function PettyCashAccountForm({
  accountingCurrencyCode,
  currencies,
  officialExchangeRate,
  initialValues,
  loading = false,
  disabled = false,
  onExchangeRateContextChange,
  onSubmit,
}: Readonly<PettyCashAccountFormProps>) {
  const { t } = useTranslation<'ledger-accounts'>('ledger-accounts');

  const validationSchema = usePettyCashAccountFormValidation(
    accountingCurrencyCode,
    officialExchangeRate
  );

  const handleSubmit = (values: IPettyCashAccountFormValues) =>
    onSubmit(values);

  const formik = useFormik<IPettyCashAccountFormValues>({
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

  const handleCreateWithoutOpeningBalanceChange = (checked: boolean) => {
    void formik.setFieldValue('createWithoutOpeningBalance', checked);
    if (checked) {
      void formik.setFieldValue('exchangeRate', null);
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
  const create_as_sub_account_label = t('create_as_sub_account_label');
  const create_account_text = t('create_account_text');

  return (
    <form
      className="w-full max-w-2xl"
      noValidate
      onSubmit={formik.handleSubmit}
    >
      <FieldSet disabled={disabled || loading}>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_1fr]">
            <CurrencySelect
              currencies={currencies}
              displayCode
              error={getErrorMessage('currencyCode')}
              label={currency_label}
              onChange={handleCurrencyChange}
              value={formik.values.currencyCode}
            />

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

          <OpeningBalanceFields
            accountingCurrencyCode={accountingCurrencyCode}
            createWithoutOpeningBalance={
              formik.values.createWithoutOpeningBalance
            }
            currencyCode={formik.values.currencyCode}
            disabled={disabled || loading}
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
            <Label htmlFor="isSubAccount">{create_as_sub_account_label}</Label>
          </Field>

          <Field>
            <Button
              className="w-full sm:ml-auto sm:w-auto"
              disabled={disabled}
              loading={loading}
              type="submit"
            >
              {create_account_text}
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
