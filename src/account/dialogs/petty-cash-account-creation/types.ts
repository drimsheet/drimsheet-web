export interface PettyCashAccountCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (accountId: string) => void;
}
