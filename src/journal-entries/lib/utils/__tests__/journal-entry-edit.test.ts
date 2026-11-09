import type { ICashTransactionFormValues } from '@/journal-entries/components/cash-transaction-form';
import {
  EJournalEntryEditAction,
  journalEntryEdit,
} from '@/journal-entries/lib/utils/journal-entry-edit';
import type { IJournalEntryListDto } from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const amount = { amount: 100, currencyCode: 'NGN', isMinorUnit: false };

const values: ICashTransactionFormValues = {
  accountId: 'cash',
  categoryId: 'office',
  amount,
  date: '2026-09-21',
  exchangeRate: null,
  isItemized: false,
  items: [],
  counterparty: { id: 'vendor', name: 'Acme' },
  description: 'Original memo',
  attachments: [],
};

const entry = {
  id: 'entry',
  sourceType: 'payment',
  status: 'posted',
  memo: values.description,
  accountingEntityId: 'entity',
  effectiveDate: '2026-09-21',
  postedAt: '2026-09-21T10:00:00.000Z',
  voidedAt: null,
  voidingEntryId: null,
  createdBy: 'user',
  createdAt: '2026-09-21T10:00:00.000Z',
  updatedAt: '2026-09-21T10:00:00.000Z',
  attachments: [],
  lines: [],
} satisfies IJournalEntryListDto;

describe('journalEntryEdit.getAction', () => {
  it('returns a draft update for an edited draft', () => {
    expect(
      journalEntryEdit.getAction({ ...entry, status: 'draft' }, values, {
        ...values,
        description: 'New memo',
      })
    ).toBe(EJournalEntryEditAction.UpdateDraft);
  });

  it('skips an unchanged posted entry', () => {
    expect(journalEntryEdit.getAction(entry, values, values)).toBeUndefined();
  });

  it('skips an unchanged draft', () => {
    expect(
      journalEntryEdit.getAction({ ...entry, status: 'draft' }, values, values)
    ).toBeUndefined();
  });

  it('skips an edit that only flips the displayed exchange rate', () => {
    const saved = { ...values, exchangeRate: { value: 2, inverted: false } };
    const edited = { ...saved, exchangeRate: { value: 0.5, inverted: true } };

    expect(journalEntryEdit.getAction(entry, saved, edited)).toBeUndefined();
  });

  it('ignores floating-point roundoff after reversing the displayed rate twice', () => {
    const rate = 1.9;
    const saved = { ...values, exchangeRate: { value: rate, inverted: false } };

    const edited = {
      ...saved,
      exchangeRate: { value: 1 / (1 / rate), inverted: false },
    };

    expect(journalEntryEdit.getAction(entry, saved, edited)).toBeUndefined();
  });

  it('keeps a memo edit on the metadata path after flipping the displayed rate', () => {
    const saved = { ...values, exchangeRate: { value: 2, inverted: false } };

    const edited = {
      ...saved,
      description: 'Updated memo',
      exchangeRate: { value: 0.5, inverted: true },
    };

    expect(journalEntryEdit.getAction(entry, saved, edited)).toBe(
      EJournalEntryEditAction.UpdateMeta
    );
  });

  it('routes a different effective exchange rate to replacement', () => {
    const saved = { ...values, exchangeRate: { value: 2, inverted: false } };
    const edited = { ...saved, exchangeRate: { value: 0.25, inverted: true } };

    expect(journalEntryEdit.getAction(entry, saved, edited)).toBe(
      EJournalEntryEditAction.VoidAndReplace
    );
  });

  it('routes a memo edit to metadata', () => {
    expect(
      journalEntryEdit.getAction(entry, values, {
        ...values,
        description: 'New memo',
      })
    ).toBe(EJournalEntryEditAction.UpdateMeta);
  });

  it('routes a financial edit with a memo change to replacement', () => {
    expect(
      journalEntryEdit.getAction(entry, values, {
        ...values,
        amount: { ...amount, amount: 200 },
        description: 'New memo',
      })
    ).toBe(EJournalEntryEditAction.VoidAndReplace);
  });
});
