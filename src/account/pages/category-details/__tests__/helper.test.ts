import categoryDetailsHelpers from '@/account/pages/category-details/helper';
import type {
  IJournalEntryListDto,
  IJournalLineListDto,
  TEntityId,
} from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const money = { amount: 10000, currencyCode: 'NGN', isMinorUnit: true };

const account = {
  id: 'category' as TEntityId,
  type: 'expense' as const,
  functionalBalance: money,
};

const now = new Date(2026, 9, 15);

const line: IJournalLineListDto = {
  id: 'line',
  entryId: 'entry',
  account: { id: 'category', name: 'Software' },
  counterparty: { id: 'google', name: 'Google', status: 'active' },
  sequenceOrder: 1,
  amount: { amount: 1, currencyCode: 'USD', isMinorUnit: false },
  functionalAmount: money,
  side: 'debit',
  exchangeRate: null,
  description: 'Subscription',
  createdAt: '2026-10-01',
  updatedAt: '2026-10-01',
};

const entry: IJournalEntryListDto = {
  id: 'entry',
  accountingEntityId: 'entity',
  sourceType: 'expense',
  memo: null,
  status: 'posted',
  effectiveDate: '2026-10-01',
  postedAt: '2026-10-01',
  voidedAt: null,
  voidingEntryId: null,
  createdBy: 'user' as TEntityId,
  createdAt: '2026-10-01',
  updatedAt: '2026-10-01',
  attachments: [],
  lines: [line],
};

describe('categoryDetailsHelpers.activity', () => {
  it('uses only this category’s functional amounts and fills months with no activity', () => {
    const result = categoryDetailsHelpers.activity(
      [
        {
          ...entry,
          lines: [
            line,
            {
              ...line,
              id: 'bank',
              account: { id: 'bank', name: 'Bank' },
              side: 'credit',
            },
          ],
        },
      ],
      account,
      now
    );

    expect(result.months).toEqual(
      ['05', '06', '07', '08', '09', '10'].map((month) => ({
        month: `2026-${month}`,
        amount: month === '10' ? 100 : 0,
      }))
    );
    expect(result.transactions[0].amount.amount).toBe(100);
    expect(result.transactions[0].description).toBe('Subscription');
  });

  it('subtracts refunds, supports negative counterparties, and counts an entry once for multiple category lines', () => {
    const refund = {
      ...line,
      id: 'refund',
      side: 'credit' as const,
      functionalAmount: { ...money, amount: 2500 },
    };

    const other = {
      ...refund,
      id: 'other',
      counterparty: { id: 'other', name: 'Other', status: 'active' as const },
    };

    const result = categoryDetailsHelpers.activity(
      [{ ...entry, lines: [line, refund, other] }],
      account,
      now
    );

    expect(result.transactions).toHaveLength(1);
    expect(result.months[5].amount).toBe(50);
    expect(result.transactions[0].amount.amount).toBe(50);
  });

  it.each([
    { status: 'draft', postedAt: null },
    { status: 'voided', voidedAt: '2026-10-02' },
    { voidingEntryId: 'correction' },
    { sourceType: 'opening_balance' },
    { sourceType: 'reversal' },
    { status: 'archived', postedAt: null },
  ] satisfies Partial<IJournalEntryListDto>[])(
    'keeps excluded journals in the table without inflating activity: %j',
    (changes) => {
      const result = categoryDetailsHelpers.activity(
        [{ ...entry, ...changes }],
        account,
        now
      );

      expect(result.transactions).toHaveLength(1);
      expect(result.months.every(({ amount }) => amount === 0)).toBe(true);
    }
  );

  it('keeps older archived transactions outside the six-month trend', () => {
    const result = categoryDetailsHelpers.activity(
      [{ ...entry, status: 'archived', effectiveDate: '2025-12-01' }],
      account,
      now
    );

    expect(result.transactions[0].amount.amount).toBe(100);
    expect(result.months.every(({ amount }) => amount === 0)).toBe(true);
  });

  it('uses credits less debits for revenue and attributes missing counterparties explicitly', () => {
    const result = categoryDetailsHelpers.activity(
      [{ ...entry, lines: [{ ...line, side: 'credit', counterparty: null }] }],
      { ...account, type: 'revenue' },
      now
    );

    expect(result.transactions[0]).toMatchObject({
      counterparties: [{ id: 'unassigned', name: null }],
      amount: { amount: 100 },
    });
  });

  it('keeps a net-zero transaction in the table', () => {
    const result = categoryDetailsHelpers.activity(
      [{ ...entry, lines: [line, { ...line, id: 'refund', side: 'credit' }] }],
      account,
      now
    );

    expect(result.transactions[0].amount.amount).toBe(0);
    expect(result.months[5].amount).toBe(0);
  });

  it('rejects mixed functional currencies rather than combining incomparable values', () => {
    expect(() =>
      categoryDetailsHelpers.activity(
        [
          {
            ...entry,
            lines: [
              { ...line, functionalAmount: { ...money, currencyCode: 'USD' } },
            ],
          },
        ],
        account,
        now
      )
    ).toThrow('inconsistent functional currencies');
  });
});

describe('categoryDetailsHelpers.filterTransactions', () => {
  it('combines counterparty and text filtering without mutating the original rows', () => {
    const rows = categoryDetailsHelpers.activity(
      [
        entry,
        {
          ...entry,
          id: 'later',
          effectiveDate: '2026-10-03',
          memo: 'Annual renewal',
        },
      ],
      account,
      now
    ).transactions;

    expect(
      categoryDetailsHelpers
        .filterTransactions(rows, ' ANNUAL ', 'google', 'desc')
        .map(({ id }) => id)
    ).toEqual(['later']);
    expect(
      categoryDetailsHelpers
        .filterTransactions(rows, 'google', null, 'desc')
        .map(({ id }) => id)
    ).toEqual(['later', 'entry']);
    expect(
      categoryDetailsHelpers.filterTransactions(rows, '', 'missing', 'asc')
    ).toEqual([]);
    expect(rows.map(({ id }) => id)).toEqual(['entry', 'later']);
  });
});

describe('categoryDetailsHelpers.participationId', () => {
  it('distinguishes named counterparties, Self transfers, and Unassigned activity', () => {
    const participation = {
      totalShare: null,
      amount: money,
      functionalAmount: money,
    };

    expect(
      categoryDetailsHelpers.participationId({
        counterparty: null,
        isSelf: true,
        participation,
      })
    ).toBe('self');
    expect(
      categoryDetailsHelpers.participationId({
        counterparty: null,
        isSelf: false,
        participation,
      })
    ).toBe('unassigned');

    const rows = categoryDetailsHelpers.activity(
      [
        {
          ...entry,
          id: 'transfer',
          sourceType: 'transfer',
          lines: [{ ...line, counterparty: null }],
        },
        {
          ...entry,
          id: 'unassigned',
          lines: [{ ...line, counterparty: null }],
        },
        entry,
      ],
      account,
      now
    ).transactions;

    expect(
      categoryDetailsHelpers
        .filterTransactions(rows, '', 'self', 'asc')
        .map(({ id }) => id)
    ).toEqual(['transfer']);
    expect(
      categoryDetailsHelpers
        .filterTransactions(rows, '', 'unassigned', 'asc')
        .map(({ id }) => id)
    ).toEqual(['unassigned']);
    expect(
      categoryDetailsHelpers
        .filterTransactions(rows, '', 'google', 'asc')
        .map(({ id }) => id)
    ).toEqual(['entry']);
  });
});
