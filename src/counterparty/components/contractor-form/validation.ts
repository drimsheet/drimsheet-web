import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

export function useContractorFormValidation() {
  const { t } = useTranslation(['counterparty']);

  return useMemo(() => {
    return yup.object({
      name: yup.string().required(t('counterparty:legal_name_required')),
      type: yup
        .string()
        .oneOf(
          ['individual', 'organization'],
          t('counterparty:type_invalid_text')
        )
        .required(t('counterparty:type_required')),
      displayName: yup.string().optional(),
      address: yup.object({
        line1: yup.string().required(t('counterparty:address_line1_required')),
        line2: yup.string().optional(),
        city: yup.string().required(t('counterparty:city_required')),
        region: yup.string().optional(),
        postalCode: yup.string().optional(),
        countryCode: yup.string().required(t('counterparty:country_required')),
      }),
    });
  }, [t]);
}
