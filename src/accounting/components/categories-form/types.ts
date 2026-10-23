export type UCategoryKind = 'income' | 'expense';

export type UCategoryGroup =
  | 'services'
  | 'employment'
  | 'grants'
  | 'gifts'
  | 'direct_costs'
  | 'rent_utilities'
  | 'bank_charges'
  | 'interest';

export interface ICategoryGroup {
  id: UCategoryGroup;
  name: string;
}

export interface ICategory {
  id: string;
  parentId: UCategoryGroup;
  name: string;
  selected: boolean;
}

export interface ICategoriesFormValues {
  categories: ICategory[];
}

export interface ICategoryDraft {
  parentId: string;
  name: string;
}

export interface CategoriesFormProps {
  kind: UCategoryKind;
  id?: string;
  initialValues?: ICategoriesFormValues;
  disabled?: boolean;
  onSubmit?: (values: ICategoriesFormValues) => void;
}

export interface CreateCategoryFormProps {
  kind: UCategoryKind;
  groups: ICategoryGroup[];
  categories: ICategory[];
  disabled?: boolean;
  onSubmit: (values: ICategoryDraft) => void;
  onCancel: () => void;
}
