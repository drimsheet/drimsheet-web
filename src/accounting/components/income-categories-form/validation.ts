import type { TFunction } from 'i18next';
import * as yup from 'yup';
import type { IIncomeCategory, IIncomeCategoryGroup } from './types';

export function incomeCategorySchema(
  t: TFunction<'accounting'>,
  groups: IIncomeCategoryGroup[],
  categories: IIncomeCategory[]
) {
  return yup.object({
    parentId: yup
      .string()
      .required(t('income_category_parent_required_error'))
      .oneOf(
        groups.map(({ id }) => id),
        t('income_category_parent_required_error')
      ),
    name: yup
      .string()
      .trim()
      .required(t('income_category_name_required_error'))
      .test(
        'unique-sibling',
        t('income_category_name_duplicate_error'),
        function (name) {
          return !categories.some(
            (category) =>
              category.parentId === this.parent.parentId &&
              category.name.trim().toLocaleLowerCase() ===
                name?.toLocaleLowerCase()
          );
        }
      ),
  });
}
