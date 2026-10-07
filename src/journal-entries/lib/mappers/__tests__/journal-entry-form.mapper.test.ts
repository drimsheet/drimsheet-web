import { journalEntryFormMapper } from '@/journal-entries/lib/mappers/journal-entry-form.mapper';
import {
  ECounterpartyStatus,
  EExchangeRateType,
  EJournalEntrySourceType,
  EJournalEntryStatus,
  EJournalSide,
  type IJournalEntryListDto,
  type IJournalLineListDto,
  type TEntityId,
} from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

function createLine(
  id: string,
  accountId: string,
  sequenceOrder: number,
  amount: number
): IJournalLineListDto {
  return {
    id,
    entryId: 'entry-1',
    account: { id: accountId, name: accountId },
    counterparty: {
      id: 'counterparty-1',
      name: 'Acme',
      status: ECounterpartyStatus.Active,
    },
    sequenceOrder,
    amount: { amount, currencyCode: 'NGN', isMinorUnit: false },
    exchangeRate: null,
    functionalAmount: { amount, currencyCode: 'NGN', isMinorUnit: false },
    side: EJournalSide.Debit,
    description: `${accountId} description`,
    createdAt: '2026-09-21T10:00:00.000Z',
    updatedAt: '2026-09-21T10:00:00.000Z',
  };
}

function createEntry(
  sourceType: IJournalEntryListDto['sourceType'],
  lines: IJournalLineListDto[]
): IJournalEntryListDto {
  return {
    id: 'entry-1',
    accountingEntityId: 'entity-1',
    sourceType,
    memo: 'Entry memo',
    status: EJournalEntryStatus.Posted,
    effectiveDate: '2026-09-21T00:00:00.000Z',
    postedAt: '2026-09-21T10:00:00.000Z',
    voidedAt: null,
    voidingEntryId: null,
    createdBy: '00000000-0000-4000-8000-000000000100' as TEntityId,
    createdAt: '2026-09-21T10:00:00.000Z',
    updatedAt: '2026-09-21T10:00:00.000Z',
    attachments: [],
    lines,
  };
}

describe('journalEntryFormMapper', () => {
  it('maps a single payment category to a non-itemized outflow form', () => {
    const entry = createEntry(EJournalEntrySourceType.Payment, [
      createLine('cash-line', 'bank', 1, 250),
      createLine('category-line', 'office-expense', 2, 250),
    ]);

    expect(
      journalEntryFormMapper.toCashTransactionFormValues(entry, 'NGN')
    ).toEqual({
      accountId: 'bank',
      categoryId: 'office-expense',
      amount: { amount: 250, currencyCode: 'NGN', isMinorUnit: false },
      date: '2026-09-21',
      exchangeRate: null,
      isItemized: false,
      items: [],
      counterparty: { id: 'counterparty-1', name: 'Acme' },
      description: 'Entry memo',
      attachment: null,
    });
  });

  it('maps multiple receipt categories to itemized inflow rows in sequence order', () => {
    const entry = createEntry(EJournalEntrySourceType.Receipt, [
      createLine('cash-line', 'bank', 3, 250),
      createLine('services-line', 'services', 2, 150),
      createLine('sales-line', 'sales', 1, 100),
    ]);

    const result = journalEntryFormMapper.toCashTransactionFormValues(
      entry,
      'NGN'
    );

    expect(result.accountId).toBe('bank');
    expect(result.isItemized).toBe(true);
    expect(result.items).toEqual([
      expect.objectContaining({ id: 'sales-line', accountId: 'sales' }),
      expect.objectContaining({ id: 'services-line', accountId: 'services' }),
    ]);
  });

  it('maps transfer accounts, charges, and reversed exchange-rate direction', () => {
    const sourceLine = createLine('source-line', 'ngn-bank', 1, 160000);
    const destinationLine = createLine('destination-line', 'usd-bank', 2, 100);
    destinationLine.amount.currencyCode = 'USD';
    destinationLine.exchangeRate = {
      currencyPair: 'USD/NGN',
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      rate: 1600,
      type: EExchangeRateType.Market,
      asOf: '2026-09-21',
      source: 'manual',
      createdAt: '2026-09-21T10:00:00.000Z',
    };
    const chargeLine = createLine('charge-line', 'bank-fees', 3, 50);

    const entry = createEntry(EJournalEntrySourceType.Transfer, [
      chargeLine,
      destinationLine,
      sourceLine,
    ]);

    const result = journalEntryFormMapper.toCashTransferFormValues(entry);

    expect(result).toMatchObject({
      sourceAccountId: 'ngn-bank',
      destinationAccountId: 'usd-bank',
      exchangeRate: { value: 1600, inverted: true },
      isItemized: true,
      items: [expect.objectContaining({ id: 'charge-line' })],
    });
  });
});
