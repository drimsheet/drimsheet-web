import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedAccountingEntity,
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';

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

for (const type of ['inflow', 'outflow', 'transfer'] as const) {
  test(`${type} restores its category continuation and the active row after URL cleanup`, async ({
    page,
  }) => {
    await registerAuthenticatedAppRoutes(page);
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
        side === (type === 'inflow' ? 'destination' : 'source');

      const categoryType = type === 'inflow' ? 'revenue' : 'expense';

      const categories = ['old-category', 'new-category'].map((id) => ({
        id,
        name: id,
        code: id,
        type: categoryType,
        behavior: categoryType,
        balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
      }));

      let data = categories;
      if (isAccountSide) {
        data = [createdAccount];
      } else if (type === 'transfer') {
        data = [
          ...categories,
          { ...createdAccount, id: 'destination-account' },
        ];
      }

      return route.fulfill({
        json: {
          data,
          meta: { page: 1, limit: 100, total: data.length, totalPages: 1 },
        },
      });
    });
    await page.goto(`/transactions/${type}`);
    await expect(
      page.getByRole('button', { name: 'Create', exact: true })
    ).toBeVisible();
    await page.evaluate(
      async ({ type, userId, entityId }) => {
        const modulePath =
          '/src/journal-entries/lib/services/storage.service.ts';

        const { journalEntryStorageService } = await import(
          /* @vite-ignore */ modulePath
        );

        const amount = { amount: 250, currencyCode: 'NGN', isMinorUnit: false };

        const values = {
          accountId: 'petty-cash-account',
          sourceAccountId: 'petty-cash-account',
          destinationAccountId: 'destination-account',
          categoryId: 'old-category',
          amount,
          amountSent: amount,
          amountReceived: amount,
          date: '2026-09-21',
          exchangeRate: null,
          description: 'Preserved transaction',
          counterparty: { id: 'party-1', name: 'Acme' },
          isItemized: type !== 'inflow',
          items:
            type === 'inflow'
              ? []
              : [
                  {
                    id: 'row-1',
                    accountId: 'old-category',
                    amount: { ...amount, amount: 25 },
                    description: 'Unfinished row',
                  },
                ],
          attachment: new File(['receipt contents'], 'continuation.pdf', {
            type: 'application/pdf',
          }),
        };

        const scope = `user:${encodeURIComponent(userId)}:entity:${encodeURIComponent(entityId)}:journal-entries`;
        await journalEntryStorageService.saveContinuation(
          scope,
          type,
          'category-return',
          values
        );
      },
      {
        type,
        userId: authenticatedUser.id,
        entityId: authenticatedAccountingEntity.id,
      }
    );

    const params = new URLSearchParams({
      continuationKey: 'category-return',
      keep: 'yes',
    });

    if (type !== 'inflow') {
      params.set('categoryItemId', 'row-1');
    }

    // Transfer returns from cancellation, retaining the original row category.
    if (type !== 'transfer') {
      params.set('categoryId', 'new-category');
    }

    await page.goto(`/transactions/${type}?${params}`);
    await expect(page).toHaveURL(`/transactions/${type}?keep=yes`);
    await expect(
      page.getByLabel('Description', { exact: true }).last()
    ).toHaveValue('Preserved transaction');
    await expect(
      page.getByText('continuation.pdf', { exact: true })
    ).toBeVisible();

    const category = page.getByRole('combobox', {
      name: 'Category',
      exact: true,
    });

    await expect(category).toHaveValue(
      type === 'transfer' ? 'old-category' : 'new-category'
    );
    await category.click();
    await expect(
      page.getByRole('option', { name: 'Add a new category' })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    if (type !== 'inflow') {
      await expect(
        page.getByRole('button', { name: 'Create', exact: true })
      ).toBeDisabled();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(
        page.getByRole('button', { name: 'Create', exact: true })
      ).toBeEnabled();
    }
  });
}

for (const type of ['inflow', 'outflow'] as const) {
  test(`${type} opens counterparty creation from role selection without resetting the transaction`, async ({
    page,
  }) => {
    await registerAuthenticatedAppRoutes(page);
    await page.route('**/api/v1/counterparties*', (route) =>
      route.fulfill({
        json: {
          data: [],
          meta: { page: 1, limit: 100, total: 0, totalPages: 1 },
        },
      })
    );
    await page.route('**/api/v1/ledger/posting-accounts*', (route) =>
      route.fulfill({
        json: {
          data: [],
          meta: { page: 1, limit: 100, total: 0, totalPages: 1 },
        },
      })
    );
    await page.goto(`/transactions/${type}?keep=yes`);
    await page
      .getByLabel('Description', { exact: true })
      .fill('Preserved transaction');
    await page.getByLabel('Attach file', { exact: true }).setInputFiles({
      name: 'counterparty.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('receipt'),
    });
    await page
      .getByRole('combobox', {
        name: type === 'inflow' ? 'Payer' : 'Recipient',
        exact: true,
      })
      .fill('A & B Partners');
    await page
      .getByRole('option', { name: 'Add new counterparty', exact: true })
      .click();

    const selector = page.getByRole('dialog', {
      name: 'Select a role',
      exact: true,
    });

    await expect(selector).toBeVisible();
    await selector.getByRole('radio', { name: /default/i }).check();
    await selector
      .getByRole('button', { name: 'Continue', exact: true })
      .click();

    await expect(selector).toBeHidden();
    await expect(
      page.getByRole('dialog', {
        name: 'Create person or business',
        exact: true,
      })
    ).toBeVisible();
    await expect(page).toHaveURL(`/transactions/${type}?keep=yes`);
    await expect(page.getByLabel('Description', { exact: true })).toHaveValue(
      'Preserved transaction'
    );
    await expect(
      page.getByText('counterparty.pdf', { exact: true })
    ).toBeVisible();
  });
}

test('dismissing counterparty role selection restores focus and preserves the inflow', async ({
  page,
}) => {
  await registerAuthenticatedAppRoutes(page);
  await page.route('**/api/v1/counterparties*', (route) =>
    route.fulfill({
      json: {
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 1 },
      },
    })
  );
  await page.route('**/api/v1/ledger/posting-accounts*', (route) =>
    route.fulfill({
      json: {
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 1 },
      },
    })
  );
  await page.goto('/transactions/inflow?keep=yes');

  const counterparty = page.getByRole('combobox', {
    name: 'Payer',
    exact: true,
  });

  const description = page.getByLabel('Description', { exact: true });
  await description.fill('Unfinished inflow');
  await counterparty.fill('New payer');
  await page
    .getByRole('option', { name: 'Add new counterparty', exact: true })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Select a role', exact: true })
  ).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL('/transactions/inflow?keep=yes');
  await expect(counterparty).toHaveValue('New payer');
  await expect(counterparty).toBeFocused();
  await expect(description).toHaveValue('Unfinished inflow');
});
