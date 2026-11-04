import { expect, test } from '@integration/fixtures/test';
import { registerAuthenticatedAppRoutes } from '@integration/mocks/authenticated-app';

test.use({ authenticated: true });

const createdAccount = {
  id: 'petty-cash-account',
  code: '1000',
  name: 'Desk cash',
  type: 'asset',
  subType: 'cash_and_cash_equivalent',
  behavior: 'petty_cash',
  balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
};

for (const type of ['inflow', 'outflow', 'transfer'] as const) {
  test(`${type} selects an account created in its petty cash dialog`, async ({
    page,
  }) => {
    await registerAuthenticatedAppRoutes(page);
    let accountCreated = false;

    await page.route('**/api/v1/currencies*', (route) =>
      route.fulfill({
        json: [
          { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
        ],
      })
    );
    await page.route('**/api/v1/counterparties*', (route) =>
      route.fulfill({
        json: {
          data: [],
          meta: { page: 1, limit: 100, total: 0, totalPages: 1 },
        },
      })
    );
    await page.route('**/api/v1/ledger/posting-accounts*', (route) => {
      const side = new URL(route.request().url()).searchParams.get('side');

      const isAccountSide =
        type === 'transfer' ||
        side === (type === 'inflow' ? 'destination' : 'source');

      const data = isAccountSide && accountCreated ? [createdAccount] : [];

      return route.fulfill({
        json: {
          data,
          meta: { page: 1, limit: 100, total: data.length, totalPages: 1 },
        },
      });
    });
    await page.route('**/api/v1/ledger/asset/petty-cash', async (route) => {
      accountCreated = true;
      await route.fulfill({ json: createdAccount });
    });

    await page.goto(`/transactions/${type}`);
    const description = page.getByLabel('Description', { exact: true });
    await description.fill('Unfinished transaction');

    const account = page.getByRole('combobox', {
      name: type === 'transfer' ? 'Destination account' : 'Account',
      exact: true,
    });

    await test.step('Open petty cash creation from the transaction account field', async () => {
      await account.click();
      await page.getByRole('option', { name: 'Add a new account' }).click();
      const selector = page.getByRole('dialog');
      await selector.getByRole('radio', { name: /petty cash/i }).check();
      await selector
        .getByRole('button', { name: 'Continue', exact: true })
        .click();
    });

    await test.step('Apply the created account to the existing transaction form', async () => {
      const dialog = page.getByRole('dialog', {
        name: 'Create petty cash account',
        exact: true,
      });

      await dialog
        .getByRole('textbox', { name: 'Account display name', exact: true })
        .fill('Desk cash');
      await dialog
        .getByRole('checkbox', {
          name: 'Create without an opening balance',
          exact: true,
        })
        .check();
      await dialog
        .getByRole('button', { name: 'Create account', exact: true })
        .click();

      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(account).toHaveValue('Desk cash');
      await expect(description).toHaveValue('Unfinished transaction');
    });
  });
}
