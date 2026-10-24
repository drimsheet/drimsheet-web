export interface AccountDeleteConfirmationProps {
  accountName: string;
  isControlAccount: boolean;
  onDelete: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}
