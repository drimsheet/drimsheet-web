import { expect, test } from '@integration/fixtures/test';
import { registerAuthenticatedAppRoutes } from '@integration/mocks/authenticated-app';

const entityListEndpoint = '**/api/v1/accounting/accounting-entities';
const verificationEndpoint = '**/api/v1/auth/signup/complete**';
const verificationUrl = '/auth/signup/complete?token=onboarding-test-token';

test.beforeEach(async ({ page }) => {
  await registerAuthenticatedAppRoutes(page);
  await page.route(verificationEndpoint, async (route) => {
    await route.fulfill({
      json: { accessToken: 'integration-test-token' },
    });
  });
  await page.route('**/api/v1/auth/refresh-access-token', async (route) => {
    await route.fulfill({
      json: { accessToken: 'integration-test-token' },
    });
  });
});

test('redirects a newly verified user only after confirming they have no entities', async ({
  page,
}) => {
  let releaseEntities = () => {};

  const entitiesResponse = new Promise<void>((resolve) => {
    releaseEntities = resolve;
  });

  await page.route(entityListEndpoint, async (route) => {
    await entitiesResponse;
    await route.fulfill({ json: [] });
  });

  const entityRequest = page.waitForRequest(entityListEndpoint);
  await page.goto(verificationUrl);
  await entityRequest;

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('status')).toHaveText('Loading Drimsheet');

  releaseEntities();

  await expect(page).toHaveURL('/onboarding');
  await expect(
    page.getByRole('main').getByRole('heading', {
      level: 1,
      name: 'Hello world',
    })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Notifications' })).toHaveCount(
    0
  );

  await page.reload();

  await expect(page).toHaveURL('/onboarding');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Hello world' })
  ).toBeVisible();

  await page.goto('/accounts');

  await expect(page).toHaveURL('/onboarding');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Hello world' })
  ).toBeVisible();
});

test('keeps entity lookup failures out of onboarding', async ({ page }) => {
  await page.route(entityListEndpoint, async (route) => {
    await route.fulfill({ status: 500, json: {} });
  });

  await page.goto(verificationUrl);

  await expect(
    page.getByRole('heading', { name: 'Something went wrong' })
  ).toBeVisible();
  await expect(page).toHaveURL('/dashboard');
});

test('requires authentication to open onboarding directly', async ({
  page,
}) => {
  await page.goto('/onboarding');

  await expect(page).toHaveURL('/auth/signin');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Sign In' })
  ).toBeVisible();
});

for (const viewport of [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 812 },
]) {
  test(`shows fixed onboarding navigation and the profile menu on ${viewport.name}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.route(entityListEndpoint, async (route) => {
      await route.fulfill({ json: [] });
    });
    await page.goto(verificationUrl);

    await expect(page).toHaveURL('/onboarding');
    await page.reload();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Drimsheet' })).toBeVisible();
    await expect(page.getByRole('main')).toContainText('Step 1 of 5');
    await expect(
      page.getByRole('heading', { name: 'Hello world', level: 1 })
    ).toBeVisible();

    const navigation = page.getByRole('navigation', {
      name: 'Onboarding steps',
    });

    await expect(
      page.getByRole('button', { name: 'Toggle Sidebar' })
    ).toHaveCount(0);
    await expect(page.getByText('After sign up')).toHaveCount(0);

    if (viewport.name === 'mobile') {
      await expect(navigation).not.toBeVisible();
    } else {
      await expect(navigation).toBeVisible();
      await expect(navigation.getByRole('listitem')).toHaveText([
        '1Who it’s for',
        '2Financial year',
        '3Reports',
        '4Income categories',
        '5Expense categories',
      ]);
      await expect(navigation.getByRole('listitem').first()).toHaveAttribute(
        'aria-current',
        'step'
      );
    }

    const profileButton = page.getByRole('button', {
      name: 'Profile',
      exact: true,
    });

    await expect(profileButton).toBeVisible();
    await expect(profileButton).toContainText('IU');
    await page.screenshot({
      path: testInfo.outputPath('layout.png'),
      animations: 'disabled',
    });

    await profileButton.click();
    await expect(page.getByRole('menu')).toContainText('Integration User');
    await expect(page.getByRole('menu')).toContainText(
      'integration.user@example.com'
    );
    await page.getByRole('menuitem', { name: 'Log out' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('alertdialog')).not.toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Hello world', level: 1 })
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });
}
