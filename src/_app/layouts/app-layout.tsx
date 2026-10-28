import { AppSidebar } from '@/_app/components/app-sidebar';
import { useAccountingEntities } from '@/accounting/hooks/use-accounting-entities';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { LogoutConfirmationDialog } from '@/auth/dialogs/logout-confirmation';
import { FullPageLoader } from '@/shared/components/full-page-loader';
import { MoneyJurisdictionProvider } from '@/shared/components/money';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/shared/components/sidebar';
import { AccountingEntityAvatarContainer } from '@/user/components/accounting-entity-avatar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function AppLayout() {
  const { pathname } = useLocation();
  const { t: tShared } = useTranslation('shared');
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const { data: accountingEntities, isLoading: isLoadingAccountingEntities } =
    useAccountingEntities();

  const hasAccountingEntities = !!accountingEntities?.length;

  const { data: accountingEntity, isLoading: isLoadingAccountingEntity } =
    useAccountingEntity({
      disabled: !hasAccountingEntities,
    });

  const isLoading =
    isLoadingAccountingEntities ||
    (hasAccountingEntities && isLoadingAccountingEntity);

  if (isLoading) {
    return <FullPageLoader label={tShared('loading_application_status')} />;
  }

  if (accountingEntities?.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <MoneyJurisdictionProvider value={accountingEntity?.jurisdictionCode}>
      <SidebarProvider
        style={{ '--sidebar-width': '14rem' } as React.CSSProperties}
      >
        <AppSidebar
          currentPath={pathname}
          accountControl={
            <AccountingEntityAvatarContainer
              onLogoutClick={() => setShowLogoutConfirmation(true)}
            />
          }
        />
        <SidebarInset>
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 mb-8 md:px-8 md:py-6">
            <SidebarTrigger className="md:hidden" />
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <LogoutConfirmationDialog
        open={showLogoutConfirmation}
        onOpenChange={setShowLogoutConfirmation}
      />
    </MoneyJurisdictionProvider>
  );
}
