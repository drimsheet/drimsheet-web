import type { IJurisdictionDto } from '@/shared/lib/api/Api';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import type { IAccountingEntityFormValues } from './types';

const DEFAULT_MAX_FISCAL_MONTHS = 23;

interface IAccountingEntityCreationValidationMessages {
  nameRequired: string;
  entityTypeRequired: string;
  countryRequired: string;
  functionalCurrencyRequired: string;
  reportingCurrencyRequired: string;
  fiscalYearStartRequired: string;
  fiscalYearEndRequired: string;
  fiscalYearStartTooOld: string;
  fiscalYearMinDuration: string;
  getFiscalYearMaxDuration: (
    maxFiscalMonths: number,
    country: string
  ) => string;
}

function createAccountingEntityCreationFormValidation(
  jurisdictions: IJurisdictionDto[],
  messages: IAccountingEntityCreationValidationMessages
) {
  return yup.object({
    name: yup.string().trim().required(messages.nameRequired),
    entityType: yup.string().required(messages.entityTypeRequired),
    countryCode: yup.string().required(messages.countryRequired),
    functionalCurrency: yup
      .string()
      .required(messages.functionalCurrencyRequired),
    reportingCurrency: yup
      .string()
      .required(messages.reportingCurrencyRequired),
    fiscalYearStart: yup
      .date()
      .nullable()
      .required(messages.fiscalYearStartRequired)
      .test('is-recent', messages.fiscalYearStartTooOld, function (value) {
        if (!value) return true;

        return !dayjs(value).isBefore(dayjs().subtract(2, 'years'), 'day');
      }),
    fiscalYearEnd: yup
      .date()
      .nullable()
      .required(messages.fiscalYearEndRequired)
      .test(
        'is-valid-min-duration',
        messages.fiscalYearMinDuration,
        function (value) {
          const { fiscalYearStart } = this
            .parent as IAccountingEntityFormValues;

          if (!fiscalYearStart || !value) return true;

          const minimumEndDate = dayjs(fiscalYearStart)
            .add(1, 'month')
            .subtract(1, 'day');

          return !dayjs(value).isBefore(minimumEndDate, 'day');
        }
      )
      .test('is-valid-max-duration', function (value) {
        const { countryCode, fiscalYearStart } = this
          .parent as IAccountingEntityFormValues;

        if (!fiscalYearStart || !value) return true;

        const jurisdiction = jurisdictions.find(
          ({ code }) => code === countryCode
        );

        const maxFiscalMonths =
          jurisdiction?.maxFiscalMonths ?? DEFAULT_MAX_FISCAL_MONTHS;

        const country = jurisdiction?.name ?? countryCode;

        const maximumEndDate = dayjs(fiscalYearStart)
          .add(maxFiscalMonths, 'month')
          .subtract(1, 'day');

        if (!dayjs(value).isAfter(maximumEndDate, 'day')) return true;

        return this.createError({
          message: messages.getFiscalYearMaxDuration(maxFiscalMonths, country),
        });
      }),
  });
}

function useAccountingEntityCreationFormValidation(
  jurisdictions: IJurisdictionDto[]
) {
  const { t } = useTranslation('accounting');

  return useMemo(
    () =>
      createAccountingEntityCreationFormValidation(jurisdictions, {
        nameRequired: t('entity_name_required_text'),
        entityTypeRequired: t('entity_type_required_text'),
        countryRequired: t('country_required_text'),
        functionalCurrencyRequired: t('functional_currency_required_text'),
        reportingCurrencyRequired: t('reporting_currency_required_text'),
        fiscalYearStartRequired: t('fiscal_year_start_required_text'),
        fiscalYearEndRequired: t('fiscal_year_end_required_text'),
        fiscalYearStartTooOld: t('fiscal_year_start_too_old_text'),
        fiscalYearMinDuration: t('fiscal_year_min_duration_error'),
        getFiscalYearMaxDuration: (maxFiscalMonths, country) =>
          t('fiscal_year_max_duration_error', { country, maxFiscalMonths }),
      }),
    [jurisdictions, t]
  );
}

export {
  createAccountingEntityCreationFormValidation,
  useAccountingEntityCreationFormValidation,
};
