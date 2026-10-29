import { FeatureFlagGuard } from '@/_app/containers/feature-flag-guard';
import { AppLayout } from '@/_app/layouts/app-layout';
import { OnboardingLayout } from '@/_app/layouts/onboarding-layout';
import { ProtectedAppLayout } from '@/_app/layouts/protected-app-layout';
import { useCategoryRoutes } from '@/account/routes/categories';
import { useLedgerAccountRoutes } from '@/account/routes/ledger-account';
import { useAccountingRoutes } from '@/accounting/routes/accounting';
import { useAuthRoutes } from '@/auth/routes/auth';
import { useCounterpartiesRoutes } from '@/counterparty/routes/counterparties';
import { useDebtRoutes } from '@/debt/routes/debt';
import { useJournalEntriesRoutes } from '@/journal-entries/routes/journal-entries';
import { useOnboardingRoutes } from '@/onboarding/routes/onboarding';
import { useReportingRoutes } from '@/reporting/routes/reporting';
import { featureFlagKeys } from '@/shared/hooks/use-feature-flags';
import { useTaxRoutes } from '@/tax/routes/tax';
import { useUserRoutes } from '@/user/routes/user';
import { wrapUseRoutesV7 } from '@sentry/react';
import { Outlet, useRoutes } from 'react-router-dom';

const useSentryRoutes = wrapUseRoutesV7(useRoutes);

export function AppRoutes() {
  const reportingRoutes = useReportingRoutes('/');
  const authRoutes = useAuthRoutes('/auth');
  const ledgerAccountRoutes = useLedgerAccountRoutes('/accounts');
  const counterpartiesRoutes = useCounterpartiesRoutes('/counterparties');
  const journalEntriesRoutes = useJournalEntriesRoutes('/transactions');
  const userRoutes = useUserRoutes('/profile');
  const categoryRoutes = useCategoryRoutes('/categories');
  const accountingRoutes = useAccountingRoutes('/legal-entity');
  const onboardingRoutes = useOnboardingRoutes('/onboarding');
  const debtRoutes = useDebtRoutes('/debt');
  const taxRoutes = useTaxRoutes('/tax');

  const routes = useSentryRoutes([
    {
      element: (
        <ProtectedAppLayout>
          <FeatureFlagGuard flagKeys={[featureFlagKeys.accessAlpha1]}>
            <Outlet />
          </FeatureFlagGuard>
        </ProtectedAppLayout>
      ),
      children: [
        {
          element: <OnboardingLayout />,
          children: [onboardingRoutes],
        },
        {
          element: <AppLayout />,
          children: [
            reportingRoutes,
            ledgerAccountRoutes,
            counterpartiesRoutes,
            journalEntriesRoutes,
            categoryRoutes,
            userRoutes,
            accountingRoutes,
            debtRoutes,
            taxRoutes,
          ],
        },
      ],
    },
    authRoutes,
  ]);

  return routes;
}
