import { DebtPage } from '@/debt/pages/debt';
import type { TModuleRoutes } from '@/shared/lib/types/routes.types';

export const useDebtRoutes: TModuleRoutes = (basePath) => ({
  path: basePath,
  element: <DebtPage />,
});
