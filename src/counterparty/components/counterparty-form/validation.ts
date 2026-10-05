import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

export function useCounterpartyFormValidation() {
  const { t } = useTranslation(['counterparty']);

  return useMemo(() => {
    return yup.object({
      name: yup.string().required(t('counterparty:name_required')),
      type: yup
        .string()
        .oneOf(
          ['individual', 'organization'],
          t('counterparty:type_invalid_text')
        )
        .required(t('counterparty:type_required')),
    });
  }, [t]);
}
