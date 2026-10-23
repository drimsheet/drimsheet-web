import { LogoutConfirmationDialog } from '@/auth/dialogs/logout-confirmation';
import { AppHeaderActionsProvider } from '@/shared/components/app';
import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { AccountingEntityAvatar } from '@/user/components/accounting-entity-avatar';
import { useProfile } from '@/user/hooks/use-profile';
import { LogOutIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

export function OnboardingLayout() {
  const { t } = useTranslation(['user', 'auth']);

  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const logoutRequestedRef = useRef(false);

  const { data: profile } = useProfile();

  const profileName =
    `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();

  const handleLogoutSelect = () => {
    logoutRequestedRef.current = true;
  };

  const handleCloseAutoFocus = (event: Event) => {
    if (!logoutRequestedRef.current) return;

    event.preventDefault();
    logoutRequestedRef.current = false;
    setShowLogoutConfirmation(true);
  };

  const profile_label = t('user:profile_title');
  const log_out_label = t('auth:log_out_text');

  const headerActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="rounded-full p-0"
          aria-label={profile_label}
          title={profile_label}
        >
          <AccountingEntityAvatar
            name={profileName || profile?.email || ''}
            size="lg"
            fallbackClassName="bg-primary text-base font-semibold text-primary-foreground"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64"
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        <DropdownMenuLabel>
          <p className="break-words">{profileName || profile_label}</p>
          {profile?.email && (
            <p className="break-all text-xs font-normal text-muted-foreground">
              {profile.email}
            </p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleLogoutSelect}>
            <LogOutIcon aria-hidden />
            {log_out_label}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AppHeaderActionsProvider actions={headerActions}>
      <Outlet />
      <LogoutConfirmationDialog
        open={showLogoutConfirmation}
        onOpenChange={setShowLogoutConfirmation}
      />
    </AppHeaderActionsProvider>
  );
}
