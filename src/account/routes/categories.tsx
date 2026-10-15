import { CategoriesPage } from '@/account/pages/categories';
import { CategoryCreationPage } from '@/account/pages/category-creation';
import type { TModuleRoutes } from '@/shared/lib/types/routes.types';

export const useCategoryRoutes: TModuleRoutes = (basePath) => ({
  path: basePath,
  children: [
    { index: true, element: <CategoriesPage /> },
    { path: 'new', element: <CategoryCreationPage /> },
  ],
});
