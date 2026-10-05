import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { Separator } from '@/shared/components/separator';
import {
  EAccountingEntityType,
  type UAccountingEntityType,
} from '@/shared/lib/api/Api';
import type { AccountManagementProps } from '@/user/components/account-management/types';
import { AccountingEntityAvatar } from '@/user/components/accounting-entity-avatar/accounting-entity-avatar';
import {
  LogOutIcon,
  MessageSquareMoreIcon,
  PlusIcon,
  SettingsIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AccountManagement({
  accountingEntities,
  activeEntity,
  email,
  onAddAccount,
  onLogoutClick,
  onSelectEntity,
  themeAction,
  titleId,
}: Readonly<AccountManagementProps>) {
  const { t } = useTranslation(['user', 'auth']);

  const otherEntities = accountingEntities.filter(
    (entity) => entity.id !== activeEntity.id
  );

  const entityTypeLabels: Record<UAccountingEntityType, string> = {
    [EAccountingEntityType.Individual]: t('individual_entity_type'),
    [EAccountingEntityType.SoleTrader]: t('sole_trader_entity_type'),
    [EAccountingEntityType.PrivateCompany]: t('private_company_entity_type'),
  };

  const account_management_title = t('account_management_title');
  const drop_feedback_action = t('drop_feedback_action');
  const profile_settings_action = t('profile_settings_action');
  const other_accounts_title = t('other_accounts_title');
  const no_other_accounts_text = t('no_other_accounts_text');
  const add_new_account_action = t('add_new_account_action');
  const log_out_text = t('auth:log_out_text');

  return (
    <>
      <h2 id={titleId} className="sr-only">
        {account_management_title}
      </h2>

      <div className="m-3 flex flex-col items-center rounded-lg bg-muted/70 px-4 py-3 text-center">
        <AccountingEntityAvatar
          name={activeEntity.name}
          size="lg"
          fallbackClassName="bg-primary font-semibold text-primary-foreground"
        />
        <p className="mt-2 max-w-full truncate font-medium">
          {activeEntity.name}
        </p>
        {email && (
          <p className="max-w-full truncate text-xs text-muted-foreground">
            {email}
          </p>
        )}
        <Badge variant="outline" className="mt-2 bg-background">
          {entityTypeLabels[activeEntity.type]}
        </Badge>
      </div>

      <div className="py-1">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start rounded-none px-5"
          disabled
        >
          <MessageSquareMoreIcon />
          {drop_feedback_action}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start rounded-none px-5"
          disabled
        >
          <SettingsIcon />
          {profile_settings_action}
        </Button>
        {themeAction}
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start rounded-none px-5"
          onClick={onLogoutClick}
        >
          <LogOutIcon />
          {log_out_text}
        </Button>
      </div>

      <Separator />

      <div className="p-3">
        <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
          {other_accounts_title}
        </p>
        {otherEntities.length === 0 ? (
          <p className="px-2 py-2 text-sm text-muted-foreground">
            {no_other_accounts_text}
          </p>
        ) : (
          <div className="flex flex-col">
            {otherEntities.map((entity) => (
              <Button
                key={entity.id}
                type="button"
                variant="ghost"
                className="w-full justify-start px-2"
                aria-label={t('switch_account_aria_label', {
                  name: entity.name,
                })}
                onClick={() => onSelectEntity(entity.id)}
              >
                <AccountingEntityAvatar name={entity.name} size="sm" />
                <span className="truncate">{entity.name}</span>
              </Button>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          className="mt-2 w-full justify-start px-2"
          onClick={onAddAccount}
        >
          <PlusIcon />
          {add_new_account_action}
        </Button>
      </div>
    </>
  );
}
