import { EAccountingEntityType } from '@/shared/lib/api/Api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import type { AccountingEntityFormProps } from './types';

export function useAccountingEntityFormValidation({
  currencies,
  jurisdictions,
}: Pick<AccountingEntityFormProps, 'currencies' | 'jurisdictions'>) {
  const { t } = useTranslation('accounting');

  return useMemo(
    () =>
      yup.object({
        entityType: yup
          .string()
          .required(t('entity_type_required_error'))
          .oneOf(
            Object.values(EAccountingEntityType),
            t('entity_type_required_error')
          ),
        name: yup.string().trim().required(t('entity_name_required_error')),
        jurisdictionCode: yup
          .string()
          .required(t('entity_country_required_error'))
          .oneOf(
            jurisdictions.map(({ code }) => code),
            t('entity_country_required_error')
          ),
        functionalCurrencyCode: yup
          .string()
          .required(t('entity_currency_required_error'))
          .oneOf(
            currencies.map(({ code }) => code),
            t('entity_currency_required_error')
          ),
      }),
    [currencies, jurisdictions, t]
  );
}
