import { expect, test } from '@integration/fixtures/test';
import { registerAuthenticatedAppRoutes } from '@integration/mocks/authenticated-app';

const currencies = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
];

const jurisdictions = [
  {
    code: 'NG',
    name: 'Nigeria',
    currencyCode: 'NGN',
    maxFiscalMonths: 18,
    accountingStandards: {
      individual: [],
      sole_trader: [],
      private_company: [],
    },
  },
];

const entityListEndpoint = '**/api/v1/accounting/accounting-entities';
const verificationEndpoint = '**/api/v1/auth/signup/complete**';
const verificationUrl = '/auth/signup/complete?token=onboarding-test-token';

test.beforeEach(async ({ page }) => {
  await registerAuthenticatedAppRoutes(page);
  await page.route('**/api/v1/currencies', async (route) => {
    await route.fulfill({ json: currencies });
  });
  await page.route('**/api/v1/accounting/jurisdictions', async (route) => {
    await route.fulfill({ json: jurisdictions });
  });
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
      name: 'Create a Legal Entity',
    })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Notifications' })).toHaveCount(
    0
  );

  await page.reload();

  await expect(page).toHaveURL('/onboarding');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Create a Legal Entity' })
  ).toBeVisible();

  await page.goto('/accounts');

  await expect(page).toHaveURL('/onboarding');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Create a Legal Entity' })
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

test('recovers from unavailable country options after browser refresh', async ({
  page,
}) => {
  let failCountries = true;
  await page.route(entityListEndpoint, async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route('**/api/v1/accounting/jurisdictions', async (route) => {
    await route.fulfill({ json: failCountries ? [] : jurisdictions });
  });
  await page.goto(verificationUrl);
  await expect(page.getByRole('alert')).toContainText(
    'We couldn’t load countries and currencies. Refresh the page to try again.'
  );
  await expect(page.getByRole('textbox', { name: 'Name' })).toBeDisabled();
  failCountries = false;
  await expect(
    page.getByRole('button', { name: /^(Retry|Try again)$/i })
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Name' })).toBeEnabled();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('preserves onboarding drafts across steps and updates linked report dates', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.clock.setFixedTime(new Date('2026-10-22T12:00:00Z'));
  await page.route(entityListEndpoint, async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.goto(verificationUrl);
  await test.step('Sidebar navigation and profile menu remain usable', async () => {
    await expect(page.getByRole('banner')).toHaveCount(0);
    await expect(page.getByRole('main')).toContainText('Step 1 of 5');
    await expect(
      page.getByRole('heading', {
        name: 'Create a Legal Entity',
        level: 1,
      })
    ).toBeVisible();

    const navigation = page.getByRole('navigation', {
      name: 'Onboarding steps',
    });

    await expect(page.getByText('After sign up')).toHaveCount(0);

    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole('listitem')).toHaveText([
      'Who it’s for',
      'Financial year',
      'Reports',
      'Income categories',
      'Expense categories',
    ]);
    await expect(navigation.getByRole('listitem').first()).toHaveAttribute(
      'aria-current',
      'step'
    );

    const profileButton = page.getByRole('button', {
      name: 'Profile',
      exact: true,
    });

    await expect(profileButton).toBeVisible();
    await expect(profileButton).toContainText('IU');

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
      page.getByRole('heading', {
        name: 'Create a Legal Entity',
        level: 1,
      })
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });
  await expect(
    page.getByRole('textbox', { name: 'Name', exact: true })
  ).toBeEnabled();
  await page.getByRole('combobox', { name: 'Who is this for?' }).click();
  await page.getByRole('option', { name: 'Individual', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Name', exact: true })
    .fill('Ada Okafor');
  await page.getByRole('combobox', { name: 'Country of residence' }).click();
  await page.getByRole('option', { name: /Nigeria/ }).click();
  await page.getByRole('combobox', { name: 'Official currency' }).click();
  await page.getByRole('option', { name: /Nigerian Naira/ }).click();
  await page
    .getByRole('button', { name: 'Continue to financial year' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Set up your financial year' })
  ).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Step 2 of 5');
  await expect(
    page
      .getByRole('navigation', { name: 'Onboarding steps' })
      .getByRole('listitem')
      .nth(1)
  ).toHaveAttribute('aria-current', 'step');

  await page
    .getByRole('textbox', { name: 'Financial year name' })
    .fill('FY 2026');
  await page
    .getByRole('textbox', { name: 'Quarter 1', exact: true })
    .fill('Launch');
  await page.getByRole('button', { name: 'Continue to reports' }).click();
  await expect(
    page.getByRole('heading', { name: 'Set up your reports' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Set up your financial year' })
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'Name', exact: true })
  ).toHaveValue('Ada Okafor');
  await page
    .getByRole('button', { name: 'Continue to financial year' })
    .click();
  await expect(
    page.getByRole('textbox', { name: 'Quarter 1', exact: true })
  ).toHaveValue('Launch');
  await page.getByRole('button', { name: 'Continue to reports' }).click();
  await expect(
    page.getByRole('heading', { name: 'Set up your reports' })
  ).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Step 3 of 5');

  await expect(
    page.getByRole('region', { name: 'Financial year', exact: true })
  ).toContainText('FY 2026');

  const reportPeriods = page.getByRole('region', {
    name: 'Name your reporting periods',
  });

  await expect(reportPeriods.getByRole('textbox')).toHaveCount(4);
  await expect(
    page
      .getByRole('navigation', { name: 'Onboarding steps' })
      .getByRole('listitem')
      .nth(2)
  ).toHaveAttribute('aria-current', 'step');

  await page
    .getByRole('textbox', { name: 'Reporting setup name' })
    .fill('Board pack');
  await page
    .getByRole('combobox', { name: 'Currency for your reports' })
    .click();
  await page.getByRole('option', { name: /Nigerian Naira/ }).click();
  await expect(page.getByRole('listbox')).not.toBeVisible();
  await reportPeriods
    .getByRole('textbox', { name: 'Quarter 1', exact: true })
    .fill('Board review');
  await page
    .getByRole('button', { name: 'Continue to income categories' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Choose your income categories' })
  ).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Step 4 of 5');
  await expect(
    page
      .getByRole('navigation', { name: 'Onboarding steps' })
      .getByRole('listitem')
      .nth(3)
  ).toHaveAttribute('aria-current', 'step');

  await expect(page.getByRole('status')).toHaveText('4 selected');
  await page.getByRole('checkbox', { name: 'Gifts (Default)' }).uncheck();
  await page.getByRole('button', { name: 'Add income category' }).click();
  await page.getByRole('combobox', { name: /Parent account/ }).click();
  await page.getByRole('option', { name: 'Services', exact: true }).click();
  await page.getByRole('textbox', { name: /Category name/ }).fill('Consulting');
  await page.getByRole('button', { name: 'Add to setup' }).click();
  await expect(
    page.getByRole('checkbox', { name: 'Consulting' })
  ).toBeChecked();
  await expect(page.getByRole('status')).toHaveText('4 selected');
  await page
    .getByRole('button', { name: 'Continue to expense categories' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Choose your expense categories' })
  ).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Step 5 of 5');
  await expect(
    page
      .getByRole('navigation', { name: 'Onboarding steps' })
      .getByRole('listitem')
      .nth(4)
  ).toHaveAttribute('aria-current', 'step');

  await expect(page.getByRole('status')).toHaveText('4 selected');
  await expect(page.getByRole('checkbox', { name: 'Consulting' })).toHaveCount(
    0
  );
  await page.getByRole('checkbox', { name: 'Interest (Default)' }).uncheck();
  await page.getByRole('button', { name: 'Add expense category' }).click();
  await page
    .getByRole('textbox', { name: /Category name/ })
    .fill('Discard this');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('3 selected');
  await page.getByRole('button', { name: 'Add expense category' }).click();
  await page.getByRole('combobox', { name: /Parent account/ }).click();
  await page.getByRole('option', { name: 'Direct costs', exact: true }).click();
  await page.getByRole('textbox', { name: /Category name/ }).fill('Materials');
  await page.getByRole('button', { name: 'Add to setup' }).click();
  await expect(page.getByRole('checkbox', { name: 'Materials' })).toBeChecked();
  await expect(page.getByRole('status')).toHaveText('4 selected');
  await expect(
    page.getByRole('button', { name: 'Finish setup' })
  ).toBeEnabled();
  await expect(
    page.getByRole('heading', { name: 'Choose your expense categories' })
  ).toBeVisible();
  await expect(page).toHaveURL('/onboarding');
  await page.getByRole('button', { name: 'About expense categories' }).click();
  await expect(
    page.getByRole('button', { name: 'About expense categories' })
  ).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(
    page.getByRole('checkbox', { name: 'Consulting' })
  ).toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: 'Gifts (Default)' })
  ).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Materials' })).toHaveCount(
    0
  );
  await page
    .getByRole('button', { name: 'Continue to expense categories' })
    .click();
  await expect(page.getByRole('checkbox', { name: 'Materials' })).toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: 'Interest (Default)' })
  ).not.toBeChecked();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'About income categories' }).click();
  await expect(
    page.getByRole('button', { name: 'About income categories' })
  ).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'Reporting setup name' })
  ).toHaveValue('Board pack');
  await page
    .getByRole('button', { name: 'Continue to income categories' })
    .click();
  await expect(
    page.getByRole('checkbox', { name: 'Consulting' })
  ).toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: 'Gifts (Default)' })
  ).not.toBeChecked();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'How reporting periods work' })
    .click();
  await expect(
    page.getByRole('button', { name: 'How reporting periods work' })
  ).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Financial year name' })
    .fill('Revised FY 2026');
  await page.getByRole('button', { name: 'Year ends' }).click();
  await page.getByRole('button', { name: /December 30th, 2026/ }).click();
  await page.getByRole('button', { name: 'Continue to reports' }).click();
  await expect(
    page.getByRole('region', { name: 'Financial year', exact: true })
  ).toContainText('Revised FY 2026');
  await expect(
    page.getByRole('textbox', { name: 'Reporting setup name' })
  ).toHaveValue('Board pack');
  await expect(
    page.getByRole('combobox', { name: 'Currency for your reports' })
  ).toHaveValue('Nigerian Naira');
  await expect(
    reportPeriods.getByRole('textbox', { name: 'Quarter 1', exact: true })
  ).toHaveValue('Board review');
  await expect(
    reportPeriods.getByRole('textbox', { name: 'Quarter 4', exact: true })
  ).toHaveAccessibleDescription('Oct 1, 2026 – Dec 30, 2026 Current');
});

test('keeps mobile onboarding actions visible and long period lists keyboard-scrollable', async ({
  page,
}) => {
  const viewport = { width: 375, height: 812 };
  await page.setViewportSize(viewport);
  await page.clock.setFixedTime(new Date('2026-10-22T12:00:00Z'));
  await page.route(entityListEndpoint, (route) => route.fulfill({ json: [] }));
  await page.goto(verificationUrl);
  await test.step('Sidebar navigation and profile menu remain usable', async () => {
    await expect(page.getByRole('banner')).toHaveCount(0);
    await expect(page.getByRole('main')).toContainText('Step 1 of 5');
    await expect(
      page.getByRole('heading', {
        name: 'Create a Legal Entity',
        level: 1,
      })
    ).toBeVisible();

    const navigation = page.getByRole('navigation', {
      name: 'Onboarding steps',
    });

    const sidebarTrigger = page.getByRole('button', { name: 'Toggle Sidebar' });
    await expect(page.getByText('After sign up')).toHaveCount(0);

    await expect(navigation).not.toBeVisible();
    await sidebarTrigger.click();
    await expect(navigation).toBeVisible();

    const profileButton = page.getByRole('button', {
      name: 'Profile',
      exact: true,
    });

    await expect(profileButton).toBeVisible();
    await expect(profileButton).toContainText('IU');

    await profileButton.click();
    await expect(page.getByRole('menu')).toContainText('Integration User');
    await expect(page.getByRole('menu')).toContainText(
      'integration.user@example.com'
    );
    await page.getByRole('menuitem', { name: 'Log out' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('alertdialog')).not.toBeVisible();
    await page.keyboard.press('Escape');

    await expect(
      page.getByRole('heading', {
        name: 'Create a Legal Entity',
        level: 1,
      })
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });

  const expectPinnedAction = async (title: string, actionName: string) => {
    const step = page.getByRole('region', { name: title, exact: true });
    const action = step.getByRole('button', { name: actionName, exact: true });
    const main = page.getByRole('main');
    await expect(action).toBeInViewport({ ratio: 1 });

    const actionTop = await action.evaluate(
      (element) => element.getBoundingClientRect().top
    );

    const maxScroll = await main.evaluate(
      (element) => element.scrollHeight - element.clientHeight
    );

    await main.evaluate((element) => element.scrollTo(0, element.scrollHeight));
    await expect
      .poll(() => main.evaluate((element) => element.scrollTop))
      .toBe(maxScroll);
    await expect(action).toBeInViewport({ ratio: 1 });
    await expect
      .poll(() =>
        action.evaluate((element) => element.getBoundingClientRect().top)
      )
      .toBe(actionTop);
    await main.evaluate((element) => element.scrollTo(0, 0));
  };

  const expectScrollablePeriods = async (name: string) => {
    const periods = page.getByRole('region', { name, exact: true });
    await expect
      .poll(() =>
        periods.evaluate(
          (element) => element.scrollHeight > element.clientHeight
        )
      )
      .toBe(true);
    await periods.focus();
    await page.keyboard.press('End');
    await expect
      .poll(() => periods.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await expect(periods.getByRole('textbox').last()).toBeInViewport();
  };

  await expectPinnedAction(
    'Create a Legal Entity',
    'Continue to financial year'
  );
  await page.getByRole('combobox', { name: 'Who is this for?' }).click();
  await page.getByRole('option', { name: 'Individual', exact: true }).click();
  await page.getByRole('combobox', { name: 'Country of residence' }).click();
  await page.getByRole('option', { name: /Nigeria/ }).click();
  await page
    .getByRole('button', { name: 'Continue to financial year' })
    .click();
  await page
    .getByRole('combobox', {
      name: 'How would you like to group your records?',
    })
    .click();
  await page.getByRole('option', { name: 'By day', exact: true }).click();
  await expectScrollablePeriods('Name your accounting periods');
  await expectPinnedAction('Set up your financial year', 'Continue to reports');
  await page.getByRole('button', { name: 'Continue to reports' }).click();
  await page.setViewportSize({ width: viewport.width, height: 500 });
  await expectPinnedAction(
    'Set up your reports',
    'Continue to income categories'
  );
  await page.getByRole('textbox', { name: 'Reporting setup name' }).focus();
  await expect(
    page.getByRole('textbox', { name: 'Reporting setup name' })
  ).toBeInViewport({ ratio: 1 });
  await page.setViewportSize(viewport);
  await page
    .getByRole('combobox', { name: 'How much time should each report cover?' })
    .click();
  await page.getByRole('option', { name: 'One day', exact: true }).click();
  await expectScrollablePeriods('Name your reporting periods');
  await page
    .getByRole('button', { name: 'Continue to income categories' })
    .click();
  await expectPinnedAction(
    'Choose your income categories',
    'Continue to expense categories'
  );
  await page
    .getByRole('button', { name: 'Continue to expense categories' })
    .click();
  await expectPinnedAction('Choose your expense categories', 'Finish setup');
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    )
    .toBe(true);
});

test('waits for profile data before allowing the individual selection', async ({
  page,
}) => {
  let releaseProfile = () => {};

  const profileResponse = new Promise<void>((resolve) => {
    releaseProfile = resolve;
  });

  await page.route('**/api/v1/users/profile', async (route) => {
    await profileResponse;
    await route.fulfill({
      json: { firstName: 'Ada', lastName: 'Okafor', email: 'ada@example.com' },
    });
  });
  await page.route(entityListEndpoint, (route) => route.fulfill({ json: [] }));
  await page.goto(verificationUrl);
  await expect(page.getByRole('status')).toHaveText('Loading Drimsheet');
  await expect(
    page.getByRole('combobox', { name: 'Who is this for?' })
  ).toHaveCount(0);
  releaseProfile();
  await expect(page).toHaveURL('/onboarding');
  await page.getByRole('combobox', { name: 'Who is this for?' }).click();
  await page.getByRole('option', { name: 'Individual', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'Name', exact: true })
  ).toHaveValue('Ada Okafor');
});

test('uses the jurisdiction financial year and allows its warning', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-10-23T12:00:00Z'));
  await page.route(entityListEndpoint, (route) => route.fulfill({ json: [] }));
  await page.route('**/api/v1/accounting/jurisdictions', (route) =>
    route.fulfill({
      json: [
        ...jurisdictions,
        {
          ...jurisdictions[0],
          code: 'AU',
          name: 'Australia',
          currencyCode: 'AUD',
        },
      ],
    })
  );
  await page.route('**/api/v1/currencies', (route) =>
    route.fulfill({
      json: [
        ...currencies,
        { code: 'AUD', name: 'Australian Dollar', symbol: '$', minorUnit: 2 },
      ],
    })
  );
  await page.goto(verificationUrl);
  await page.getByRole('combobox', { name: 'Who is this for?' }).click();
  await page.getByRole('option', { name: 'Individual', exact: true }).click();
  await page.getByRole('combobox', { name: 'Country of residence' }).click();
  await page.getByRole('option', { name: /Australia/ }).click();
  await page
    .getByRole('button', { name: 'Continue to financial year' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Year starts', exact: true })
  ).toHaveText(/1 Jul 2026/);
  await expect(
    page.getByRole('button', { name: 'Year ends', exact: true })
  ).toHaveText(/30 Jun 2027/);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Year ends', exact: true }).click();
  await page.getByRole('button', { name: /June 29th, 2027/ }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Your selected dates differ from this jurisdiction’s official financial year'
  );
  await page.getByRole('alert').scrollIntoViewIfNeeded();
  await page
    .getByRole('button', { name: 'Continue to reports', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Set up your reports', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Year ends', exact: true })
  ).toHaveText(/29 Jun 2027/);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Country of residence' })
    .fill('Nigeria');
  await page.getByRole('option', { name: /Nigeria/ }).click();
  await page
    .getByRole('button', { name: 'Continue to financial year' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Year starts', exact: true })
  ).toHaveText(/1 Jan 2026/);
  await expect(
    page.getByRole('button', { name: 'Year ends', exact: true })
  ).toHaveText(/31 Dec 2026/);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('defaults reports from the legal entity and fiscal year and advances without saving', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-10-23T12:00:00Z'));
  await page.route(entityListEndpoint, (route) => route.fulfill({ json: [] }));
  await page.route('**/api/v1/currencies', (route) =>
    route.fulfill({
      json: [
        ...currencies,
        { code: 'USD', name: 'US Dollar', symbol: '$', minorUnit: 2 },
      ],
    })
  );
  const saveRequests: string[] = [];
  await page.route('**/api/v1/accounting/**', async (route) => {
    if (route.request().method() !== 'GET') {
      saveRequests.push(route.request().url());
      await route.fulfill({ status: 400, json: {} });

      return;
    }

    await route.fallback();
  });
  await page.goto(verificationUrl);
  await page.getByRole('combobox', { name: 'Who is this for?' }).click();
  await page.getByRole('option', { name: 'Individual', exact: true }).click();
  await page.getByRole('combobox', { name: 'Country of residence' }).click();
  await page.getByRole('option', { name: /Nigeria/ }).click();
  await page
    .getByRole('combobox', { name: 'Official currency' })
    .fill('US Dollar');
  await page.getByRole('option', { name: /US Dollar/ }).click();
  await expect(page.getByRole('alert')).toContainText(
    'The selected currency does not match the official currency of Nigeria (NGN). You can still continue.'
  );
  await page
    .getByRole('button', { name: 'Continue to financial year' })
    .click();
  await page
    .getByRole('textbox', { name: 'Financial year name' })
    .fill('Trading 2026');
  await page
    .getByRole('button', { name: 'Continue to reports', exact: true })
    .click();
  const name = page.getByRole('textbox', { name: 'Reporting setup name' });

  const currency = page.getByRole('combobox', {
    name: 'Currency for your reports',
  });

  await expect(name).toHaveValue('Trading 2026 Reports');
  await expect(currency).toHaveValue('US Dollar');
  await page
    .getByRole('button', { name: 'Continue to income categories' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Choose your income categories' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await name.fill('Board pack');
  await currency.fill('Nigerian Naira');
  await page.getByRole('option', { name: /Nigerian Naira/ }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page
    .getByRole('button', { name: 'Continue to reports', exact: true })
    .click();
  await expect(name).toHaveValue('Board pack');
  await expect(currency).toHaveValue('Nigerian Naira');
  await page
    .getByRole('button', { name: 'Continue to income categories' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Choose your income categories' })
  ).toBeVisible();
  expect(saveRequests).toEqual([]);
});
