import { CategoriesPage } from '@/account/pages/categories';
import type { TModuleRoutes } from '@/shared/lib/types/routes.types';

export const useCategoryRoutes: TModuleRoutes = (basePath) => ({
  path: basePath,
  element: <CategoriesPage />,
});
