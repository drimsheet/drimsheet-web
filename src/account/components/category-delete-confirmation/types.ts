export interface CategoryDeleteConfirmationProps {
  accountName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
}
