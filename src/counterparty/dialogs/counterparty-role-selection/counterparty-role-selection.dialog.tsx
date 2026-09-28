import { CounterpartyRoleSelect } from '@/counterparty/components';
import type { UCounterpartyRoleSelectValue } from '@/counterparty/components/counterparty-role-select/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { useTranslation } from 'react-i18next';

export interface CounterpartyRoleSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: UCounterpartyRoleSelectValue) => void;
  defaultValue?: UCounterpartyRoleSelectValue;
}

export function CounterpartyRoleSelectionDialog({
  open,
  onClose,
  onSubmit,
  defaultValue,
}: Readonly<CounterpartyRoleSelectionDialogProps>) {
  const { t } = useTranslation(['counterparty']);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  const handleSubmit = (value: UCounterpartyRoleSelectValue) => {
    onSubmit(value);
  };

  const title = t('counterparty:select_counterparty_role_title');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <CounterpartyRoleSelect
          defaultValue={defaultValue}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
