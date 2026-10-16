import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

export function useProfileFormValidation() {
  const { t } = useTranslation('user');

  return useMemo(
    () =>
      yup.object({
        firstName: yup
          .string()
          .trim()
          .required(t('profile_first_name_required_text')),
        lastName: yup
          .string()
          .trim()
          .required(t('profile_last_name_required_text')),
      }),
    [t]
  );
}
