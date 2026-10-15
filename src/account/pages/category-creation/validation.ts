import type { TFunction } from 'i18next';
import * as yup from 'yup';
import type { ICategoryParentSelection } from './types';

export function categoryCreationSchema(
  t: TFunction<'ledger-accounts'>,
  parent: ICategoryParentSelection | null
) {
  return yup.object({
    type: yup
      .string()
      .oneOf(['revenue', 'expense'], t('categories_type_required'))
      .required(t('categories_type_required')),
    parentId: yup
      .string()
      .required(t('category_creation_parent_required'))
      .test(
        'selected-parent',
        t('category_creation_parent_required'),
        (value, context) =>
          !!parent &&
          value === parent.account.id &&
          parent.account.type === context.parent.type
      ),
    name: yup.string().trim().required(t('categories_name_required')),
    postingAccountName: yup
      .string()
      .trim()
      .test(
        'posting-name',
        t('category_creation_posting_name_required'),
        (value) => !parent || parent.account.isControlAccount || !!value
      )
      .test(
        'different-name',
        t('category_creation_posting_name_different'),
        (value) =>
          !parent ||
          parent.account.isControlAccount ||
          !value ||
          value.toLocaleLowerCase() !==
            parent.account.name.trim().toLocaleLowerCase()
      ),
  });
}
