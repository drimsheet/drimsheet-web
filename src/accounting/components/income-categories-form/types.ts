export type UIncomeCategoryGroup =
  | 'services'
  | 'employment'
  | 'grants'
  | 'gifts';

export interface IIncomeCategoryGroup {
  id: UIncomeCategoryGroup;
  name: string;
}

export interface IIncomeCategory {
  id: string;
  parentId: UIncomeCategoryGroup;
  name: string;
  selected: boolean;
}

export interface IIncomeCategoriesFormValues {
  categories: IIncomeCategory[];
}

export interface IIncomeCategoryDraft {
  parentId: string;
  name: string;
}

export interface IncomeCategoriesFormProps {
  id?: string;
  initialValues?: IIncomeCategoriesFormValues;
  disabled?: boolean;
  onSubmit?: (values: IIncomeCategoriesFormValues) => void;
}

export interface CreateIncomeCategoryFormProps {
  groups: IIncomeCategoryGroup[];
  categories: IIncomeCategory[];
  disabled?: boolean;
  onSubmit: (values: IIncomeCategoryDraft) => void;
  onCancel: () => void;
}
