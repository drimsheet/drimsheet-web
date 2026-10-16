import type { TModuleRoutes } from '@/shared/lib/types/routes.types';
import { ProfilePage } from '@/user/pages/profile';

export const useUserRoutes: TModuleRoutes = (basePath) => ({
  path: basePath,
  element: <ProfilePage />,
});
