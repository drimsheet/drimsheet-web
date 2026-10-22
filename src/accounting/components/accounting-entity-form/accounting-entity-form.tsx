import { CountryComboBox } from '@/shared/components/country-combobox';
import { CurrencySelect } from '@/shared/components/currency-select';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldSet,
} from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { useFieldErrorMessage } from '@/shared/hooks/use-field-error-message';
import { EAccountingEntityType } from '@/shared/lib/api/Api';
import { useFormik } from 'formik';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import accountingEntityFormHelpers from './helper';
import type {
  AccountingEntityFormProps,
  IAccountingEntityFormValues,
} from './types';
import { useAccountingEntityFormValidation } from './validation';

export function AccountingEntityForm({
  id,
  currencies,
  jurisdictions,
  initialValues,
  disabled = false,
  onSubmit,
}: Readonly<AccountingEntityFormProps>) {
  const { t } = useTranslation('accounting');
  const fieldId = useId();

  const validationSchema = useAccountingEntityFormValidation({
    currencies,
    jurisdictions,
  });

  const formik = useFormik<IAccountingEntityFormValues>({
    initialValues:
      accountingEntityFormHelpers.createInitialValues(initialValues),
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit?.(values);
    },
  });

  const getErrorMessage = useFieldErrorMessage({
    errors: formik.errors,
    touched: formik.touched,
  });

  const typeErrors = getErrorMessage('entityType');
  const nameErrors = getErrorMessage('name');
  const isDisabled = disabled || formik.isSubmitting;

  const type_label = t('entity_type_label');
  const type_placeholder = t('entity_type_placeholder');
  const individual_label = t('entity_type_individual_label');
  const sole_trader_label = t('entity_type_sole_trader_label');
  const company_label = t('entity_type_company_label');
  const name_label = t('entity_name_label');
  const name_placeholder = t('entity_name_placeholder');
  const country_label = t('entity_country_label');
  const currency_label = t('entity_currency_label');

  return (
    <form id={id} onSubmit={formik.handleSubmit} noValidate>
      <FieldSet disabled={isDisabled}>
        <FieldGroup className="gap-5">
          <Field data-invalid={typeErrors.length > 0}>
            <Label htmlFor={`${fieldId}-type`}>{type_label}</Label>
            <Select
              value={formik.values.entityType}
              disabled={isDisabled}
              onValueChange={(value) =>
                formik.setFieldValue('entityType', value)
              }
            >
              <SelectTrigger
                id={`${fieldId}-type`}
                className="w-full"
                aria-invalid={typeErrors.length > 0}
                aria-describedby={
                  typeErrors.length ? `${fieldId}-type-error` : undefined
                }
                onBlur={() => formik.setFieldTouched('entityType', true)}
              >
                <SelectValue placeholder={type_placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={EAccountingEntityType.Individual}>
                    {individual_label}
                  </SelectItem>
                  <SelectItem value={EAccountingEntityType.SoleTrader}>
                    {sole_trader_label}
                  </SelectItem>
                  <SelectItem value={EAccountingEntityType.PrivateCompany}>
                    {company_label}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldError id={`${fieldId}-type-error`} errors={typeErrors} />
          </Field>
          <Field data-invalid={nameErrors.length > 0}>
            <Label htmlFor={`${fieldId}-name`}>{name_label}</Label>
            <Input
              id={`${fieldId}-name`}
              name="name"
              placeholder={name_placeholder}
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={nameErrors.length > 0}
              aria-describedby={
                nameErrors.length ? `${fieldId}-name-error` : undefined
              }
            />
            <FieldError id={`${fieldId}-name-error`} errors={nameErrors} />
          </Field>
          <CountryComboBox
            id={`${fieldId}-country`}
            label={country_label}
            value={formik.values.jurisdictionCode}
            jurisdictions={jurisdictions}
            onChange={(value) =>
              formik.setFieldValue('jurisdictionCode', value)
            }
            error={getErrorMessage('jurisdictionCode')}
            disabled={isDisabled}
          />
          <CurrencySelect
            id={`${fieldId}-currency`}
            label={currency_label}
            value={formik.values.functionalCurrencyCode}
            currencies={currencies}
            onChange={(value) =>
              formik.setFieldValue('functionalCurrencyCode', value)
            }
            error={getErrorMessage('functionalCurrencyCode')}
            disabled={isDisabled}
          />
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
