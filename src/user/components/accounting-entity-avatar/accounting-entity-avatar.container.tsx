import { useAccountingEntities } from '@/accounting/hooks/use-accounting-entities';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { Button } from '@/shared/components/button';
import { Skeleton } from '@/shared/components/skeleton';
import { AccountingEntityAvatar } from '@/user/components/accounting-entity-avatar/accounting-entity-avatar';
import { AccountManagementDialog } from '@/user/dialogs/account-management';
import { useTranslation } from 'react-i18next';

interface AccountingEntityAvatarContainerProps {
  onLogoutClick: () => void;
}

export function AccountingEntityAvatarContainer({
  onLogoutClick,
}: Readonly<AccountingEntityAvatarContainerProps>) {
  const { t } = useTranslation('user');

  const {
    data: accountingEntities = [],
    isLoading: isLoadingAccountingEntities,
  } = useAccountingEntities();

  const hasAccountingEntities = accountingEntities.length > 0;

  const { data: activeEntity, isLoading: isLoadingAccountingEntity } =
    useAccountingEntity({
      disabled: isLoadingAccountingEntities || !hasAccountingEntities,
    });

  const isLoading =
    isLoadingAccountingEntities ||
    (hasAccountingEntities && isLoadingAccountingEntity);

  if (isLoading) {
    return (
      <Skeleton
        role="status"
        aria-label={t('account_management_loading_status')}
        className="size-10 rounded-full"
      />
    );
  }

  if (!activeEntity) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className="rounded-full p-0"
        aria-label={t('account_management_unavailable_aria_label')}
        disabled
      >
        <AccountingEntityAvatar name="" size="lg" />
      </Button>
    );
  }

  return (
    <AccountManagementDialog
      activeEntity={activeEntity}
      onLogoutClick={onLogoutClick}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className="rounded-full p-0"
        aria-label={t('open_account_management_aria_label', {
          name: activeEntity.name,
        })}
      >
        <AccountingEntityAvatar
          name={activeEntity.name}
          size="lg"
          fallbackClassName="bg-primary text-base font-semibold text-primary-foreground"
        />
      </Button>
    </AccountManagementDialog>
  );
}
