export interface UploadedFileProps {
  disabled?: boolean;
  name: string;
  onRemove?: () => void;
  size: number;
  type: string;
  url?: string;
}
