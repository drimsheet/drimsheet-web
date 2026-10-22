import { DateInput } from '@/shared/components/date-input';
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
import { EPeriodUnit, type UPeriodUnit } from '@/shared/lib/api/Api';
import { useFormik } from 'formik';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import financialYearFormHelpers from './helper';
import { AccountingPeriods } from './parts/accounting-periods';
import type { FinancialYearFormProps, IFinancialYearFormValues } from './types';
import { useFinancialYearFormValidation } from './validation';

export function FinancialYearForm({
  id,
  currentDate,
  maxFiscalMonths = 18,
  initialValues,
  disabled = false,
  onSubmit,
}: Readonly<FinancialYearFormProps>) {
  const { t } = useTranslation('accounting');
  const fieldId = useId();
  const validationSchema = useFinancialYearFormValidation(maxFiscalMonths);

  const createPeriodName = (unit: UPeriodUnit, index: number) =>
    t(`financial_period_${unit}_default`, { index });

  const formik = useFormik<IFinancialYearFormValues>({
    initialValues: financialYearFormHelpers.createInitialValues(
      currentDate,
      createPeriodName,
      maxFiscalMonths,
      initialValues
    ),
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit?.(values);
    },
  });

  const getError = useFieldErrorMessage({
    errors: formik.errors,
    touched: formik.touched,
  });

  const nameErrors = getError('name');
  const startErrors = getError('startDate');
  const endErrors = getError('endDate');
  const unitErrors = getError('unit');
  const isDisabled = disabled || formik.isSubmitting;

  const handlePeriodSettingsChange = (
    patch: Partial<
      Pick<IFinancialYearFormValues, 'startDate' | 'endDate' | 'unit'>
    >
  ) => {
    const next = { ...formik.values, ...patch };

    const previous =
      next.unit === formik.values.unit ? formik.values.periods : [];

    const periods = financialYearFormHelpers.createPeriods(
      next,
      createPeriodName,
      maxFiscalMonths,
      previous
    );

    void formik.setValues({ ...next, periods });
    void formik.setTouched({ ...formik.touched, periods: [] }, false);
  };

  const handleStartChange = (startDate: string) =>
    handlePeriodSettingsChange({ startDate });

  const handleEndChange = (endDate: string) =>
    handlePeriodSettingsChange({ endDate });

  const handleUnitChange = (unit: UPeriodUnit) =>
    handlePeriodSettingsChange({ unit });

  const name_label = t('financial_year_name_label');

  const name_placeholder = t('financial_year_name_placeholder', {
    year: currentDate.slice(0, 4),
  });

  const start_label = t('financial_year_start_label');
  const end_label = t('financial_year_end_label');
  const date_placeholder = t('financial_year_date_placeholder');
  const unit_label = t('financial_year_unit_label');
  const unit_placeholder = t('financial_year_unit_placeholder');

  return (
    <form id={id} onSubmit={formik.handleSubmit} noValidate>
      <FieldSet disabled={isDisabled}>
        <FieldGroup className="gap-5">
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
          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={startErrors.length > 0}>
              <Label htmlFor={`${fieldId}-start`}>{start_label}</Label>
              <DateInput
                id={`${fieldId}-start`}
                aria-label={start_label}
                value={formik.values.startDate}
                onValueChange={handleStartChange}
                onBlur={() => formik.setFieldTouched('startDate', true)}
                placeholder={date_placeholder}
                disabled={isDisabled}
                aria-invalid={startErrors.length > 0}
                aria-describedby={
                  startErrors.length ? `${fieldId}-start-error` : undefined
                }
              />
              <FieldError id={`${fieldId}-start-error`} errors={startErrors} />
            </Field>
            <Field data-invalid={endErrors.length > 0}>
              <Label htmlFor={`${fieldId}-end`}>{end_label}</Label>
              <DateInput
                id={`${fieldId}-end`}
                aria-label={end_label}
                value={formik.values.endDate}
                onValueChange={handleEndChange}
                onBlur={() => formik.setFieldTouched('endDate', true)}
                placeholder={date_placeholder}
                disabled={isDisabled}
                aria-invalid={endErrors.length > 0}
                aria-describedby={
                  endErrors.length ? `${fieldId}-end-error` : undefined
                }
              />
              <FieldError id={`${fieldId}-end-error`} errors={endErrors} />
            </Field>
          </div>
          <Field data-invalid={unitErrors.length > 0}>
            <Label htmlFor={`${fieldId}-unit`}>{unit_label}</Label>
            <Select
              value={formik.values.unit}
              onValueChange={handleUnitChange}
              disabled={isDisabled}
            >
              <SelectTrigger
                id={`${fieldId}-unit`}
                className="w-full"
                onBlur={() => formik.setFieldTouched('unit', true)}
                aria-invalid={unitErrors.length > 0}
                aria-describedby={
                  unitErrors.length ? `${fieldId}-unit-error` : undefined
                }
              >
                <SelectValue placeholder={unit_placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.values(EPeriodUnit).map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {t(`financial_year_group_${unit}_label`)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldError id={`${fieldId}-unit-error`} errors={unitErrors} />
          </Field>
          <AccountingPeriods
            periods={formik.values.periods}
            unit={formik.values.unit}
            currentDate={currentDate}
            disabled={isDisabled}
            getError={getError}
            onNameChange={(index, value) =>
              formik.setFieldValue(`periods.${index}.name`, value)
            }
            onNameBlur={(index) =>
              formik.setFieldTouched(`periods.${index}.name`, true)
            }
          />
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
