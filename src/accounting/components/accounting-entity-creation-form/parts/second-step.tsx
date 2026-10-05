import type { AccountingEntityCreationFormStep2Props } from '@/accounting/components/accounting-entity-creation-form/types';
import { FiscalDateSelect } from '@/accounting/components/fiscal-date-select';
import { useFiscalYearWarning } from '@/accounting/hooks/use-fiscal-year-warning';
import { AlertTitle, WarningAlert } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import { CurrencySelect } from '@/shared/components/currency-select';
import { FieldError, FieldGroup, FieldSet } from '@/shared/components/field';
import { dateUtils } from '@/shared/lib/utils/date';
import { AlertCircleIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function AccountingEntityCreationFormStep2({
  formik,
  getErrorMessage,
  getFiscalYearStartErrorStr,
  getFiscalYearEndErrorStr,
  currencies,
  onNext,
  onBack,
}: Readonly<AccountingEntityCreationFormStep2Props>) {
  const { t } = useTranslation('accounting');

  const isComplete =
    !!formik.values.functionalCurrency &&
    !!formik.values.reportingCurrency &&
    !!formik.values.fiscalYearStart &&
    !!formik.values.fiscalYearEnd &&
    !formik.errors.functionalCurrency &&
    !formik.errors.reportingCurrency &&
    !formik.errors.fiscalYearStart &&
    !formik.errors.fiscalYearEnd;

  const { reportingCurrency, fiscalYearStart, fiscalYearEnd, countryCode } =
    formik.values;

  const { expectedStart, showFiscalYearWarning } = useFiscalYearWarning(
    countryCode,
    fiscalYearStart
  );

  const formattedExpectedStart = dateUtils.formatFiscalDate(
    expectedStart.month,
    expectedStart.day
  );

  const fiscalYearError =
    getFiscalYearStartErrorStr() || getFiscalYearEndErrorStr();

  const reporting_currency_label = t('reporting_currency_label');
  const fiscal_year_start_label = t('fiscal_year_start_label');
  const fiscal_year_end_label = t('fiscal_year_end_label');

  const fiscal_year_start_warning = t('fiscal_year_start_warning', {
    expectedStart: formattedExpectedStart,
  });

  const back_button_label = t('back_button_label');
  const next_button_label = t('next_button_label');

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <CurrencySelect
          label={reporting_currency_label}
          value={reportingCurrency}
          currencies={currencies}
          onChange={(val) => formik.setFieldValue('reportingCurrency', val)}
          error={getErrorMessage('reportingCurrency')}
        />

        <FieldSet>
          <div className="grid grid-cols-2 gap-6 mb-[-10px]">
            <FiscalDateSelect
              label={fiscal_year_start_label}
              value={fiscalYearStart}
              countryCode={countryCode}
              onChange={(val) => {
                const oldStart = formik.values.fiscalYearStart;
                const oldEnd = formik.values.fiscalYearEnd;
                formik.setFieldTouched('fiscalYearStart', true);
                formik.setFieldValue('fiscalYearStart', val);
                if (oldStart && oldEnd) {
                  const newEnd = dateUtils.shiftDateByDistance(
                    val,
                    oldStart,
                    oldEnd
                  );

                  formik.setFieldValue('fiscalYearEnd', newEnd);
                }
              }}
            />
            <FiscalDateSelect
              label={fiscal_year_end_label}
              value={fiscalYearEnd}
              countryCode={countryCode}
              onChange={(val) => {
                formik.setFieldTouched('fiscalYearEnd', true);
                formik.setFieldValue('fiscalYearEnd', val);
              }}
            />
          </div>
          <FieldError
            errors={
              fiscalYearError ? [{ message: fiscalYearError }] : undefined
            }
          />
        </FieldSet>

        {showFiscalYearWarning && (
          <WarningAlert>
            <AlertCircleIcon />
            <AlertTitle>{fiscal_year_start_warning}</AlertTitle>
          </WarningAlert>
        )}
      </FieldGroup>
      <div className="flex justify-between mt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft />
          {back_button_label}
        </Button>
        <Button type="button" onClick={onNext} disabled={!isComplete}>
          {next_button_label}
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

export { AccountingEntityCreationFormStep2 };
