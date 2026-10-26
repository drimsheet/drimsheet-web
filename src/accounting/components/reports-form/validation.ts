import { EReportingIntervalUnit } from '@/shared/lib/api/Api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import reportsFormHelpers from './helper';
import type { IReportsFormFields, ReportsFormProps } from './types';

export function useReportsFormValidation({
  currencies,
  financialYear,
  maxFiscalMonths = 18,
}: Pick<ReportsFormProps, 'currencies' | 'financialYear' | 'maxFiscalMonths'>) {
  const { t } = useTranslation('accounting');

  return useMemo(
    () =>
      yup.object({
        name: yup.string().trim().required(t('reports_name_required_error')),
        currencyCode: yup
          .string()
          .required(t('reports_currency_required_error'))
          .oneOf(
            currencies.map(({ code }) => code),
            t('reports_currency_required_error')
          ),
        unit: yup
          .string()
          .required(t('reports_unit_required_error'))
          .oneOf(
            Object.values(EReportingIntervalUnit),
            t('reports_unit_required_error')
          ),
        periodNames: yup.object().test('period-names', function () {
          const values = this.parent as IReportsFormFields;

          const periods = reportsFormHelpers.createPeriods(
            values,
            financialYear,
            (unit, index) => t(`financial_period_${unit}_default`, { index }),
            maxFiscalMonths
          );

          if (!periods.length) {
            return this.createError({
              message: t('financial_year_dates_hint'),
            });
          }

          const errors = periods
            .filter(({ name }) => !name.trim())
            .map((period) =>
              this.createError({
                path: `${this.path}.${reportsFormHelpers.periodKey(values.unit, period)}`,
                message: t('financial_period_name_required_error'),
              })
            );

          return errors.length ? new yup.ValidationError(errors) : true;
        }),
      }),
    [currencies, financialYear, maxFiscalMonths, t]
  );
}
