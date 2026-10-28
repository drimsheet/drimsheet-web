import type { TModuleRoutes } from '@/shared/lib/types/routes.types';
import { TaxPage } from '@/tax/pages/tax';

export const useTaxRoutes: TModuleRoutes = (basePath) => ({
  path: basePath,
  element: <TaxPage />,
});
