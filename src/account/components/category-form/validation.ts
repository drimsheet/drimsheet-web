import type { TFunction } from 'i18next';
import * as yup from 'yup';

export function categoryFormSchema(t: TFunction<'ledger-accounts'>) {
  return yup.object({
    name: yup.string().trim().required(t('categories_name_required')),
  });
}
