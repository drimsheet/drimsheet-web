import { AccountingEntityCreationDialog } from '@/accounting/dialogs/accounting-entity-creation';
import { useAccountingEntities } from '@/accounting/hooks/use-accounting-entities';
import { useSwitchAccountingEntity } from '@/accounting/hooks/use-switch-accounting-entity';
import { accountingService } from '@/accounting/lib/services/accounting.service';
import { AnimatedThemeToggler } from '@/shared/components/animated-theme-toggler';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/popover';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import type {
  IAccountingEntity,
  UAppThemePreference,
} from '@/shared/lib/api/Api';
import { AccountManagement } from '@/user/components/account-management';
import { useProfile } from '@/user/hooks/use-profile';
import { useUpdatePreferences } from '@/user/hooks/use-update-preferences';
import { type ReactNode, useId, useRef, useState } from 'react';

interface AccountManagementDialogProps {
  activeEntity: IAccountingEntity;
  children: ReactNode;
  onLogoutClick: () => void;
}

export function AccountManagementDialog({
  activeEntity,
  children,
  onLogoutClick,
}: Readonly<AccountManagementDialogProps>) {
  const [open, setOpen] = useState(false);
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const logoutRequestedRef = useRef(false);
  const titleId = useId();
  const { data: accountingEntities = [] } = useAccountingEntities();
  const { data: profile } = useProfile();
  const { mutateAsync: switchAccountingEntity } = useSwitchAccountingEntity();
  const { mutate: updatePreferences } = useUpdatePreferences();
  const handleApiError = useApiErrorHandler();

  const handleSelectEntity = async (accountingEntityId: string) => {
    try {
      await switchAccountingEntity({ accountingEntityId });
      setOpen(false);
      accountingService.prepareAccountingEntityReload();
      window.location.reload();
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  const handleAddAccount = () => {
    setOpen(false);
    setShowAccountCreation(true);
  };

  const handleLogoutClick = () => {
    logoutRequestedRef.current = true;
    setOpen(false);
  };

  const handleCloseAutoFocus = (event: Event) => {
    if (!logoutRequestedRef.current) return;

    event.preventDefault();
    logoutRequestedRef.current = false;
    onLogoutClick();
  };

  const handleAccountCreated = async () => {
    setShowAccountCreation(false);
    window.location.reload();
  };

  const handleThemeChange = (theme: UAppThemePreference) => {
    updatePreferences(theme, {
      onError: (error) => handleApiError(error, { showToast: true }),
    });
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          aria-labelledby={titleId}
          onCloseAutoFocus={handleCloseAutoFocus}
          className="max-h-[calc(100vh-5rem)] w-80 gap-0 overflow-y-auto rounded-xl p-0"
        >
          <AccountManagement
            accountingEntities={accountingEntities}
            activeEntity={activeEntity}
            email={profile?.email}
            onAddAccount={handleAddAccount}
            onLogoutClick={handleLogoutClick}
            onSelectEntity={handleSelectEntity}
            themeAction={
              <AnimatedThemeToggler
                showText
                onThemeChange={handleThemeChange}
                className="flex h-9 w-full items-center justify-start gap-1.5 px-5 text-sm font-medium hover:bg-muted"
              />
            }
            titleId={titleId}
          />
        </PopoverContent>
      </Popover>

      <AccountingEntityCreationDialog
        onClose={() => setShowAccountCreation(false)}
        open={showAccountCreation}
        done={handleAccountCreated}
      />
    </>
  );
}
