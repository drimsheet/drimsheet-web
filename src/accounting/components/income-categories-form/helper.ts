import type { TFunction } from 'i18next';
import type {
  IIncomeCategoriesFormValues,
  IIncomeCategoryGroup,
} from './types';

function createGroups(t: TFunction<'accounting'>): IIncomeCategoryGroup[] {
  return [
    { id: 'services', name: t('income_categories_services_label') },
    { id: 'employment', name: t('income_categories_employment_label') },
    { id: 'grants', name: t('income_categories_grants_label') },
    { id: 'gifts', name: t('income_categories_gifts_label') },
  ];
}

function createInitialValues(
  groups: IIncomeCategoryGroup[],
  defaultName: (name: string) => string,
  initialValues?: IIncomeCategoriesFormValues
): IIncomeCategoriesFormValues {
  if (initialValues) return initialValues;

  return {
    categories: groups.map((group) => ({
      id: `${group.id}-default`,
      parentId: group.id,
      name: defaultName(group.name),
      selected: true,
    })),
  };
}

const incomeCategoriesFormHelpers = Object.freeze({
  createGroups,
  createInitialValues,
});

export default incomeCategoriesFormHelpers;
