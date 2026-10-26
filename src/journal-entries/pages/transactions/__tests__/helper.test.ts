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
