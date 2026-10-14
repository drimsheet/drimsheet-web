import {
  ETSupportedExpenseAccountBehavior,
  ETSupportedRevenueAccountBehavior,
} from '@/shared/lib/api/Api';
import type { TFunction } from 'i18next';
import * as yup from 'yup';

export function categoryFormSchema(t: TFunction<'ledger-accounts'>) {
  return yup.object({
    name: yup.string().trim().required(t('categories_name_required')),
    type: yup
      .string()
      .oneOf(['revenue', 'expense'], t('categories_type_required'))
      .required(t('categories_type_required')),
    behavior: yup
      .string()
      .when('type', {
        is: 'revenue',
        then: (schema) =>
          schema.oneOf(
            Object.values(ETSupportedRevenueAccountBehavior),
            t('categories_behavior_required')
          ),
        otherwise: (schema) =>
          schema.oneOf(
            Object.values(ETSupportedExpenseAccountBehavior),
            t('categories_behavior_required')
          ),
      })
      .required(t('categories_behavior_required')),
  });
}
