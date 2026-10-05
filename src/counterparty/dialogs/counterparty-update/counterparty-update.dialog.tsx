import {
  ContractorFormSkeleton,
  ContractorFormUpdateContainer,
} from '@/counterparty/components/contractor-form';
import {
  CounterpartyFormSkeleton,
  CounterpartyFormUpdateContainer,
} from '@/counterparty/components/counterparty-form';
import {
  EmployerFormSkeleton,
  EmployerFormUpdateContainer,
} from '@/counterparty/components/employer-form';
import {
  VendorFormSkeleton,
  VendorFormUpdateContainer,
} from '@/counterparty/components/vendor-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import helpers from './helper';
import type { CounterpartyUpdateDialogProps, RenderProps } from './types';

export function CounterpartyUpdateDialog({
  counterpartyId,
  type,
  role,
  onClose,
}: Readonly<CounterpartyUpdateDialogProps>) {
  const { t } = useTranslation('counterparty');
  const { counterpartyId: routeId } = useParams();
  const [params, setParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const id = counterpartyId ?? params.get('id') ?? '';
  const valid = helpers.isValidLink(params, routeId, { counterpartyId, type });

  const handleNormalize = (party: ICounterpartyDto) => {
    if (helpers.normalizeParams(params, counterpartyId, party) === params)
      return;

    setParams(
      (current) => helpers.normalizeParams(current, counterpartyId, party),
      { replace: true }
    );
  };

  const handleClose = () => {
    if (!busy) onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  if (!helpers.isOpen(params, counterpartyId)) return null;

  const title_text = t('update_counterparty_title');
  const description_text = t('update_counterparty_description');

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg"
        showCloseButton={!busy}
      >
        <DialogHeader>
          <DialogTitle>{title_text}</DialogTitle>
          <DialogDescription className="sr-only">
            {description_text}
          </DialogDescription>
        </DialogHeader>
        <Render
          key={id}
          valid={valid}
          role={role}
          counterpartyId={id}
          onSuccess={onClose}
          onCancel={handleClose}
          onBusyChange={setBusy}
          onLoaded={handleNormalize}
        />
      </DialogContent>
    </Dialog>
  );
}

function Render({ valid, role, ...common }: Readonly<RenderProps>) {
  const { t } = useTranslation('counterparty');
  const invalid_text = t('update_invalid_link_text');

  if (!valid) return <p role="alert">{invalid_text}</p>;

  switch (role) {
    case 'vendor':
      return (
        <VendorFormUpdateContainer
          {...common}
          loadingFallback={
            <VendorFormSkeleton showPostalCode showDisplayName={false} />
          }
        />
      );
    case 'contractor':
      return (
        <ContractorFormUpdateContainer
          {...common}
          loadingFallback={
            <ContractorFormSkeleton showPostalCode showDisplayName={false} />
          }
        />
      );
    case 'employer':
      return (
        <EmployerFormUpdateContainer
          {...common}
          loadingFallback={<EmployerFormSkeleton showPostalCode />}
        />
      );
    default:
      return (
        <CounterpartyFormUpdateContainer
          {...common}
          loadingFallback={<CounterpartyFormSkeleton />}
        />
      );
  }
}
