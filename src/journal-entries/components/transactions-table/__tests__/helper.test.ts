import transactionsTableHelpers from '@/journal-entries/components/transactions-table/helper';
import {
  ECounterpartyStatus,
  EExchangeRateType,
  EJournalEntrySourceType,
  EJournalEntryStatus,
  EJournalSide,
  type IExchangeRate,
  type IFileAttachment,
  type IJournalEntryListDto,
  type IJournalLineListDto,
  type IMoneyDto,
  type TEntityId,
  type UJournalEntrySourceType,
} from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const accountNamesById: Record<string, string> = {
  'cash-main': 'Main checking',
  'cash-tax': 'Tax reserve',
  'cash-usd': 'USD account',
  donations: 'Donations',
  gift: 'Gift',
  services: 'Professional services',
};

const counterpartyNamesById: Record<string, string> = {
  'counterparty-1': 'Osahon Oboite',
  'counterparty-2': 'Ada Okafor',
};

function createMoney(amount: number, currencyCode = 'NGN'): IMoneyDto {
  return { amount, currencyCode, isMinorUnit: false };
}

function createExchangeRate(): IExchangeRate {
  return {
    asOf: '2026-09-16T00:00:00Z',
    baseCurrencyCode: 'USD',
    createdAt: '2026-09-16T10:00:00Z',
    currencyPair: 'USD/NGN',
    rate: 1590,
    source: 'User supplied',
    targetCurrencyCode: 'NGN',
    type: EExchangeRateType.Negotiated,
  };
}

function createLine({
  id,
  accountId,
  counterpartyId,
  sequenceOrder,
  amount,
  description = null,
  exchangeRate = null,
  functionalAmount = amount,
}: {
  id: string;
  accountId: string;
  counterpartyId: string | null;
  sequenceOrder: number;
  amount: IMoneyDto;
  description?: string | null;
  exchangeRate?: IExchangeRate | null;
  functionalAmount?: IMoneyDto;
}): IJournalLineListDto {
  return {
    id,
    entryId: 'entry-1',
    account: { id: accountId, name: accountNamesById[accountId] },
    counterparty: counterpartyId
      ? {
          id: counterpartyId,
          name: counterpartyNamesById[counterpartyId],
          status: ECounterpartyStatus.Active,
        }
      : null,
    sequenceOrder,
    amount,
    exchangeRate,
    functionalAmount,
    side: EJournalSide.Debit,
    description,
    createdAt: '2026-09-16T10:00:00Z',
    updatedAt: '2026-09-16T10:00:00Z',
  };
}

function createEntry(
  sourceType: UJournalEntrySourceType,
  lines: IJournalLineListDto[],
  {
    attachments = [],
    memo = null,
  }: { attachments?: IFileAttachment[]; memo?: string | null } = {}
): IJournalEntryListDto {
  return {
    id: `entry-${sourceType}`,
    accountingEntityId: 'entity-1',
    sourceType,
    memo,
    status: EJournalEntryStatus.Posted,
    effectiveDate: '2026-09-16T00:00:00Z',
    postedAt: '2026-09-16T10:00:00Z',
    voidedAt: null,
    voidingEntryId: null,
    createdBy: '00000000-0000-4000-8000-000000000100' as TEntityId,
    createdAt: '2026-09-16T10:00:00Z',
    updatedAt: '2026-09-16T10:00:00Z',
    attachments,
    lines,
  };
}

function createRows(entries: IJournalEntryListDto[]) {
  return transactionsTableHelpers.createRows({ entries });
}

describe('transactionsTableHelpers', () => {
  it('uses the payment source line and deduplicates counterparties and categories', () => {
    const sourceAmount = createMoney(125_000);

    const entry = createEntry(EJournalEntrySourceType.Payment, [
      createLine({
        id: 'line-3',
        accountId: 'donations',
        counterpartyId: 'counterparty-2',
        sequenceOrder: 3,
        amount: createMoney(25_000),
      }),
      createLine({
        id: 'line-1',
        accountId: 'cash-main',
        counterpartyId: 'counterparty-1',
        sequenceOrder: 1,
        amount: sourceAmount,
      }),
      createLine({
        id: 'line-4',
        accountId: 'gift',
        counterpartyId: 'counterparty-2',
        sequenceOrder: 4,
        amount: createMoney(50_000),
      }),
      createLine({
        id: 'line-2',
        accountId: 'gift',
        counterpartyId: 'counterparty-1',
        sequenceOrder: 2,
        amount: createMoney(50_000),
      }),
    ]);

    expect(createRows([entry])[0]).toEqual(
      expect.objectContaining({
        accountName: 'Main checking',
        additionalCategoryCount: 1,
        additionalCounterpartyCount: 1,
        amount: sourceAmount,
        direction: EJournalEntrySourceType.Payment,
        firstCategoryName: 'Gift',
        firstCounterpartyName: 'Osahon Oboite',
      })
    );
  });

  it('uses the receipt destination line for the account and amount', () => {
    const destinationAmount = createMoney(85_000);

    const entry = createEntry(EJournalEntrySourceType.Receipt, [
      createLine({
        id: 'line-2',
        accountId: 'cash-main',
        counterpartyId: 'counterparty-1',
        sequenceOrder: 2,
        amount: destinationAmount,
      }),
      createLine({
        id: 'line-1',
        accountId: 'services',
        counterpartyId: 'counterparty-1',
        sequenceOrder: 1,
        amount: createMoney(85_000),
      }),
    ]);

    expect(createRows([entry])[0]).toEqual(
      expect.objectContaining({
        accountName: 'Main checking',
        amount: destinationAmount,
        direction: EJournalEntrySourceType.Receipt,
        firstCategoryName: 'Professional services',
        firstCounterpartyName: 'Osahon Oboite',
      })
    );
  });

  it('uses the transfer source account and source amount', () => {
    const sourceAmount = createMoney(1_000, 'USD');

    const entry = createEntry(EJournalEntrySourceType.Transfer, [
      createLine({
        id: 'line-2',
        accountId: 'cash-main',
        counterpartyId: 'counterparty-1',
        sequenceOrder: 2,
        amount: createMoney(1_590_000),
      }),
      createLine({
        id: 'line-1',
        accountId: 'cash-usd',
        counterpartyId: 'counterparty-1',
        sequenceOrder: 1,
        amount: sourceAmount,
      }),
      createLine({
        id: 'line-3',
        accountId: 'gift',
        counterpartyId: 'counterparty-1',
        sequenceOrder: 3,
        amount: createMoney(10_000),
      }),
    ]);

    expect(createRows([entry])[0]).toEqual(
      expect.objectContaining({
        accountName: 'USD account',
        amount: sourceAmount,
        destinationAccountName: 'Main checking',
        direction: EJournalEntrySourceType.Transfer,
        sourceAccountName: 'USD account',
      })
    );
  });

  it('omits source types outside the supported transaction flows', () => {
    const entry = createEntry(EJournalEntrySourceType.Adjustment, [
      createLine({
        id: 'line-1',
        accountId: 'cash-main',
        counterpartyId: 'counterparty-1',
        sequenceOrder: 1,
        amount: createMoney(10_000),
      }),
    ]);

    expect(createRows([entry])).toEqual([]);
    expect(transactionsTableHelpers.createDetails(entry)).toBeUndefined();
  });

  it('creates ordered outflow details from the payment lines', () => {
    const exchangeRate = createExchangeRate();
    const functionalAmount = createMoney(1_590_000);

    const attachment = {
      name: 'receipt.pdf',
      size: 2048,
      type: 'application/pdf',
      url: 'https://example.com/receipt.pdf',
    };

    const entry = createEntry(
      EJournalEntrySourceType.Payment,
      [
        createLine({
          id: 'line-2',
          accountId: 'gift',
          counterpartyId: 'counterparty-2',
          sequenceOrder: 2,
          amount: createMoney(1_000, 'USD'),
          description: 'Thank-you gift',
        }),
        createLine({
          id: 'line-1',
          accountId: 'cash-usd',
          counterpartyId: 'counterparty-1',
          sequenceOrder: 1,
          amount: createMoney(1_000, 'USD'),
          exchangeRate,
          functionalAmount,
        }),
      ],
      { attachments: [attachment], memo: 'Annual gift' }
    );

    expect(transactionsTableHelpers.createDetails(entry)).toEqual({
      amount: createMoney(1_000, 'USD'),
      attachments: [attachment],
      cashAccountName: 'USD account',
      categories: [
        {
          accountId: 'gift',
          accountName: 'Gift',
          amount: createMoney(1_000, 'USD'),
          description: 'Thank-you gift',
          id: 'line-2',
        },
      ],
      counterparties: [
        { id: 'counterparty-1', name: 'Osahon Oboite' },
        { id: 'counterparty-2', name: 'Ada Okafor' },
      ],
      direction: EJournalEntrySourceType.Payment,
      effectiveDate: '2026-09-16T00:00:00Z',
      exchangeRate,
      functionalAmount,
      kind: 'cash',
      memo: 'Annual gift',
    });
  });

  it('creates transfer details with the source, destination, and every fee line', () => {
    const exchangeRate = createExchangeRate();

    const entry = createEntry(EJournalEntrySourceType.Transfer, [
      createLine({
        id: 'line-4',
        accountId: 'donations',
        counterpartyId: null,
        sequenceOrder: 4,
        amount: createMoney(500),
      }),
      createLine({
        id: 'line-2',
        accountId: 'cash-main',
        counterpartyId: null,
        sequenceOrder: 2,
        amount: createMoney(1_590_000),
      }),
      createLine({
        id: 'line-1',
        accountId: 'cash-usd',
        counterpartyId: null,
        sequenceOrder: 1,
        amount: createMoney(1_000, 'USD'),
        exchangeRate,
      }),
      createLine({
        id: 'line-3',
        accountId: 'gift',
        counterpartyId: null,
        sequenceOrder: 3,
        amount: createMoney(10_000),
        description: 'Bank fee',
      }),
    ]);

    expect(transactionsTableHelpers.createDetails(entry)).toEqual(
      expect.objectContaining({
        destinationAccountName: 'Main checking',
        destinationAmount: createMoney(1_590_000),
        exchangeRate,
        fees: [
          expect.objectContaining({
            accountName: 'Gift',
            description: 'Bank fee',
          }),
          expect.objectContaining({ accountName: 'Donations' }),
        ],
        kind: 'transfer',
        sourceAccountName: 'USD account',
        sourceAmount: createMoney(1_000, 'USD'),
      })
    );
  });

  it('does not create details when a supported transaction is incomplete', () => {
    const payment = createEntry(EJournalEntrySourceType.Payment, [
      createLine({
        id: 'line-1',
        accountId: 'cash-main',
        counterpartyId: null,
        sequenceOrder: 1,
        amount: createMoney(10_000),
      }),
    ]);

    const transfer = createEntry(EJournalEntrySourceType.Transfer, [
      createLine({
        id: 'line-1',
        accountId: 'cash-main',
        counterpartyId: null,
        sequenceOrder: 1,
        amount: createMoney(10_000),
      }),
    ]);

    expect(transactionsTableHelpers.createDetails(payment)).toBeUndefined();
    expect(transactionsTableHelpers.createDetails(transfer)).toBeUndefined();
  });
});
