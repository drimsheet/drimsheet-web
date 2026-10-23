import type { IChartOfAccountsNodeDto } from '@/shared/lib/api/Api';
import type { FormikProps } from 'formik';

export type UCategoryCreationType = 'revenue' | 'expense' | '';

export type TCategoryAccount = Pick<
  IChartOfAccountsNodeDto,
  'id' | 'name' | 'code' | 'type' | 'behavior' | 'isControlAccount' | 'status'
> & { children: TCategoryAccount[] };

export interface ICategoryCreationFormValues {
  type: UCategoryCreationType;
  parentId: string;
  name: string;
  postingAccountName: string;
}

export interface ICategoryParentSelection {
  account: TCategoryAccount;
  path: string[];
}

export interface CategoryCreationFormProps {
  form: FormikProps<ICategoryCreationFormValues>;
  parent: ICategoryParentSelection | null;
  accounts: TCategoryAccount[];
  loadingAccounts: boolean;
  accountsError: boolean;
  pending: boolean;
  error: boolean;
  onTypeChange: (value: string) => void;
  onParentChange: (id: string) => void;
  onPickerOpenChange: (open: boolean) => void;
  onCancel: () => void;
}

export interface CategoryParentPickerProps {
  type: UCategoryCreationType;
  parent: ICategoryParentSelection | null;
  accounts: TCategoryAccount[];
  loading: boolean;
  error: boolean;
  disabled: boolean;
  validationError?: string;
  onSelect: (id: string) => void;
  onOpenChange: (open: boolean) => void;
}

export interface AccountTreeNodeProps {
  account: TCategoryAccount;
}

export interface PromotionPreviewProps {
  parentName: string;
  postingAccountName: string;
  categoryName: string;
}
