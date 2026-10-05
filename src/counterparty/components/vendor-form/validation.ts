import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

export function useVendorFormValidation() {
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
      address: yup
        .object({
          line1: yup.string().optional(),
          line2: yup.string().optional(),
          city: yup.string().optional(),
          region: yup.string().optional(),
          postalCode: yup.string().optional(),
          countryCode: yup.string().optional(),
        })
        .test(
          'address-partial-validation',
          t('counterparty:address_invalid_text'),
          function (value) {
            if (!value) return true;

            const { line1, line2, city, region, postalCode, countryCode } =
              value;

            const hasAny = Boolean(
              line1 || line2 || city || region || postalCode || countryCode
            );

            if (hasAny) {
              const errors: yup.ValidationError[] = [];
              if (!line1) {
                errors.push(
                  this.createError({
                    path: `${this.path}.line1`,
                    message: t('counterparty:address_line1_required'),
                  })
                );
              }

              if (!city) {
                errors.push(
                  this.createError({
                    path: `${this.path}.city`,
                    message: t('counterparty:city_required'),
                  })
                );
              }

              if (!countryCode) {
                errors.push(
                  this.createError({
                    path: `${this.path}.countryCode`,
                    message: t('counterparty:country_required'),
                  })
                );
              }

              if (errors.length > 0) {
                return new yup.ValidationError(errors);
              }
            }

            return true;
          }
        ),
    });
  }, [t]);
}
