import { LegalEntityPage } from '@/accounting/pages/legal-entity';
import { LegalEntityDetailsPage } from '@/accounting/pages/legal-entity-details';
import type { TModuleRoutes } from '@/shared/lib/types/routes.types';

export const useAccountingRoutes: TModuleRoutes = (basePath) => ({
  path: basePath,
  children: [
    { index: true, element: <LegalEntityPage /> },
    { path: ':entityId', element: <LegalEntityDetailsPage /> },
  ],
});
