import allTransactionsHelpers from '@/journal-entries/pages/all-transactions/helper';
import type { ICounterpartyDto, ILedgerAccountDto } from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

describe('allTransactionsHelpers', () => {
  it('builds ID-based options and unique currencies from cash accounts only', () => {
    const cash = [
      { id: 'a', name: 'First', balance: { currencyCode: 'USD' } },
      { id: 'b', name: 'Second', balance: { currencyCode: 'NGN' } },
      { id: 'c', name: 'Third', balance: { currencyCode: 'USD' } },
    ] as ILedgerAccountDto[];

    const categories = [
      { id: 'rent', name: 'Rent', balance: { currencyCode: 'EUR' } },
    ] as ILedgerAccountDto[];

    const parties = [{ id: 'party', name: 'Acme' }] as ICounterpartyDto[];
    expect(
      allTransactionsHelpers.filterOptions(cash, categories, parties)
    ).toEqual({
      accounts: [
        { value: 'a', label: 'First' },
        { value: 'b', label: 'Second' },
        { value: 'c', label: 'Third' },
      ],
      categories: [{ value: 'rent', label: 'Rent' }],
      counterparties: [{ value: 'party', label: 'Acme' }],
      currencies: [
        { value: 'NGN', label: 'NGN' },
        { value: 'USD', label: 'USD' },
      ],
    });
    expect(allTransactionsHelpers.filterOptions([], [], [])).toEqual({
      accounts: [],
      categories: [],
      counterparties: [],
      currencies: [],
    });
  });
});
