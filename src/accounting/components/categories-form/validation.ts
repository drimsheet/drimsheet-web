import type { TFunction } from 'i18next';
import * as yup from 'yup';
import type { ICategory, ICategoryGroup } from './types';

export function categorySchema(
  t: TFunction<'accounting'>,
  groups: ICategoryGroup[],
  categories: ICategory[]
) {
  return yup.object({
    parentId: yup
      .string()
      .required(t('category_parent_required_error'))
      .oneOf(
        groups.map(({ id }) => id),
        t('category_parent_required_error')
      ),
    name: yup
      .string()
      .trim()
      .required(t('category_name_required_error'))
      .test(
        'unique-sibling',
        t('category_name_duplicate_error'),
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
