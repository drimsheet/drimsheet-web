import type {
  TSupportedExpenseAccountBehavior,
  TSupportedRevenueAccountBehavior,
} from '@/shared/lib/api/Api';

export interface ICategoryFormValues {
  name: string;
  type: 'revenue' | 'expense';
  behavior: TSupportedRevenueAccountBehavior | TSupportedExpenseAccountBehavior;
}

export interface CategoryFormProps {
  initialValues: ICategoryFormValues;
  editing: boolean;
  pending: boolean;
  error: boolean;
  onSubmit: (values: ICategoryFormValues) => Promise<void>;
  onCancel: () => void;
}
