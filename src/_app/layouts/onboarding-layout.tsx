import { LogoutConfirmationDialog } from '@/auth/dialogs/logout-confirmation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { useIsMobile } from '@/shared/components/sidebar';
import { AccountingEntityAvatar } from '@/user/components/accounting-entity-avatar';
import { SidebarAccountButton } from '@/user/components/sidebar-account-button';
import { useProfile } from '@/user/hooks/use-profile';
import { LogOutIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

export function OnboardingLayout() {
  const { t } = useTranslation(['user', 'auth']);
  const isMobile = useIsMobile();

  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const logoutRequestedRef = useRef(false);

  const { data: profile } = useProfile();

  const profileName =
    `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();

  const handleLogoutSelect = () => {
    logoutRequestedRef.current = true;
  };

  const handleCloseAutoFocus = (event: Event) => {
    if (!logoutRequestedRef.current) {
      return;
    }

    event.preventDefault();
    logoutRequestedRef.current = false;
    setShowLogoutConfirmation(true);
  };

  const profile_label = t('user:profile_title');
  const log_out_label = t('auth:log_out_text');

  const accountControl = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarAccountButton
          name={profileName || profile?.email || profile_label}
          avatar={
            <AccountingEntityAvatar
              name={profileName || profile?.email || profile_label}
              className="rounded-md"
              fallbackClassName="rounded-md bg-secondary text-secondary-foreground"
            />
          }
          description={profile?.email}
          aria-label={profile_label}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={isMobile ? 'top' : 'right'}
        collisionPadding={16}
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
    <>
      <Outlet context={accountControl} />
      <LogoutConfirmationDialog
        open={showLogoutConfirmation}
        onOpenChange={setShowLogoutConfirmation}
      />
    </>
  );
}
