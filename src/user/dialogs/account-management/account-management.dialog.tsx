import { useAccountingEntities } from '@/accounting/hooks/use-accounting-entities';
import { useSwitchAccountingEntity } from '@/accounting/hooks/use-switch-accounting-entity';
import { accountingService } from '@/accounting/lib/services/accounting.service';
import { AnimatedThemeToggler } from '@/shared/components/animated-theme-toggler';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/popover';
import { useIsMobile } from '@/shared/components/sidebar';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import type { UAppThemePreference } from '@/shared/lib/api/Api';
import { AccountManagement } from '@/user/components/account-management';
import { useProfile } from '@/user/hooks/use-profile';
import { useUpdatePreferences } from '@/user/hooks/use-update-preferences';
import { useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { AccountManagementDialogProps } from './types';

export function AccountManagementDialog({
  activeEntity,
  children,
  onLogoutClick,
}: Readonly<AccountManagementDialogProps>) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
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

  const handleProfileClick = () => {
    setOpen(false);
    navigate('/profile');
  };

  const handleLogoutClick = () => {
    logoutRequestedRef.current = true;
    setOpen(false);
  };

  const handleCloseAutoFocus = (event: Event) => {
    if (!logoutRequestedRef.current) {
      return;
    }

    event.preventDefault();
    logoutRequestedRef.current = false;
    onLogoutClick();
  };

  const handleThemeChange = (theme: UAppThemePreference) => {
    updatePreferences(
      { theme },
      {
        onError: (error) => handleApiError(error, { showToast: true }),
      }
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        side={isMobile ? 'top' : 'right'}
        collisionPadding={16}
        sideOffset={8}
        aria-labelledby={titleId}
        onCloseAutoFocus={handleCloseAutoFocus}
        className="max-h-[var(--radix-popover-content-available-height)] w-80 max-w-[calc(100vw-2rem)] gap-0 overflow-y-auto rounded-xl p-0"
      >
        <AccountManagement
          accountingEntities={accountingEntities}
          activeEntity={activeEntity}
          email={profile?.email}
          onProfileClick={handleProfileClick}
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
  );
}
