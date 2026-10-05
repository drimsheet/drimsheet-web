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
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CounterpartyCreationDialogProps } from './types';

interface RenderFormProps {
  role: CounterpartyCreationDialogProps['role'];
  onSuccess: () => void;
  onBusyChange: (busy: boolean) => void;
}

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

function RenderForm({
  role,
  onSuccess,
  onBusyChange,
}: Readonly<RenderFormProps>) {
  switch (role) {
    case 'vendor':
      return (
        <VendorFormCreateContainer
          onSuccess={onSuccess}
          onBusyChange={onBusyChange}
        />
      );
    case 'contractor':
      return (
        <ContractorFormCreateContainer
          onSuccess={onSuccess}
          onBusyChange={onBusyChange}
        />
      );
    case 'employer':
      return (
        <EmployerFormCreateContainer
          onSuccess={onSuccess}
          onBusyChange={onBusyChange}
        />
      );
    default:
      return (
        <CounterpartyFormCreateContainer
          onSuccess={onSuccess}
          onBusyChange={onBusyChange}
        />
      );
  }
}

export function CounterpartyCreationDialog({
  open,
  role,
  onClose,
}: Readonly<CounterpartyCreationDialogProps>) {
  const { t } = useTranslation('counterparty');
  const [busy, setBusy] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !busy) onClose();
  };

  if (!open) return null;

  const { title, description } = getTitleAndDescription(role, t);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md"
        showCloseButton={!busy}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {description}
          </DialogDescription>
        </DialogHeader>
        <RenderForm role={role} onSuccess={onClose} onBusyChange={setBusy} />
      </DialogContent>
    </Dialog>
  );
}
