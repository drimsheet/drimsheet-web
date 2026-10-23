import type { TFunction } from 'i18next';
import type {
  ICategoriesFormValues,
  ICategoryGroup,
  UCategoryKind,
} from './types';

function createGroups(
  t: TFunction<'accounting'>,
  kind: UCategoryKind
): ICategoryGroup[] {
  if (kind === 'expense')
    return [
      { id: 'direct_costs', name: t('expense_categories_direct_costs_label') },
      {
        id: 'rent_utilities',
        name: t('expense_categories_rent_utilities_label'),
      },
      { id: 'bank_charges', name: t('expense_categories_bank_charges_label') },
      { id: 'interest', name: t('expense_categories_interest_label') },
    ];

  return [
    { id: 'services', name: t('income_categories_services_label') },
    { id: 'employment', name: t('income_categories_employment_label') },
    { id: 'grants', name: t('income_categories_grants_label') },
    { id: 'gifts', name: t('income_categories_gifts_label') },
  ];
}

function createInitialValues(
  groups: ICategoryGroup[],
  defaultName: (name: string) => string,
  initialValues?: ICategoriesFormValues
): ICategoriesFormValues {
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

const categoriesFormHelpers = Object.freeze({
  createGroups,
  createInitialValues,
});

export default categoriesFormHelpers;
