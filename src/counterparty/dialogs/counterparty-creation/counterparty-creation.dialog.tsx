import { ContractorFormCreateContainer } from '@/counterparty/components/contractor-form';
import { CounterpartyFormCreateContainer } from '@/counterparty/components/counterparty-form';
import { EmployerFormCreateContainer } from '@/counterparty/components/employer-form';
import { VendorFormCreateContainer } from '@/counterparty/components/vendor-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CounterpartyCreationDialogProps } from './types';

const creationForms = {
  default: CounterpartyFormCreateContainer,
  vendor: VendorFormCreateContainer,
  contractor: ContractorFormCreateContainer,
  employer: EmployerFormCreateContainer,
};

function getTitleAndDescription(
  role: CounterpartyCreationDialogProps['role'],
  t: TFunction<'counterparty'>
) {
  switch (role) {
    case 'vendor':
      return {
        title: t('create_vendor_title'),
        description: t('create_vendor_description'),
      };
    case 'contractor':
      return {
        title: t('create_contractor_title'),
        description: t('create_contractor_description'),
      };
    case 'employer':
      return {
        title: t('create_employer_title'),
        description: t('create_employer_description'),
      };
    default:
      return {
        title: t('create_counterparty_title'),
        description: t('create_counterparty_description'),
      };
  }
}

export function CounterpartyCreationDialog({
  open,
  role,
  initialValues,
  onSuccess,
  onClose,
  onCloseAutoFocus,
}: Readonly<CounterpartyCreationDialogProps>) {
  const { t } = useTranslation('counterparty');
  const [busy, setBusy] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !busy) {
      onClose();
    }
  };

  const handleSuccess = (counterparty: ICounterpartyDto) => {
    onSuccess?.(counterparty);
    onClose();
  };

  if (!open) {
    return null;
  }

  const { title, description } = getTitleAndDescription(role, t);
  const CreationForm = creationForms[role];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md"
        showCloseButton={!busy}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {description}
          </DialogDescription>
        </DialogHeader>
        <CreationForm
          initialValues={initialValues}
          onSuccess={handleSuccess}
          onBusyChange={setBusy}
        />
      </DialogContent>
    </Dialog>
  );
}
