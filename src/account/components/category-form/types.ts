export interface ICategoryFormValues {
  name: string;
}

export interface CategoryFormProps {
  initialValues: ICategoryFormValues;
  pending: boolean;
  error: boolean;
  onSubmit: (values: ICategoryFormValues) => Promise<void>;
  onCancel: () => void;
}
