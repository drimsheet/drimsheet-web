import { useJurisdictions } from '@/accounting/hooks/use-jurisdictions';
import {
  EmployerForm,
  type IEmployerFormValues,
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

export interface EmployerCreationDialogProps {
  open: boolean;
  onClose: () => void;
}

export function EmployerCreationDialog({
  open,
  onClose,
}: Readonly<EmployerCreationDialogProps>) {
  const { t } = useTranslation(['counterparty']);
  const handleApiError = useApiErrorHandler();

  const { data: jurisdictions = [], isPending: isJurisdictionsPending } =
    useJurisdictions();
  const { mutateAsync: createEmployer, isPending: isCreating } =
    useCreateCounterparty();

  const formDisabled = isJurisdictionsPending;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  const handleSubmit = async (values: IEmployerFormValues) => {
    try {
      await createEmployer(counterpartyMapper.toEmployerCreateReq(values));
      toast.success(t('counterparty:employer_created_success_text'));
      onClose();
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  const create_employer_title = t('counterparty:create_employer_title');
  const create_employer_description = t(
    'counterparty:create_employer_description'
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{create_employer_title}</DialogTitle>
          <DialogDescription className="sr-only">
            {create_employer_description}
          </DialogDescription>
        </DialogHeader>

        <EmployerForm
          onSubmit={handleSubmit}
          jurisdictions={jurisdictions}
          loading={isCreating}
          disabled={formDisabled || isCreating}
        />
      </DialogContent>
    </Dialog>
  );
}
