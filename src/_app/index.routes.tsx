import { FeatureFlagGuard } from '@/_app/containers/feature-flag-guard';
import { AppLayout } from '@/_app/layouts/app-layout';
import { ProtectedAppLayout } from '@/_app/layouts/protected-app-layout';
import { useCategoryRoutes } from '@/account/routes/categories';
import { useLedgerAccountRoutes } from '@/account/routes/ledger-account';
import { useAccountingRoutes } from '@/accounting/routes/accounting';
import { useAuthRoutes } from '@/auth/routes/auth';
import { useCounterpartiesRoutes } from '@/counterparty/routes/counterparties';
import { useJournalEntriesRoutes } from '@/journal-entries/routes/journal-entries';
import { useReportingRoutes } from '@/reporting/routes/reporting';
import { featureFlagKeys } from '@/shared/hooks/use-feature-flag';
import { useUserRoutes } from '@/user/routes/user';
import { wrapUseRoutesV7 } from '@sentry/react';
import { useRoutes } from 'react-router-dom';

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

  const routes = useSentryRoutes([
    {
      element: (
        <ProtectedAppLayout>
          <FeatureFlagGuard flagKeys={[featureFlagKeys.accessAlpha1]}>
            <AppLayout />
          </FeatureFlagGuard>
        </ProtectedAppLayout>
      ),
      children: [
        reportingRoutes,
        ledgerAccountRoutes,
        counterpartiesRoutes,
        journalEntriesRoutes,
        categoryRoutes,
        userRoutes,
        accountingRoutes,
      ],
    },
    authRoutes,
  ]);

  return routes;
}
