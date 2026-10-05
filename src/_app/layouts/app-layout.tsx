import { AppSidebar } from '@/_app/components/app-sidebar';
import { useAccountingEntities } from '@/accounting/hooks/use-accounting-entities';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { LogoutConfirmationDialog } from '@/auth/dialogs/logout-confirmation';
import { OnboardingManagerContainer } from '@/onboarding/components/onboarding-manager';
import { AppHeaderActionsProvider } from '@/shared/components/app';
import { Button } from '@/shared/components/button';
import { FullPageLoader } from '@/shared/components/full-page-loader';
import { SidebarInset, SidebarProvider } from '@/shared/components/sidebar';
import { AccountingEntityAvatarContainer } from '@/user/components/accounting-entity-avatar';
import { BellIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';

export function AppLayout() {
  const { pathname } = useLocation();
  const { t: tUser } = useTranslation('user');
  const { t: tShared } = useTranslation('shared');
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const { data: accountingEntities, isLoading: isLoadingAccountingEntities } =
    useAccountingEntities();

  const hasAccountingEntities = !!accountingEntities?.length;

  const { isLoading: isLoadingAccountingEntity } = useAccountingEntity({
    disabled: !hasAccountingEntities,
  });

  const isLoading =
    isLoadingAccountingEntities ||
    (hasAccountingEntities && isLoadingAccountingEntity);

  if (isLoading) {
    return <FullPageLoader label={tShared('loading_application_status')} />;
  }

  const notificationsAriaLabel = tUser('notifications_aria_label');

  const headerActions = (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label={notificationsAriaLabel}
        title={notificationsAriaLabel}
        disabled
      >
        <BellIcon />
      </Button>
      <AccountingEntityAvatarContainer
        onLogoutClick={() => setShowLogoutConfirmation(true)}
      />
    </>
  );

  return (
    <>
      <SidebarProvider>
        <AppSidebar currentPath={pathname} />
        <SidebarInset>
          <AppHeaderActionsProvider actions={headerActions}>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mb-8 min-w-full">
              <Outlet />
            </div>
          </AppHeaderActionsProvider>
        </SidebarInset>
      </SidebarProvider>
      <OnboardingManagerContainer />
      <LogoutConfirmationDialog
        open={showLogoutConfirmation}
        onOpenChange={setShowLogoutConfirmation}
      />
    </>
  );
}
