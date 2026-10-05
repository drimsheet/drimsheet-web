import type { ITransferEntryReq } from '@/shared/lib/api/Api';
import { expect, test } from '@integration/fixtures/test';
import {
  authenticatedUser,
  registerAuthenticatedAppRoutes,
} from '@integration/mocks/authenticated-app';
import type { Page } from '@playwright/test';

const loginEndpoint = '**/api/v1/auth/login-with-email';
const refreshEndpoint = '**/api/v1/auth/refresh-access-token';
const postingAccountsEndpoint = '**/api/v1/ledger/posting-accounts*';
const createTransferEndpoint = '**/api/v1/journal-entries/transfer';
const journalEntriesEndpoint = '**/api/v1/journal-entries?*';
const prepareUploadEndpoint = '**/api/v1/files/upload';
const directUploadEndpoint = 'https://uploads.example.test/transfer*';

const sourceAccounts = [
  {
    id: 'source-bank',
    code: '1000',
    name: 'Operating account',
    type: 'asset',
    subType: 'cash_and_cash_equivalent',
    behavior: 'bank',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
];

const destinationAccounts = [
  {
    id: 'petty-cash',
    code: '1010',
    name: 'Petty cash',
    type: 'asset',
    subType: 'cash_and_cash_equivalent',
    behavior: 'petty_cash',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
  {
    id: 'bank-fees',
    code: '6000',
    name: 'Bank fees',
    type: 'expense',
    subType: 'general_and_administrative',
    behavior: 'expense',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
];

interface IPostingAccountQuery {
  limit: string | null;
  side: string | null;
  sourceType: string | null;
}

interface IUploadLog {
  directUploads: number;
  preparationBody: unknown;
}

async function registerTransferPageRoutes(
  page: Page,
  postingAccounts: IPostingAccountQuery[]
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
    const data = side === 'source' ? sourceAccounts : destinationAccounts;

    postingAccounts.push({
      limit: url.searchParams.get('limit'),
      side,
      sourceType: url.searchParams.get('sourceType'),
    });
    await route.fulfill({
      json: {
        data,
        meta: { page: 1, limit: 100, total: data.length, totalPages: 1 },
      },
    });
  });
}

async function registerAttachmentRoutes(page: Page, uploadLog: IUploadLog) {
  await page.route(prepareUploadEndpoint, async (route) => {
    uploadLog.preparationBody = JSON.parse(route.request().postData() ?? '[]');
    await route.fulfill({
      status: 200,
      json: [
        {
          uploadUrl: 'https://uploads.example.test/transfer',
          reference: 'attachment-reference-1',
          headers: { 'Content-Type': 'application/pdf' },
          file: {
            url: 'https://files.example.test/transfer.pdf',
            name: 'transfer.pdf',
            type: 'application/pdf',
            size: 16,
          },
        },
      ],
    });
  });

  await page.route(directUploadEndpoint, async (route) => {
    uploadLog.directUploads += 1;
    await route.fulfill({ status: 200, body: '' });
  });
}

async function signInAndNavigateToTransfer(page: Page) {
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(authenticatedUser.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');

  await page.goto('/transactions/transfer');
  await expect(page).toHaveURL('/transactions/transfer');
}

test.describe('Cash transfer creation', () => {
  test('creates a transfer with an attachment and ordered fee line', async ({
    page,
  }) => {
    const postingAccountQueries: IPostingAccountQuery[] = [];

    const uploadLog: IUploadLog = {
      directUploads: 0,
      preparationBody: null,
    };

    await registerTransferPageRoutes(page, postingAccountQueries);
    await registerAttachmentRoutes(page, uploadLog);

    let capturedRequestBody: ITransferEntryReq | null = null;
    await page.route(createTransferEndpoint, async (route) => {
      capturedRequestBody = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({ status: 201, json: { id: 'transfer-entry-1' } });
    });

    await signInAndNavigateToTransfer(page);

    await expect.poll(() => postingAccountQueries.length).toBe(2);
    expect(postingAccountQueries).toEqual(
      expect.arrayContaining([
        { limit: '100', side: 'source', sourceType: 'transfer' },
        { limit: '100', side: 'destination', sourceType: 'transfer' },
      ])
    );

    await page.getByRole('combobox', { name: 'Source account' }).click();
    await page.getByRole('option', { name: 'Operating account' }).click();
    await page.getByRole('combobox', { name: 'Destination account' }).click();
    await page.getByRole('option', { name: 'Petty cash' }).click();
    await page.getByLabel('Amount sent', { exact: true }).fill('255');
    await page.getByLabel('Description').fill('Fund petty cash');

    await page.getByRole('button', { name: 'Add charges or fees' }).click();
    await page.getByLabel('Amount', { exact: true }).fill('5');
    await page.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option', { name: 'Bank fees' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await page.getByLabel('Attach receipt').setInputFiles({
      name: 'transfer.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('transfer content'),
    });
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('Transfer created successfully')).toBeVisible();
    await expect(page).toHaveURL('/transactions');
    expect(uploadLog.directUploads).toBe(1);
    expect(uploadLog.preparationBody).toEqual([
      {
        name: 'transfer.pdf',
        type: 'application/pdf',
        size: 16,
        purpose: 'journal_entry_attachment',
      },
    ]);
    expect(capturedRequestBody).not.toBeNull();

    const body = capturedRequestBody as unknown as ITransferEntryReq;
    expect(body.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.postedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    );
    expect(body).toEqual({
      attachmentReferences: ['attachment-reference-1'],
      sourceLine: {
        accountId: 'source-bank',
        amount: { amount: 255, currencyCode: 'NGN', isMinorUnit: false },
        exchangeRate: null,
        description: 'Fund petty cash',
        sequenceOrder: 1,
      },
      destinationLine: {
        accountId: 'petty-cash',
        amount: { amount: 250, currencyCode: 'NGN', isMinorUnit: false },
        exchangeRate: null,
        description: 'Fund petty cash',
        sequenceOrder: 2,
      },
      chargeLines: [
        {
          accountId: 'bank-fees',
          counterparty: null,
          amount: { amount: 5, currencyCode: 'NGN', isMinorUnit: false },
          exchangeRate: null,
          description: null,
          sequenceOrder: 3,
        },
      ],
      effectiveDate: body.effectiveDate,
      postedAt: body.postedAt,
      memo: 'Fund petty cash',
    });
  });
});
