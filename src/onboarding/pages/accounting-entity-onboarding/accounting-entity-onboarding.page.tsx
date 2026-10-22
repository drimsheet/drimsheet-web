import logoImg from '@/shared/assets/logo.svg';
import { AppHeader } from '@/shared/components/app';
import { SidebarProvider } from '@/shared/components/sidebar';
import { useTranslation } from 'react-i18next';
import { AccountingEntityOnboardingSidebar } from './parts/sidebar';

export function AccountingEntityOnboardingPage() {
  const { t } = useTranslation(['onboarding', 'shared']);

  const drimsheet_text = t('shared:drimsheet');
  const step_status = t('step_status', { step: 1, total: 5 });
  const hello_world_title = t('hello_world_title');

  return (
    <SidebarProvider className="flex-col">
      <AppHeader
        showSidebarTrigger={false}
        className="flex min-h-16 shrink-0 items-center border-b px-4 py-2 sm:px-6"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <img src={logoImg} alt={drimsheet_text} className="size-7 shrink-0" />
        </div>
      </AppHeader>
      <div className="flex flex-1 flex-col md:flex-row">
        <AccountingEntityOnboardingSidebar />
        <main className="min-w-0 flex-1 px-6 py-8 sm:px-8 lg:px-10">
          <div className="flex max-w-3xl flex-col gap-3">
            <p className="text-xs text-muted-foreground">{step_status}</p>
            <h1 className="m-0 text-2xl font-semibold tracking-tight">
              {hello_world_title}
            </h1>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
