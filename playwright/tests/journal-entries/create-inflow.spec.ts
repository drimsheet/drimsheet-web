import type { IExchangeRate, IReceiptEntryReq } from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const loginEndpoint = '**/api/v1/auth/login-with-email';
const refreshEndpoint = '**/api/v1/auth/refresh-access-token';
const postingAccountsEndpoint = '**/api/v1/ledger/posting-accounts*';
const counterpartiesEndpoint = '**/api/v1/counterparties*';
const exchangeRatesEndpoint = '**/api/v1/currencies/exchange-rates*';
const createReceiptEndpoint = '**/api/v1/journal-entries/receipt';
const journalEntriesEndpoint = '**/api/v1/journal-entries?*';
const prepareUploadEndpoint = '**/api/v1/files/upload';
const directUploadEndpoint = 'https://uploads.example.test/receipt*';

const destinationAccounts = [
  {
    id: 'ngn-bank',
    code: '1000',
    name: 'NGN operating account',
    type: 'asset',
    subType: 'cash_and_cash_equivalent',
    behavior: 'bank',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
  {
    id: 'usd-bank',
    code: '1010',
    name: 'USD operating account',
    type: 'asset',
    subType: 'cash_and_cash_equivalent',
    behavior: 'bank',
    balance: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
  },
];

const sourceAccounts = [
  {
    id: 'consulting-revenue',
    code: '4000',
    name: 'Consulting revenue',
    type: 'revenue',
    subType: 'services',
    behavior: 'services',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
  {
    id: 'professional-services',
    code: '4010',
    name: 'Professional services',
    type: 'revenue',
    subType: 'services',
    behavior: 'services',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
];

const counterparties = [
  {
    id: 'payer-1',
    accountingEntityId: 'entity-1',
    name: 'Acme Consulting',
    status: 'active',
    type: 'organization',
    roles: ['customer'],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
];

interface IPostingAccountQuery {
  limit: string | null;
  side: string | null;
  sourceType: string | null;
}

interface IExchangeRateQuery {
  asOf: string | null;
  currencyPair: string | null;
  limit: string | null;
  type: string | null;
}

interface IInflowQueryLog {
  counterpartyLimits: Array<string | null>;
  exchangeRates?: IExchangeRateQuery[];
  postingAccounts: IPostingAccountQuery[];
}

interface IInflowRouteOptions {
  exchangeRateResponse?: (query: IExchangeRateQuery) => IExchangeRate[];
  postingAccountsGate?: Promise<void>;
}

interface IUploadLog {
  directUploads: number;
  preparationBody: unknown;
}

async function registerAttachmentUploadRoutes(page: Page, log: IUploadLog) {
  await page.route(prepareUploadEndpoint, async (route) => {
    log.preparationBody = JSON.parse(route.request().postData() ?? '[]');
    await route.fulfill({
      status: 200,
      json: [
        {
          uploadUrl: 'https://uploads.example.test/receipt',
          reference: 'attachment-reference-1',
          headers: { 'Content-Type': 'application/pdf' },
          file: {
            url: 'https://files.example.test/receipt.pdf',
            name: 'receipt.pdf',
            type: 'application/pdf',
            size: 15,
          },
        },
      ],
    });
  });

  await page.route(directUploadEndpoint, async (route) => {
    log.directUploads += 1;
    await route.fulfill({ status: 200, body: '' });
  });
}

async function registerInflowPageRoutes(
  page: Page,
  queryLog: IInflowQueryLog,
  options: IInflowRouteOptions = {}
) {
  await registerAuthenticatedAppRoutes(page);

  await page.route(refreshEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });

  await page.route(loginEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      json: { accessToken: 'integration-test-token' },
    });
  });

  await page.route(journalEntriesEndpoint, async (route) => {
    await route.fulfill({
      json: {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      },
    });
  });

  await page.route(postingAccountsEndpoint, async (route) => {
    const url = new URL(route.request().url());
    const side = url.searchParams.get('side');

    queryLog.postingAccounts.push({
      limit: url.searchParams.get('limit'),
      side,
      sourceType: url.searchParams.get('sourceType'),
    });

    const data = side === 'destination' ? destinationAccounts : sourceAccounts;

    await options.postingAccountsGate;
    await route.fulfill({
      json: {
        data,
        meta: { page: 1, limit: 100, total: data.length, totalPages: 1 },
      },
    });
  });

  await page.route(counterpartiesEndpoint, async (route) => {
    const url = new URL(route.request().url());
    queryLog.counterpartyLimits.push(url.searchParams.get('limit'));

    await route.fulfill({
      json: {
        data: counterparties,
        meta: {
          page: 1,
          limit: 100,
          total: counterparties.length,
          totalPages: 1,
        },
      },
    });
  });

  await page.route(exchangeRatesEndpoint, async (route) => {
    const url = new URL(route.request().url());

    const query = {
      asOf: url.searchParams.get('asOf'),
      currencyPair: url.searchParams.get('currencyPair'),
      limit: url.searchParams.get('limit'),
      type: url.searchParams.get('type'),
    } satisfies IExchangeRateQuery;

    queryLog.exchangeRates?.push(query);
    await route.fulfill({
      json: options.exchangeRateResponse?.(query) ?? [],
    });
  });
}

async function signInAndNavigateToInflow(page: Page) {
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');

  await page.goto('/transactions/inflow');
  await expect(page).toHaveURL('/transactions/inflow');
}

async function fillForeignCurrencyReceipt(page: Page) {
  await page.getByRole('combobox', { name: 'Account' }).click();
  await page.getByRole('option', { name: 'USD operating account' }).click();

  await expect(
    page.getByRole('combobox', { name: 'Currency: USD' })
  ).toBeDisabled();
  await expect(page.getByLabel('Exchange rate')).toBeEnabled();

  await page.getByLabel('Amount', { exact: true }).fill('1250.50');
  await page.getByLabel('Exchange rate').fill('1500');

  await page.getByRole('combobox', { name: 'Category' }).click();
  await page.getByRole('option', { name: 'Consulting revenue' }).click();

  const payer = page.getByRole('combobox', { name: 'Payer' });
  await payer.click();
  await expect(
    page.getByRole('option', { name: 'Acme Consulting' })
  ).toBeVisible();
  await page.getByRole('option', { name: 'Acme Consulting' }).click();

  await page.getByLabel('Description').fill('August consulting retainer');
}

test.describe('Inflow receipt creation', () => {
  test('renders the form skeleton until required query data is ready', async ({
    page,
  }) => {
    let releasePostingAccounts: () => void = () => undefined;

    const postingAccountsGate = new Promise<void>((resolve) => {
      releasePostingAccounts = resolve;
    });

    await registerInflowPageRoutes(
      page,
      { counterpartyLimits: [], postingAccounts: [] },
      { postingAccountsGate }
    );
    await signInAndNavigateToInflow(page);

    const loadingStatus = page.getByRole('status');
    await expect(loadingStatus).toHaveText('Loading transaction form');
    await expect(
      page.getByRole('combobox', { name: 'Account' })
    ).not.toBeVisible();

    releasePostingAccounts();

    await expect(loadingStatus).not.toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Account' })).toBeVisible();
  });

  test('refreshes the official rate when the inflow currency or date changes', async ({
    page,
  }) => {
    const exchangeRates: IExchangeRateQuery[] = [];

    const queryLog: IInflowQueryLog = {
      counterpartyLimits: [],
      exchangeRates,
      postingAccounts: [],
    };

    await registerInflowPageRoutes(page, queryLog, {
      exchangeRateResponse: (query) => {
        if (!query.currencyPair || !query.asOf) return [];

        const [baseCurrencyCode, targetCurrencyCode] =
          query.currencyPair.split('/');

        return [
          {
            currencyPair: query.currencyPair,
            baseCurrencyCode,
            targetCurrencyCode,
            rate: 1400 + exchangeRates.length,
            type: 'official',
            asOf: `${query.asOf}T00:00:00.000Z`,
            source: 'central-bank',
            createdAt: `${query.asOf}T01:00:00.000Z`,
          },
        ];
      },
    });
    await signInAndNavigateToInflow(page);

    expect(exchangeRates).toHaveLength(0);
    const account = page.getByRole('combobox', { name: 'Account' });
    await account.click();
    await page.getByRole('option', { name: 'USD operating account' }).click();

    await expect.poll(() => exchangeRates.length).toBe(1);
    const firstQuery = exchangeRates[0];
    expect(firstQuery).toEqual({
      asOf: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      currencyPair: 'USD/NGN',
      limit: '1',
      type: 'official',
    });
    await expect(page.getByText('Official rate: 1401')).toBeVisible();

    const previousDate = new Date(`${firstQuery.asOf}T00:00:00.000Z`);
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);
    const previousApiDate = previousDate.toISOString().slice(0, 10);

    const previousWeekday = previousDate.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      weekday: 'long',
    });

    const previousMonth = previousDate.toLocaleDateString('en-US', {
      month: 'long',
      timeZone: 'UTC',
    });

    await page.getByLabel('Date').click();
    await page
      .getByRole('button', {
        name: new RegExp(
          `^${previousWeekday}, ${previousMonth} ${previousDate.getUTCDate()}(?:st|nd|rd|th), ${previousDate.getUTCFullYear()}$`
        ),
      })
      .click();

    await expect.poll(() => exchangeRates.length).toBe(2);
    expect(exchangeRates[1]).toEqual({
      asOf: previousApiDate,
      currencyPair: 'USD/NGN',
      limit: '1',
      type: 'official',
    });
    await expect(page.getByText('Official rate: 1402')).toBeVisible();

    await account.fill('NGN');
    await page.getByRole('option', { name: 'NGN operating account' }).click();

    await expect(page.getByLabel('Exchange rate')).not.toBeVisible();
    expect(exchangeRates).toHaveLength(2);
  });

  test('loads permitted options and creates a foreign-currency receipt DTO once', async ({
    page,
  }) => {
    const queryLog: IInflowQueryLog = {
      counterpartyLimits: [],
      postingAccounts: [],
    };

    await registerInflowPageRoutes(page, queryLog);

    const uploadLog: IUploadLog = {
      directUploads: 0,
      preparationBody: null,
    };

    await registerAttachmentUploadRoutes(page, uploadLog);

    let capturedRequestBody: IReceiptEntryReq | null = null;
    let requestCount = 0;
    let releaseReceiptResponse: () => void = () => undefined;

    const receiptResponseGate = new Promise<void>((resolve) => {
      releaseReceiptResponse = resolve;
    });

    await page.route(createReceiptEndpoint, async (route) => {
      requestCount += 1;
      capturedRequestBody = JSON.parse(route.request().postData() ?? '{}');
      await receiptResponseGate;
      await route.fulfill({ status: 201, json: { id: 'receipt-entry-1' } });
    });

    await signInAndNavigateToInflow(page);

    await expect.poll(() => queryLog.postingAccounts.length).toBe(2);
    expect(queryLog.postingAccounts).toEqual(
      expect.arrayContaining([
        { limit: '100', side: 'destination', sourceType: 'receipt' },
        { limit: '100', side: 'source', sourceType: 'receipt' },
      ])
    );
    await expect.poll(() => queryLog.counterpartyLimits).toEqual(['100']);

    await fillForeignCurrencyReceipt(page);

    const fileInput = page.getByLabel('Attach file');
    await fileInput.setInputFiles({
      name: 'receipt.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('receipt content'),
    });
    await expect(page.getByText('receipt.pdf')).toBeVisible();

    const createButton = page.getByRole('button', { name: 'Create' });
    await createButton.click();

    await expect(createButton).toBeDisabled();
    await expect(page.locator('form')).toHaveAttribute('aria-busy', 'true');
    await expect.poll(() => requestCount).toBe(1);

    releaseReceiptResponse();

    await expect(
      page.getByText('Transaction was created successfully.')
    ).toBeVisible();
    await expect(page).toHaveURL('/transactions');
    expect(requestCount).toBe(1);
    expect(capturedRequestBody).not.toBeNull();

    const body = capturedRequestBody as unknown as IReceiptEntryReq;
    const effectiveDate = body.effectiveDate;

    const exchangeRate = {
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      rate: 1500,
      type: 'market',
      asOf: effectiveDate,
      source: 'manual',
    };

    expect(effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.postedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    );
    expect(uploadLog.preparationBody).toEqual([
      {
        name: 'receipt.pdf',
        type: 'application/pdf',
        size: 15,
        purpose: 'journal_entry_attachment',
      },
    ]);
    expect(uploadLog.directUploads).toBe(1);
    expect(body).toEqual({
      attachmentReferences: ['attachment-reference-1'],
      sourceLines: [
        {
          accountId: 'consulting-revenue',
          counterparty: {
            id: 'payer-1',
            name: 'Acme Consulting',
            type: 'organization',
          },
          amount: {
            amount: 1250.5,
            currencyCode: 'USD',
            isMinorUnit: false,
          },
          exchangeRate,
          description: 'August consulting retainer',
          sequenceOrder: 1,
        },
      ],
      destinationLine: {
        accountId: 'usd-bank',
        counterparty: {
          id: 'payer-1',
          name: 'Acme Consulting',
          type: 'organization',
        },
        amount: {
          amount: 1250.5,
          currencyCode: 'USD',
          isMinorUnit: false,
        },
        exchangeRate,
        description: 'August consulting retainer',
        sequenceOrder: 2,
      },
      effectiveDate,
      postedAt: body.postedAt,
      memo: 'August consulting retainer',
    });
  });

  test('itemizes categories and confirms before discarding additional rows', async ({
    page,
  }) => {
    await registerInflowPageRoutes(page, {
      counterpartyLimits: [],
      postingAccounts: [],
    });
    let capturedRequestBody: IReceiptEntryReq | null = null;
    await page.route(createReceiptEndpoint, async (route) => {
      capturedRequestBody = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({ status: 201, json: { id: 'itemized-entry-1' } });
    });
    await signInAndNavigateToInflow(page);

    await page.getByRole('combobox', { name: 'Account' }).click();
    await page.getByRole('option', { name: 'NGN operating account' }).click();
    await page.getByLabel('Amount', { exact: true }).fill('250');
    await page.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option', { name: 'Consulting revenue' }).click();
    await page.getByRole('combobox', { name: 'Payer' }).fill('Itemized payer');
    await page.keyboard.press('Escape');

    await page
      .getByRole('button', { name: 'Itemize this transaction' })
      .click();
    await expect(
      page.getByLabel('Amount', { exact: true }).nth(0)
    ).toBeDisabled();
    await page.getByLabel('Amount', { exact: true }).nth(1).fill('100');
    await expect(page.getByLabel('Amount', { exact: true }).nth(0)).toHaveValue(
      '250'
    );
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByLabel('Amount', { exact: true }).nth(0)).toHaveValue(
      '100'
    );
    await page.getByRole('button', { name: 'Add a new item' }).click();
    await page.getByLabel('Amount', { exact: true }).nth(1).fill('150');
    await expect(page.getByLabel('Amount', { exact: true }).nth(0)).toHaveValue(
      '100'
    );
    await page.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option', { name: 'Professional services' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByLabel('Amount', { exact: true }).nth(0)).toHaveValue(
      '250'
    );

    await page.getByRole('button', { name: 'Back to single entry' }).click();
    await expect(
      page.getByRole('alertdialog', { name: 'Return to single entry?' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Keep itemized entry' }).click();

    await page.getByRole('button', { name: 'Create' }).click();
    await expect(
      page.getByText('Transaction was created successfully.')
    ).toBeVisible();

    const body = capturedRequestBody as unknown as IReceiptEntryReq;
    expect(body.destinationLine.accountId).toBe('ngn-bank');
    expect(body.destinationLine.amount.amount).toBe(250);
    expect(body.destinationLine.sequenceOrder).toBe(3);
    expect(body.sourceLines).toEqual([
      expect.objectContaining({
        accountId: 'consulting-revenue',
        amount: expect.objectContaining({ amount: 100 }),
        sequenceOrder: 1,
      }),
      expect.objectContaining({
        accountId: 'professional-services',
        amount: expect.objectContaining({ amount: 150 }),
        sequenceOrder: 2,
      }),
    ]);
  });

  test('shows translated API feedback and retains form and upload state on failure', async ({
    page,
  }) => {
    await registerInflowPageRoutes(page, {
      counterpartyLimits: [],
      postingAccounts: [],
    });
    await registerAttachmentUploadRoutes(page, {
      directUploads: 0,
      preparationBody: null,
    });
    await page.route(createReceiptEndpoint, async (route) => {
      await route.fulfill({
        status: 500,
        json: { message: 'Receipt creation failed' },
      });
    });

    await signInAndNavigateToInflow(page);
    await fillForeignCurrencyReceipt(page);

    const fileInput = page.getByLabel('Attach file');
    await fileInput.setInputFiles({
      name: 'retained-receipt.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('retained receipt content'),
    });

    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('An error occurred')).toBeVisible();
    await expect(page.getByText('retained-receipt.pdf')).toBeVisible();
    await expect(page.getByLabel('Amount', { exact: true })).toHaveValue(
      '1,250.50'
    );
    await expect(page.getByLabel('Exchange rate')).toHaveValue('1,500');
    await expect(page.getByRole('combobox', { name: 'Payer' })).toHaveValue(
      'Acme Consulting'
    );
    await expect(page.getByLabel('Description')).toHaveValue(
      'August consulting retainer'
    );
  });
});
