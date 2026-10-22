import { EPeriodUnit } from '@/shared/lib/api/Api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import financialYearFormHelpers from './helper';

export function useFinancialYearFormValidation(maxFiscalMonths: number) {
  const { t } = useTranslation('accounting');

  return useMemo(
    () =>
      yup.object({
        name: yup
          .string()
          .trim()
          .required(t('financial_year_name_required_error')),
        startDate: yup
          .string()
          .required(t('financial_year_start_required_error'))
          .test('date', t('financial_year_start_required_error'), (value) =>
            financialYearFormHelpers.isValidDate(value ?? '')
          ),
        endDate: yup
          .string()
          .required(t('financial_year_end_required_error'))
          .test(
            'range',
            t('financial_year_range_error', { months: maxFiscalMonths }),
            function (value) {
              return financialYearFormHelpers.isValidRange(
                this.parent.startDate,
                value ?? '',
                maxFiscalMonths
              );
            }
          ),
        unit: yup
          .string()
          .required(t('financial_year_unit_required_error'))
          .oneOf(
            Object.values(EPeriodUnit),
            t('financial_year_unit_required_error')
          ),
        periods: yup
          .array()
          .of(
            yup.object({
              name: yup
                .string()
                .trim()
                .required(t('financial_period_name_required_error')),
            })
          )
          .min(1, t('financial_year_dates_hint')),
      }),
    [maxFiscalMonths, t]
  );
}
