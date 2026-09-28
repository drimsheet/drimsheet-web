import {
  CounterpartyForm,
  type ICounterpartyFormValues,
} from '@/counterparty/components';
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

export interface CounterpartyCreationDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CounterpartyCreationDialog({
  open,
  onClose,
}: Readonly<CounterpartyCreationDialogProps>) {
  const { t } = useTranslation(['counterparty']);
  const handleApiError = useApiErrorHandler();

  const { mutateAsync: createCounterparty, isPending: isCreating } =
    useCreateCounterparty();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  const handleSubmit = async (values: ICounterpartyFormValues) => {
    try {
      await createCounterparty(
        counterpartyMapper.toCounterpartyCreateReq(values)
      );
      toast.success(t('counterparty:counterparty_created_success_text'));
      onClose();
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  const create_counterparty_title = t('counterparty:create_counterparty_title');
  const create_counterparty_description = t(
    'counterparty:create_counterparty_description'
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{create_counterparty_title}</DialogTitle>
          <DialogDescription className="sr-only">
            {create_counterparty_description}
          </DialogDescription>
        </DialogHeader>

        <CounterpartyForm
          onSubmit={handleSubmit}
          loading={isCreating}
          disabled={isCreating}
        />
      </DialogContent>
    </Dialog>
  );
}
