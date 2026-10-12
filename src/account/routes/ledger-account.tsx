import { AccountsDashboardPage } from '@/account/pages/account-dashboard';
import { AccountDetailsPage } from '@/account/pages/account-details';
import type { TModuleRoutes } from '@/shared/lib/types/routes.types';

export const useLedgerAccountRoutes: TModuleRoutes = (basePath) => {
  return {
    path: basePath,
    children: [
      {
        index: true,
        element: <AccountsDashboardPage />,
      },
      {
        path: ':accountId',
        element: <AccountDetailsPage />,
      },
    ],
  };
};
