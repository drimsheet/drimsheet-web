import { useJurisdictions } from '@/accounting/hooks/use-jurisdictions';
import { VendorForm, type IVendorFormValues } from '@/counterparty/components';
import { useCreateCounterparty } from '@/counterparty/hooks/use-create-counterparty';
import { counterpartyMapper } from '@/counterparty/lib/mappers/counterparty.mapper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export interface VendorCreationDialogProps {
  open: boolean;
  onClose: () => void;
}

export function VendorCreationDialog({
  open,
  onClose,
}: Readonly<VendorCreationDialogProps>) {
  const { t } = useTranslation(['counterparty']);
  const handleApiError = useApiErrorHandler();

  const { data: jurisdictions = [], isPending: isJurisdictionsPending } =
    useJurisdictions();
  const { mutateAsync: createVendor, isPending: isCreating } =
    useCreateCounterparty();

  const formDisabled = isJurisdictionsPending;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  const handleSubmit = async (values: IVendorFormValues) => {
    try {
      await createVendor(counterpartyMapper.toVendorCreateReq(values));
      toast.success(t('counterparty:vendor_created_success_text'));
      onClose();
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  const create_vendor_title = t('counterparty:create_vendor_title');
  const create_vendor_description = t('counterparty:create_vendor_description');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{create_vendor_title}</DialogTitle>
          <DialogDescription className="sr-only">
            {create_vendor_description}
          </DialogDescription>
        </DialogHeader>

        <VendorForm
          onSubmit={handleSubmit}
          jurisdictions={jurisdictions}
          loading={isCreating}
          disabled={formDisabled || isCreating}
        />
      </DialogContent>
    </Dialog>
  );
}
