export interface FileUploadProps {
  accept: string[];
  actionText: string;
  description: string;
  disabled?: boolean;
  errors?: Array<{ message?: string } | undefined>;
  id: string;
  label: string;
  multiple?: boolean;
  onValueChange: (files: File[]) => void;
  replaceText?: string;
  value: File[];
}
