import type { ICashTransactionFormValues } from '@/journal-entries/components/cash-transaction-form';
import type { ICashTransferFormValues } from '@/journal-entries/components/cash-transfer-form';
import { journalEntryMapper } from '@/journal-entries/lib/mappers/journal-entry.mapper';
import {
  ECounterpartyStatus,
  EExchangeRateType,
  EJournalEntrySourceType,
  EJournalEntryStatus,
  EJournalSide,
  type IJournalEntryListDto,
  type TEntityId,
} from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const occurredAt = '2026-08-12T10:30:00.000Z';

const values: ICashTransactionFormValues = {
  accountId: 'ngn-bank',
  categoryId: 'sales-revenue',
  amount: { amount: 250000, currencyCode: 'NGN', isMinorUnit: false },
  date: '2026-08-10',
  exchangeRate: null,
  isItemized: false,
  items: [],
  counterparty: { name: 'New counterparty' },
  description: '  August receipt  ',
  attachment: null,
};

const paymentValues: ICashTransactionFormValues = {
  accountId: 'ngn-bank',
  categoryId: 'office-expense',
  amount: { amount: 250000, currencyCode: 'NGN', isMinorUnit: false },
  date: '2026-08-10',
  exchangeRate: null,
  isItemized: false,
  items: [],
  counterparty: { name: 'New recipient' },
  description: '  August payment  ',
  attachment: null,
};

const transferValues: ICashTransferFormValues = {
  sourceAccountId: 'ngn-bank',
  destinationAccountId: 'petty-cash',
  amountSent: { amount: 250000, currencyCode: 'NGN', isMinorUnit: false },
  amountReceived: {
    amount: 250000,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
  date: '2026-08-10',
  exchangeRate: null,
  isItemized: false,
  items: [],
  description: '  Petty cash funding  ',
  attachment: null,
};

const paymentJournalEntry = {
  id: 'payment-entry',
  accountingEntityId: 'entity-1',
  sourceType: EJournalEntrySourceType.Payment,
  memo: 'Original memo',
  status: EJournalEntryStatus.Posted,
  effectiveDate: '2026-08-10T00:00:00.000Z',
  postedAt: occurredAt,
  voidedAt: null,
  voidingEntryId: null,
  createdBy: '00000000-0000-4000-8000-000000000100' as TEntityId,
  createdAt: occurredAt,
  updatedAt: occurredAt,
  attachments: [
    {
      url: 'https://files.example.com/original.pdf',
      name: 'original.pdf',
      type: 'application/pdf',
      size: 42,
    },
  ],
  lines: [
    {
      id: 'cash-line',
      entryId: 'payment-entry',
      account: { id: 'ngn-bank', name: 'Bank' },
      counterparty: {
        id: 'vendor-1',
        name: 'Vendor',
        status: ECounterpartyStatus.Active,
      },
      sequenceOrder: 1,
      amount: { amount: 250000, currencyCode: 'NGN', isMinorUnit: false },
      exchangeRate: null,
      functionalAmount: {
        amount: 250000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      side: EJournalSide.Credit,
      description: null,
      createdAt: occurredAt,
      updatedAt: occurredAt,
    },
    {
      id: 'office-line',
      entryId: 'payment-entry',
      account: { id: 'office-expense', name: 'Office expense' },
      counterparty: {
        id: 'vendor-1',
        name: 'Vendor',
        status: ECounterpartyStatus.Active,
      },
      sequenceOrder: 2,
      amount: { amount: 250000, currencyCode: 'NGN', isMinorUnit: false },
      exchangeRate: null,
      functionalAmount: {
        amount: 250000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      side: EJournalSide.Debit,
      description: null,
      createdAt: occurredAt,
      updatedAt: occurredAt,
    },
  ],
} satisfies IJournalEntryListDto;

describe('journalEntryMapper', () => {
  it('maps foreign-currency context to the official exchange-rate query', () => {
    expect(
      journalEntryMapper.toExchangeRateQuery(
        { currencyCode: 'USD', date: '2026-08-10' },
        'NGN'
      )
    ).toEqual({
      currencyPair: 'USD/NGN',
      type: EExchangeRateType.Official,
      asOf: '2026-08-10',
      limit: 1,
    });
  });

  it.each([
    [undefined, 'NGN'],
    [{ currencyCode: '', date: '2026-08-10' }, 'NGN'],
    [{ currencyCode: 'USD', date: '' }, 'NGN'],
    [{ currencyCode: 'USD', date: '2026-08-10' }, ''],
    [{ currencyCode: 'NGN', date: '2026-08-10' }, 'NGN'],
  ])(
    'omits the exchange-rate query when conversion context is incomplete or same-currency',
    (currencyContext, functionalCurrencyCode) => {
      expect(
        journalEntryMapper.toExchangeRateQuery(
          currencyContext,
          functionalCurrencyCode
        )
      ).toBeUndefined();
    }
  );

  it('maps the source-to-destination transfer pair to an official rate query', () => {
    expect(
      journalEntryMapper.toTransferExchangeRateQuery({
        sourceCurrencyCode: 'USD',
        destinationCurrencyCode: 'NGN',
        date: '2026-08-10',
      })
    ).toEqual({
      currencyPair: 'USD/NGN',
      type: EExchangeRateType.Official,
      asOf: '2026-08-10',
      limit: 1,
    });

    expect(
      journalEntryMapper.toTransferExchangeRateQuery({
        sourceCurrencyCode: 'NGN',
        destinationCurrencyCode: 'NGN',
        date: '2026-08-10',
      })
    ).toBeUndefined();
  });

  it('maps a single functional-currency payment and attachment references', () => {
    expect(
      journalEntryMapper.toPaymentEntryReq(paymentValues, 'NGN', occurredAt, [
        'attachment-1',
      ])
    ).toEqual({
      attachmentReferences: ['attachment-1'],
      sourceLine: {
        accountId: 'ngn-bank',
        counterparty: { name: 'New recipient' },
        amount: {
          amount: 250000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        exchangeRate: null,
        description: 'August payment',
        sequenceOrder: 1,
      },
      destinationLines: [
        {
          accountId: 'office-expense',
          counterparty: { name: 'New recipient' },
          amount: {
            amount: 250000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
          exchangeRate: null,
          description: 'August payment',
          sequenceOrder: 2,
        },
      ],
      effectiveDate: '2026-08-10',
      postedAt: occurredAt,
      memo: 'August payment',
    });
  });

  it('maps a null posting timestamp for draft creation', () => {
    expect(
      journalEntryMapper.toPaymentEntryReq(paymentValues, 'NGN', null).postedAt
    ).toBeNull();
    expect(
      journalEntryMapper.toReceiptEntryReq(values, 'NGN', null).postedAt
    ).toBeNull();
    expect(
      journalEntryMapper.toTransferEntryReq(transferValues, 'NGN', null)
        .postedAt
    ).toBeNull();
  });

  it('maps itemized accounts to destination lines after the payment source', () => {
    const result = journalEntryMapper.toPaymentEntryReq(
      {
        ...paymentValues,
        categoryId: 'inactive-destination',
        isItemized: true,
        items: [
          {
            id: 'ui-only-1',
            amount: {
              amount: 100000,
              currencyCode: 'NGN',
              isMinorUnit: false,
            },
            accountId: 'office-expense',
            description: ' Supplies ',
          },
          {
            id: 'ui-only-2',
            amount: {
              amount: 150000,
              currencyCode: 'NGN',
              isMinorUnit: false,
            },
            accountId: 'travel-expense',
            description: '',
          },
        ],
      },
      'NGN',
      occurredAt
    );

    expect(result.sourceLine).toEqual({
      accountId: 'ngn-bank',
      counterparty: { name: 'New recipient' },
      amount: {
        amount: 250000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      exchangeRate: null,
      description: 'August payment',
      sequenceOrder: 1,
    });
    expect(result.destinationLines).toEqual([
      {
        accountId: 'office-expense',
        counterparty: { name: 'New recipient' },
        amount: {
          amount: 100000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        exchangeRate: null,
        description: 'Supplies',
        sequenceOrder: 2,
      },
      {
        accountId: 'travel-expense',
        counterparty: { name: 'New recipient' },
        amount: {
          amount: 150000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        exchangeRate: null,
        description: null,
        sequenceOrder: 3,
      },
    ]);
  });

  it('uses the selected date for a manual payment exchange rate', () => {
    const result = journalEntryMapper.toPaymentEntryReq(
      {
        ...paymentValues,
        accountId: 'usd-bank',
        amount: { amount: 1250, currencyCode: 'USD', isMinorUnit: false },
        exchangeRate: { value: 1500, inverted: false },
        counterparty: {
          id: 'counterparty-1',
          name: 'Acme',
          type: 'organization',
        },
      },
      'NGN',
      occurredAt
    );

    expect(result.sourceLine.exchangeRate).toEqual({
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      rate: 1500,
      type: EExchangeRateType.Market,
      asOf: '2026-08-10',
      source: 'manual',
    });
    expect(result.effectiveDate).toBe('2026-08-10');
    expect(result.postedAt).toBe(occurredAt);
    expect(result.attachmentReferences).toEqual([]);
    expect(result.destinationLines[0]?.exchangeRate).toEqual(
      result.sourceLine.exchangeRate
    );
  });

  it('restores an inverted payment rate before mapping the request', () => {
    const result = journalEntryMapper.toPaymentEntryReq(
      {
        ...paymentValues,
        accountId: 'usd-bank',
        amount: { amount: 1250, currencyCode: 'USD', isMinorUnit: false },
        exchangeRate: { value: 0.001, inverted: true },
      },
      'NGN',
      occurredAt
    );

    expect(result.sourceLine.exchangeRate).toMatchObject({
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      rate: 1000,
    });
  });

  it('maps a single functional-currency receipt and attachment references', () => {
    expect(
      journalEntryMapper.toReceiptEntryReq(values, 'NGN', occurredAt, [
        'attachment-1',
      ])
    ).toEqual({
      attachmentReferences: ['attachment-1'],
      sourceLines: [
        {
          accountId: 'sales-revenue',
          counterparty: { name: 'New counterparty' },
          amount: {
            amount: 250000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
          exchangeRate: null,
          description: 'August receipt',
          sequenceOrder: 1,
        },
      ],
      destinationLine: {
        accountId: 'ngn-bank',
        counterparty: { name: 'New counterparty' },
        amount: {
          amount: 250000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        exchangeRate: null,
        description: 'August receipt',
        sequenceOrder: 2,
      },
      effectiveDate: '2026-08-10',
      postedAt: occurredAt,
      memo: 'August receipt',
    });
  });

  it('maps itemized accounts to source lines and the total to the destination', () => {
    const result = journalEntryMapper.toReceiptEntryReq(
      {
        ...values,
        categoryId: 'inactive-source',
        isItemized: true,
        items: [
          {
            id: 'ui-only-1',
            amount: {
              amount: 100000,
              currencyCode: 'NGN',
              isMinorUnit: false,
            },
            accountId: 'sales',
            description: ' Product ',
          },
          {
            id: 'ui-only-2',
            amount: {
              amount: 150000,
              currencyCode: 'NGN',
              isMinorUnit: false,
            },
            accountId: 'services',
            description: '',
          },
        ],
      },
      'NGN',
      occurredAt
    );

    expect(result.sourceLines).toEqual([
      expect.objectContaining({
        accountId: 'sales',
        amount: expect.objectContaining({ amount: 100000 }),
        description: 'Product',
        sequenceOrder: 1,
      }),
      expect.objectContaining({
        accountId: 'services',
        amount: expect.objectContaining({ amount: 150000 }),
        description: null,
        sequenceOrder: 2,
      }),
    ]);
    expect(result.destinationLine).toEqual({
      accountId: 'ngn-bank',
      counterparty: { name: 'New counterparty' },
      amount: {
        amount: 250000,
        currencyCode: 'NGN',
        isMinorUnit: false,
      },
      exchangeRate: null,
      description: 'August receipt',
      sequenceOrder: 3,
    });
  });

  it('uses the selected date for a manual foreign exchange rate', () => {
    const result = journalEntryMapper.toReceiptEntryReq(
      {
        ...values,
        accountId: 'usd-bank',
        amount: { amount: 1250, currencyCode: 'USD', isMinorUnit: false },
        exchangeRate: { value: 1500, inverted: false },
        counterparty: {
          id: 'counterparty-1',
          name: 'Acme',
          type: 'organization',
        },
      },
      'NGN',
      occurredAt
    );

    expect(result.sourceLines[0]?.exchangeRate).toEqual({
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      rate: 1500,
      type: EExchangeRateType.Market,
      asOf: '2026-08-10',
      source: 'manual',
    });
    expect(result.effectiveDate).toBe('2026-08-10');
    expect(result.postedAt).toBe(occurredAt);
    expect(result.attachmentReferences).toEqual([]);
    expect(result.destinationLine.exchangeRate).toEqual(
      result.sourceLines[0]?.exchangeRate
    );
  });

  it('restores an inverted receipt rate before mapping the request', () => {
    const result = journalEntryMapper.toReceiptEntryReq(
      {
        ...values,
        accountId: 'usd-bank',
        amount: { amount: 1250, currencyCode: 'USD', isMinorUnit: false },
        exchangeRate: { value: 0.001, inverted: true },
      },
      'NGN',
      occurredAt
    );

    expect(result.destinationLine.exchangeRate).toMatchObject({
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      rate: 1000,
    });
  });

  it('maps a functional-currency transfer and attachment references', () => {
    expect(
      journalEntryMapper.toTransferEntryReq(transferValues, 'NGN', occurredAt, [
        'attachment-1',
      ])
    ).toEqual({
      attachmentReferences: ['attachment-1'],
      sourceLine: {
        accountId: 'ngn-bank',
        amount: {
          amount: 250000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        exchangeRate: null,
        description: 'Petty cash funding',
        sequenceOrder: 1,
      },
      destinationLine: {
        accountId: 'petty-cash',
        amount: {
          amount: 250000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        exchangeRate: null,
        description: 'Petty cash funding',
        sequenceOrder: 2,
      },
      chargeLines: [],
      effectiveDate: '2026-08-10',
      postedAt: occurredAt,
      memo: 'Petty cash funding',
    });
  });

  it('maps charge lines separately without changing amount sent', () => {
    const result = journalEntryMapper.toTransferEntryReq(
      {
        ...transferValues,
        amountSent: {
          amount: 252500,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        isItemized: true,
        items: [
          {
            id: 'fee-1',
            amount: { amount: 2500, currencyCode: 'NGN', isMinorUnit: false },
            accountId: 'bank-fees',
            description: ' Bank fee ',
          },
        ],
      },
      'NGN',
      occurredAt
    );

    expect(result.sourceLine.amount.amount).toBe(252500);
    expect(result.destinationLine).toEqual(
      expect.objectContaining({
        accountId: 'petty-cash',
        amount: expect.objectContaining({ amount: 250000 }),
        sequenceOrder: 2,
      })
    );
    expect(result.chargeLines).toEqual([
      expect.objectContaining({
        accountId: 'bank-fees',
        counterparty: null,
        amount: expect.objectContaining({ amount: 2500 }),
        description: 'Bank fee',
        sequenceOrder: 3,
      }),
    ]);
  });

  it('maps a manual transfer rate only onto a foreign source line', () => {
    const result = journalEntryMapper.toTransferEntryReq(
      {
        ...transferValues,
        amountSent: {
          amount: 100,
          currencyCode: 'USD',
          isMinorUnit: false,
        },
        amountReceived: {
          amount: 150000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        exchangeRate: { value: 1500, inverted: false },
      },
      'NGN',
      occurredAt
    );

    const expectedExchangeRate = {
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      rate: 1500,
      type: EExchangeRateType.Market,
      asOf: '2026-08-10',
      source: 'manual',
    };

    expect(result.sourceLine.exchangeRate).toEqual(expectedExchangeRate);
    expect(result.destinationLine.exchangeRate).toBeNull();
  });

  it('restores an inverted transfer rate onto a foreign source line', () => {
    const result = journalEntryMapper.toTransferEntryReq(
      {
        ...transferValues,
        amountSent: {
          amount: 100,
          currencyCode: 'USD',
          isMinorUnit: false,
        },
        amountReceived: {
          amount: 100000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        exchangeRate: { value: 0.001, inverted: true },
      },
      'NGN',
      occurredAt
    );

    expect(result.sourceLine.exchangeRate).toMatchObject({
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      rate: 1000,
    });
    expect(result.destinationLine.exchangeRate).toBeNull();
  });

  it('maps the reciprocal rate only onto a foreign destination line', () => {
    const result = journalEntryMapper.toTransferEntryReq(
      {
        ...transferValues,
        amountSent: {
          amount: 160000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        amountReceived: {
          amount: 100,
          currencyCode: 'USD',
          isMinorUnit: false,
        },
        exchangeRate: { value: 0.000625, inverted: false },
      },
      'NGN',
      occurredAt
    );

    expect(result.sourceLine.exchangeRate).toBeNull();
    expect(result.destinationLine.exchangeRate).toEqual({
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      rate: 1600,
      type: EExchangeRateType.Market,
      asOf: '2026-08-10',
      source: 'manual',
    });
  });

  it('maps an inverted transfer rate directly onto a foreign destination line', () => {
    const result = journalEntryMapper.toTransferEntryReq(
      {
        ...transferValues,
        amountSent: {
          amount: 160000,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        amountReceived: {
          amount: 100,
          currencyCode: 'USD',
          isMinorUnit: false,
        },
        exchangeRate: { value: 1600, inverted: true },
      },
      'NGN',
      occurredAt
    );

    expect(result.sourceLine.exchangeRate).toBeNull();
    expect(result.destinationLine.exchangeRate).toMatchObject({
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      rate: 1600,
    });
  });

  it('maps payment edits to rectification with version and only persisted line IDs', () => {
    const result = journalEntryMapper.toPaymentJournalEntryRectificationReq(
      {
        ...paymentValues,
        isItemized: true,
        items: [
          {
            id: 'office-line',
            accountId: 'office-expense',
            amount: {
              amount: 100000,
              currencyCode: 'NGN',
              isMinorUnit: false,
            },
            description: 'Existing line',
          },
          {
            id: 'client-generated-id',
            accountId: 'travel-expense',
            amount: {
              amount: 150000,
              currencyCode: 'NGN',
              isMinorUnit: false,
            },
            description: 'New line',
          },
        ],
      },
      'NGN',
      paymentJournalEntry,
      paymentJournalEntry.attachments
    );

    expect(result).toMatchObject({
      sourceType: 'payment',
      attachments: paymentJournalEntry.attachments,
      sourceLine: { id: 'cash-line' },
      destinationLines: [
        { id: 'office-line' },
        { accountId: 'travel-expense' },
      ],
    });
    expect(result.destinationLines[1]).not.toHaveProperty('id');
  });
});
