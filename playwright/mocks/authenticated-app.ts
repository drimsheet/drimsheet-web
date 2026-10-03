import type {
  IAccountingEntity,
  IUserProfileDto,
  TEntityId,
} from '@/shared/lib/api/Api';
import type { Page } from '@playwright/test';

const timestamp = '2026-01-01T00:00:00.000Z';

export const authenticatedUser = {
  id: '00000000-0000-4000-8000-000000000001' as TEntityId,
  email: 'integration.user@example.com',
  emailVerified: true,
  firstName: 'Integration',
  lastName: 'User',
  createdAt: timestamp,
  updatedAt: timestamp,
} satisfies IUserProfileDto;

export const authenticatedAccountingEntity = {
  id: '00000000-0000-4000-8000-000000000002' as TEntityId,
  name: 'Integration Entity',
  type: 'individual',
  ownerId: authenticatedUser.id,
  createdBy: authenticatedUser.id,
  functionalCurrencyCode: 'NGN',
  jurisdictionCode: 'NG',
  createdAt: timestamp,
  updatedAt: timestamp,
} satisfies IAccountingEntity;

export const alternateAccountingEntity = {
  ...authenticatedAccountingEntity,
  id: '00000000-0000-4000-8000-000000000003' as TEntityId,
  name: 'Drimsheet',
  type: 'private_company',
} satisfies IAccountingEntity;

export async function registerAuthenticatedAppRoutes(page: Page) {
  await page.route('**/api/v1/users/profile', async (route) => {
    await route.fulfill({ json: authenticatedUser });
  });
  await page.route(
    '**/api/v1/accounting/accounting-entities',
    async (route) => {
      await route.fulfill({ json: [authenticatedAccountingEntity] });
    }
  );
  await page.route('**/api/v1/accounting/accounting-entity', async (route) => {
    await route.fulfill({ json: authenticatedAccountingEntity });
  });
}

export async function registerLogoutRoute(page: Page) {
  await page.route('**/api/v1/auth/logout', async (route) => {
    await route.fulfill({ status: 204 });
  });
}
