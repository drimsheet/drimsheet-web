import transactionsHelpers from '@/journal-entries/pages/transactions/helper';
import type {
  ILedgerTotalDebitsAndCreditsByCurrencyDto,
  IMoneyDto,
} from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

function report(
  deltas: IMoneyDto[]
): ILedgerTotalDebitsAndCreditsByCurrencyDto {
  return {
    fiscalYearId: 'year',
    period: { from: '2026-01-01', to: '2026-10-26' },
    totalsByCurrency: deltas.map((delta) => ({
      delta,
      totalCredits: { ...delta, amount: 999 },
      totalDebits: { ...delta, amount: 888 },
    })),
  };
}

describe('transactionsHelpers.mergeCurrencies', () => {
  it('uses deltas, preserves units and reversals, and merges currencies missing from either side', () => {
    const result = transactionsHelpers.mergeCurrencies(
      report([
        { amount: -100, currencyCode: 'USD', isMinorUnit: true },
        { amount: 440000, currencyCode: 'NGN', isMinorUnit: false },
      ]),
      report([
        { amount: -250, currencyCode: 'USD', isMinorUnit: true },
        { amount: 7000, currencyCode: 'GBP', isMinorUnit: false },
      ])
    );

    expect(
      result.map(({ currencyCode, inflow, outflow }) => ({
        currencyCode,
        inflow,
        outflow,
      }))
    ).toEqual([
      {
        currencyCode: 'GBP',
        inflow: { amount: 0, currencyCode: 'GBP', isMinorUnit: false },
        outflow: { amount: -7000, currencyCode: 'GBP', isMinorUnit: false },
      },
      {
        currencyCode: 'NGN',
        inflow: { amount: 440000, currencyCode: 'NGN', isMinorUnit: false },
        outflow: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
      },
      {
        currencyCode: 'USD',
        inflow: { amount: -100, currencyCode: 'USD', isMinorUnit: true },
        outflow: { amount: 250, currencyCode: 'USD', isMinorUnit: true },
      },
    ]);
  });

  it('returns an empty list without activity', () => {
    expect(transactionsHelpers.mergeCurrencies(report([]), report([]))).toEqual(
      []
    );
  });
});

describe('transaction activity helpers', () => {
  it('requests daily revenue and expense through today for the current month', () => {
    expect(
      transactionsHelpers.activityQuery(
        new Date(2026, 9, 1),
        new Date(2026, 9, 26)
      )
    ).toEqual({
      from: '2026-10-01',
      to: '2026-10-26',
      bucketDays: 1,
      types: ['revenue', 'expense'],
    });
  });

  it('requests complete historical months including leap days', () => {
    expect(
      transactionsHelpers.activityQuery(
        new Date(2024, 1, 1),
        new Date(2026, 9, 26)
      )
    ).toEqual({
      from: '2024-02-01',
      to: '2024-02-29',
      bucketDays: 1,
      types: ['revenue', 'expense'],
    });
  });

  it('maps normal-side deltas to both views, preserving reversals and converting minor units only for chart values', () => {
    const revenue = { amount: -12500, currencyCode: 'USD', isMinorUnit: true };
    const expense = { amount: 85, currencyCode: 'USD', isMinorUnit: false };

    const days = transactionsHelpers.activityDays({
      currencyCode: 'USD',
      period: { from: '2026-10-01', to: '2026-10-02' },
      buckets: [
        {
          from: '2026-10-01',
          to: '2026-10-01',
          activity: [
            {
              type: 'expense',
              delta: expense,
              totalDebits: expense,
              totalCredits: expense,
            },
            {
              type: 'revenue',
              delta: revenue,
              totalDebits: expense,
              totalCredits: expense,
            },
          ],
        },
        { from: '2026-10-02', to: '2026-10-02', activity: [] },
      ],
    });

    expect(days).toEqual([
      {
        date: '2026-10-01',
        in: revenue,
        out: expense,
        revenue: -125,
        expense: 85,
      },
      {
        date: '2026-10-02',
        in: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
        out: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
        revenue: 0,
        expense: 0,
      },
    ]);
  });
});

it('offers recent months and retains older months reached through calendar navigation', () => {
  const today = new Date(2026, 9, 26);

  const recent = transactionsHelpers.activityMonths(
    new Date(2026, 9, 1),
    today
  );

  expect(recent).toHaveLength(12);
  expect(recent[0]).toEqual(new Date(2026, 9, 1));
  expect(recent.at(-1)).toEqual(new Date(2025, 10, 1));
  expect(
    transactionsHelpers.activityMonths(new Date(2024, 1, 1), today).at(-1)
  ).toEqual(new Date(2024, 1, 1));
});
