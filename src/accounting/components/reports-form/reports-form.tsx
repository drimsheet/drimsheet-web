import { PeriodNameFields } from '@/accounting/components/period-name-fields';
import { accountingPeriodUtils } from '@/accounting/lib/utils/accounting-periods';
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
import { EPeriodUnit, type UPeriodUnit } from '@/shared/lib/api/Api';
import { useFormik } from 'formik';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import reportsFormHelpers from './helper';
import type { IReportsFormFields, ReportsFormProps } from './types';
import { useReportsFormValidation } from './validation';

export function ReportsForm({
  id,
  financialYear,
  currencies,
  currentDate,
  maxFiscalMonths = 18,
  initialValues,
  disabled = false,
  onSubmit,
}: Readonly<ReportsFormProps>) {
  const { t, i18n } = useTranslation('accounting');
  const fieldId = useId();

  const validationSchema = useReportsFormValidation({
    financialYear,
    currencies,
    maxFiscalMonths,
  });

  const createPeriodName = (unit: UPeriodUnit, index: number) =>
    t(`financial_period_${unit}_default`, { index });

  const formik = useFormik<IReportsFormFields>({
    initialValues: reportsFormHelpers.createInitialValues(initialValues),
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit?.({
        name: values.name,
        currencyCode: values.currencyCode,
        unit: values.unit,
        periods: reportsFormHelpers.createPeriods(
          values,
          financialYear,
          createPeriodName,
          maxFiscalMonths
        ),
      });
    },
  });

  const getError = useFieldErrorMessage({
    errors: formik.errors,
    touched: formik.touched,
  });

  const periods = reportsFormHelpers.createPeriods(
    formik.values,
    financialYear,
    createPeriodName,
    maxFiscalMonths
  );

  const nameErrors = getError('name');
  const unitErrors = getError('unit');
  const isDisabled = disabled || formik.isSubmitting;

  const hasValidDates = accountingPeriodUtils.isValidRange(
    financialYear.startDate,
    financialYear.endDate,
    maxFiscalMonths
  );

  const getPeriodFieldName = (index: number) =>
    `periodNames.${reportsFormHelpers.periodKey(formik.values.unit, periods[index])}`;

  const handlePeriodNameChange = (index: number, value: string) =>
    formik.setFieldValue(getPeriodFieldName(index), value);

  const handlePeriodNameBlur = (index: number) =>
    formik.setFieldTouched(getPeriodFieldName(index), true);

  const getPeriodError = (index: number) => getError(getPeriodFieldName(index));

  const year_label = t('reports_financial_year_label');
  const name_label = t('reports_name_label');

  const name_placeholder = t('reports_name_placeholder', {
    name: financialYear.name,
  });

  const currency_label = t('reports_currency_label');
  const unit_label = t('reports_unit_label');
  const unit_placeholder = t('reports_unit_placeholder');
  const periods_title = t('reports_periods_title');
  const invalid_year_text = t('financial_year_dates_hint');

  return (
    <form id={id} onSubmit={formik.handleSubmit} noValidate>
      <FieldSet disabled={isDisabled}>
        <FieldGroup className="gap-5">
          <section
            aria-label={year_label}
            className="flex min-w-0 flex-col gap-1 rounded-md bg-muted p-4"
          >
            <h2 className="text-xs text-muted-foreground">{year_label}</h2>
            <p className="break-words text-sm font-semibold">
              {financialYear.name}
            </p>
            {hasValidDates && (
              <p className="text-xs tabular-nums text-muted-foreground">
                <time dateTime={financialYear.startDate}>
                  {accountingPeriodUtils.formatDate(
                    financialYear.startDate,
                    i18n.language
                  )}
                </time>
                {' – '}
                <time dateTime={financialYear.endDate}>
                  {accountingPeriodUtils.formatDate(
                    financialYear.endDate,
                    i18n.language
                  )}
                </time>
              </p>
            )}
            {!hasValidDates && (
              <p className="text-sm text-muted-foreground">
                {invalid_year_text}
              </p>
            )}
          </section>
          <Field data-invalid={nameErrors.length > 0}>
            <Label htmlFor={`${fieldId}-name`}>{name_label}</Label>
            <Input
              id={`${fieldId}-name`}
              name="name"
              value={formik.values.name}
              placeholder={name_placeholder}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={nameErrors.length > 0}
              aria-describedby={
                nameErrors.length ? `${fieldId}-name-error` : undefined
              }
            />
            <FieldError id={`${fieldId}-name-error`} errors={nameErrors} />
          </Field>
          <CurrencySelect
            id={`${fieldId}-currency`}
            label={currency_label}
            value={formik.values.currencyCode}
            currencies={currencies}
            disabled={isDisabled}
            onChange={(value) => formik.setFieldValue('currencyCode', value)}
            error={getError('currencyCode')}
          />
          <Field data-invalid={unitErrors.length > 0}>
            <Label htmlFor={`${fieldId}-unit`}>{unit_label}</Label>
            <Select
              value={formik.values.unit}
              onValueChange={(value) => formik.setFieldValue('unit', value)}
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
                      {t(`reports_group_${unit}_label`)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldError id={`${fieldId}-unit-error`} errors={unitErrors} />
          </Field>
          <PeriodNameFields
            title={periods_title}
            periods={periods}
            unit={formik.values.unit}
            currentDate={currentDate}
            disabled={isDisabled}
            getError={getPeriodError}
            onNameChange={handlePeriodNameChange}
            onNameBlur={handlePeriodNameBlur}
          />
          <FieldError errors={getError('periodNames')} />
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
