export interface CounterpartyProfileActionsProps {
  deleteEligibilityChecking?: boolean;
  deletable?: boolean;
  onActionsOpenChange?: (open: boolean) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  editDisabled?: boolean;
}
