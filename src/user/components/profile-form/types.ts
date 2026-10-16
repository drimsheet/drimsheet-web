export interface IProfileFormValues {
  firstName: string;
  lastName: string;
}

export interface ProfileFormProps {
  initialValues: IProfileFormValues;
  isSaving?: boolean;
  hasError?: boolean;
  onSubmit: (values: IProfileFormValues) => void | Promise<void>;
  onCancel: () => void;
}
