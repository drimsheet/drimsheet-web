import { AccountTypeSelection } from '@/account/components/account-type-selection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import type { ULedgerAccountBehavior } from '@/shared/lib/api/Api';
import { useTranslation } from 'react-i18next';

export interface AccountTypeSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: ULedgerAccountBehavior) => void;
  defaultValue?: ULedgerAccountBehavior;
}

export function AccountTypeSelectionDialog({
  open,
  onClose,
  onSubmit,
  defaultValue,
}: Readonly<AccountTypeSelectionDialogProps>) {
  const { t } = useTranslation(['ledger-accounts']);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  const handleSubmit = (value: ULedgerAccountBehavior) => {
    onSubmit(value);
  };

  const title = t('ledger-accounts:select_account_type_title');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <AccountTypeSelection
          defaultValue={defaultValue}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
