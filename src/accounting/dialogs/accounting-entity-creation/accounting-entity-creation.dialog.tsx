import {
  AccountingEntityCreationForm,
  AccountingEntityCreationFormSkeleton,
  type IAccountingEntityFormValues,
} from '@/accounting/components/accounting-entity-creation-form';
import { useCreateAccountingEntity } from '@/accounting/hooks/use-create-accounting-entity';
import { useJurisdictions } from '@/accounting/hooks/use-jurisdictions';
import { accountingEntityMapper } from '@/accounting/lib/mappers/accounting-entity.mapper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useCurrencies } from '@/shared/hooks/use-currencies';
import { useProfile } from '@/user/hooks/use-profile';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface AccountingEntityCreationDialogProps {
  open: boolean;
  done: () => Promise<void>;
  onClose?: () => void;
}

export function AccountingEntityCreationDialog({
  open,
  done,
  onClose,
}: Readonly<AccountingEntityCreationDialogProps>) {
  const { t } = useTranslation('accounting');
  const handleApiError = useApiErrorHandler();

  const { mutateAsync: createAccountingEntity, isPending } =
    useCreateAccountingEntity();

  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: currencies = [] } = useCurrencies();
  const { data: jurisdictions = [] } = useJurisdictions();
  const individualName =
    `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();

  const handleSubmit = async (values: IAccountingEntityFormValues) => {
    try {
      const payload =
        accountingEntityMapper.toAccountingEntityCreationDto(values);
      await createAccountingEntity(payload);

      await done();
      toast.success(t('welcome_to_drimsheet_text'));
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  const dialog_title = t('account_setup_title');
  const dialog_description = t('account_setup_description');

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal>
      <DialogContent className="sm:max-w-sm" showCloseButton={Boolean(onClose)}>
        <DialogHeader>
          <DialogTitle>{dialog_title}</DialogTitle>
          <DialogDescription className="text-sm">
            {dialog_description}
          </DialogDescription>
        </DialogHeader>
        {isLoadingProfile ? (
          <AccountingEntityCreationFormSkeleton />
        ) : (
          <AccountingEntityCreationForm
            individualName={individualName}
            loading={isPending}
            onSubmit={handleSubmit}
            currencies={currencies}
            jurisdictions={jurisdictions}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
