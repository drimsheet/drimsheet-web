import { AccountingEntityOnboardingPage } from '@/onboarding/pages/accounting-entity-onboarding';
import type { TModuleRoutes } from '@/shared/lib/types/routes.types';

export const useOnboardingRoutes: TModuleRoutes = (basePath) => ({
  path: basePath,
  element: <AccountingEntityOnboardingPage />,
});
