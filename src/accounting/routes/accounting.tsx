import { LegalEntityPage } from '@/accounting/pages/legal-entity';
import type { TModuleRoutes } from '@/shared/lib/types/routes.types';

export const useAccountingRoutes: TModuleRoutes = (basePath) => ({
  path: basePath,
  element: <LegalEntityPage />,
});
