import logoImg from '@/shared/assets/logo.svg';
import { AppHeader } from '@/shared/components/app';
import { SidebarProvider } from '@/shared/components/sidebar';
import { useCurrencies } from '@/shared/hooks/use-currencies';
import { useJurisdictions } from '@/shared/hooks/use-jurisdictions';
import { useTranslation } from 'react-i18next';
import { AccountingEntityStep } from './parts/accounting-entity-step';
import { AccountingEntityOnboardingSidebar } from './parts/sidebar';

export function AccountingEntityOnboardingPage() {
  const { t } = useTranslation(['onboarding', 'shared']);
  const currenciesQuery = useCurrencies();
  const jurisdictionsQuery = useJurisdictions({ throwOnError: false });

  const isLoading = currenciesQuery.isPending || jurisdictionsQuery.isPending;

  const hasError =
    !isLoading &&
    (currenciesQuery.isError ||
      jurisdictionsQuery.isError ||
      !currenciesQuery.data?.length ||
      !jurisdictionsQuery.data?.length);

  const handleRetry = () => {
    void currenciesQuery.refetch();
    void jurisdictionsQuery.refetch();
  };

  const drimsheet_text = t('shared:drimsheet');
  const step_status = t('step_status', { step: 1, total: 5 });

  return (
    <SidebarProvider className="h-dvh min-h-0 flex-col overflow-hidden">
      <AppHeader
        showSidebarTrigger={false}
        className="flex min-h-16 shrink-0 items-center border-b px-4 py-2 sm:px-6"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <img src={logoImg} alt={drimsheet_text} className="size-7 shrink-0" />
        </div>
      </AppHeader>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <AccountingEntityOnboardingSidebar />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-8 sm:px-8 lg:px-10">
          <p className="text-xs text-muted-foreground">{step_status}</p>
          <AccountingEntityStep
            currencies={currenciesQuery.data ?? []}
            jurisdictions={jurisdictionsQuery.data ?? []}
            isLoading={isLoading}
            hasError={hasError}
            onRetry={handleRetry}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}
