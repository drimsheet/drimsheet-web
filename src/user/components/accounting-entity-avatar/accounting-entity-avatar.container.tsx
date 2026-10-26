import { useAccountingEntities } from '@/accounting/hooks/use-accounting-entities';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import {
  SidebarAccountButton,
  SidebarAccountButtonSkeleton,
} from '@/user/components/sidebar-account-button';
import { AccountManagementDialog } from '@/user/dialogs/account-management';
import { useProfile } from '@/user/hooks/use-profile';
import { useTranslation } from 'react-i18next';
import { AccountingEntityAvatar } from './accounting-entity-avatar';

import type { AccountingEntityAvatarContainerProps } from './types';

export function AccountingEntityAvatarContainer({
  onLogoutClick,
}: Readonly<AccountingEntityAvatarContainerProps>) {
  const { t } = useTranslation('user');
  const { data: profile } = useProfile();

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
    return <SidebarAccountButtonSkeleton />;
  }

  if (!activeEntity) {
    const unavailable_label = t('account_management_unavailable_aria_label');

    return (
      <SidebarAccountButton
        name={unavailable_label}
        avatar={
          <AccountingEntityAvatar
            name=""
            className="rounded-md"
            fallbackClassName="rounded-md"
          />
        }
        aria-label={unavailable_label}
        disabled
      />
    );
  }

  const account_management_aria_label = t(
    'open_account_management_aria_label',
    { name: activeEntity.name }
  );

  return (
    <AccountManagementDialog
      activeEntity={activeEntity}
      onLogoutClick={onLogoutClick}
    >
      <SidebarAccountButton
        name={activeEntity.name}
        avatar={
          <AccountingEntityAvatar
            name={activeEntity.name}
            className="rounded-md"
            fallbackClassName="rounded-md bg-secondary text-secondary-foreground"
          />
        }
        description={profile?.email}
        aria-label={account_management_aria_label}
      />
    </AccountManagementDialog>
  );
}
