import type { TFunction } from 'i18next';
import * as yup from 'yup';

export function createEntityNameSchema(t: TFunction<'accounting'>) {
  return yup.object({
    name: yup.string().trim().required(t('details_name_required')),
  });
}
