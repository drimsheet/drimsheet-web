import cashTransactionFormHelpers from '@/journal-entries/components/cash-transaction-form/helper';
import type { ICashTransactionFormValues } from '@/journal-entries/components/cash-transaction-form/types';
import type { IExchangeRate, ILedgerAccountDto } from '@/shared/lib/api/Api';
import { dateUtils } from '@/shared/lib/utils/date';
import { describe, expect, it } from 'vitest';

const accounts = [
  {
    id: 'usd-bank',
    balance: { amount: 0, currencyCode: 'USD', isMinorUnit: false },
  },
] as unknown as ILedgerAccountDto[];

const values: ICashTransactionFormValues = {
  accountId: 'usd-bank',
  categoryId: 'sales',
  amount: { amount: 999, currencyCode: 'USD', isMinorUnit: false },
  date: '2026-08-10',
  exchangeRate: { value: 1500, inverted: false },
  isItemized: true,
  items: [
    {
      id: 'item-1',
      amount: { amount: 125, currencyCode: 'USD', isMinorUnit: false },
      accountId: 'sales',
      description: ' Item description ',
    },
  ],
  counterparty: { id: 'counterparty-1', name: ' Acme ', type: 'organization' },
  description: ' Consulting ',
  attachments: [],
};

describe('cashTransactionFormHelpers', () => {
  describe('createInitialValues', () => {
    it('creates empty values with the functional currency defaults', () => {
      expect(
        cashTransactionFormHelpers.createInitialValues(
          undefined,
          accounts,
          'NGN'
        )
      ).toEqual({
        accountId: '',
        categoryId: '',
        amount: {
          amount: Number.NaN,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        date: dateUtils.formatDateForApi(new Date()),
        exchangeRate: null,
        isItemized: false,
        items: [],
        counterparty: {
          id: '',
          name: '',
          type: undefined,
        },
        description: '',
        attachments: [],
      });
    });

    it('prefers the selected account currency over supplied amount currency', () => {
      expect(
        cashTransactionFormHelpers.createInitialValues(
          {
            accountId: 'usd-bank',
            categoryId: 'sales',
            amount: {
              amount: 125,
              currencyCode: 'EUR',
              isMinorUnit: true,
            },
            exchangeRate: { value: 1500, inverted: false },
            counterparty: {
              id: 'counterparty-1',
              name: 'Acme',
              type: 'organization',
            },
            description: 'Consulting',
          } as ICashTransactionFormValues,
          accounts,
          'NGN'
        )
      ).toEqual({
        accountId: 'usd-bank',
        categoryId: 'sales',
        amount: {
          amount: 125,
          currencyCode: 'USD',
          isMinorUnit: true,
        },
        date: dateUtils.formatDateForApi(new Date()),
        exchangeRate: { value: 1500, inverted: false },
        isItemized: false,
        items: [],
        counterparty: {
          id: 'counterparty-1',
          name: 'Acme',
          type: 'organization',
        },
        description: 'Consulting',
        attachments: [],
      });
    });

    it('uses a supplied amount currency when no selected account resolves', () => {
      const initialValues = cashTransactionFormHelpers.createInitialValues(
        {
          amount: { currencyCode: 'EUR' },
        } as ICashTransactionFormValues,
        accounts,
        'NGN'
      );

      expect(initialValues.amount.currencyCode).toBe('EUR');
    });
  });

  describe('updateAccount', () => {
    it('updates account-owned currencies and clears a stale exchange rate', () => {
      expect(
        cashTransactionFormHelpers.updateAccount(
          values,
          'eur-bank',
          'EUR',
          'NGN'
        )
      ).toEqual({
        accountId: 'eur-bank',
        categoryId: 'sales',
        amount: { amount: 999, currencyCode: 'EUR', isMinorUnit: false },
        date: '2026-08-10',
        exchangeRate: null,
        isItemized: true,
        items: [
          {
            id: 'item-1',
            amount: { amount: 125, currencyCode: 'EUR', isMinorUnit: false },
            accountId: 'sales',
            description: ' Item description ',
          },
        ],
        counterparty: {
          id: 'counterparty-1',
          name: ' Acme ',
          type: 'organization',
        },
        description: ' Consulting ',
        attachments: [],
      });
    });

    it('clears the exchange rate for a functional-currency account', () => {
      expect(
        cashTransactionFormHelpers.updateAccount(
          values,
          'ngn-bank',
          'NGN',
          'NGN'
        )
      ).toEqual({
        accountId: 'ngn-bank',
        categoryId: 'sales',
        amount: { amount: 999, currencyCode: 'NGN', isMinorUnit: false },
        date: '2026-08-10',
        exchangeRate: null,
        isItemized: true,
        items: [
          {
            id: 'item-1',
            amount: { amount: 125, currencyCode: 'NGN', isMinorUnit: false },
            accountId: 'sales',
            description: ' Item description ',
          },
        ],
        counterparty: {
          id: 'counterparty-1',
          name: ' Acme ',
          type: 'organization',
        },
        description: ' Consulting ',
        attachments: [],
      });
    });
  });

  describe('createItem', () => {
    it('creates a stable blank item in the supplied currency', () => {
      expect(cashTransactionFormHelpers.createItem('item-1', 'NGN')).toEqual({
        id: 'item-1',
        amount: {
          amount: Number.NaN,
          currencyCode: 'NGN',
          isMinorUnit: false,
        },
        accountId: '',
        description: '',
      });
    });

    it('seeds the amount and category when entering itemized mode', () => {
      expect(
        cashTransactionFormHelpers.createItem('item-1', 'USD', 125, 'revenue-1')
      ).toEqual({
        id: 'item-1',
        amount: { amount: 125, currencyCode: 'USD', isMinorUnit: false },
        accountId: 'revenue-1',
        description: '',
      });
    });
  });

  describe('getItemTotal', () => {
    it('sums valid item amounts without floating-point artifacts', () => {
      expect(
        cashTransactionFormHelpers.getItemTotal([
          {
            id: 'item-1',
            amount: { amount: 0.1, currencyCode: 'NGN', isMinorUnit: false },
            accountId: 'sales',
            description: '',
          },
          {
            id: 'item-2',
            amount: { amount: 0.2, currencyCode: 'NGN', isMinorUnit: false },
            accountId: 'services',
            description: '',
          },
        ])
      ).toBe(0.3);
    });

    it('treats incomplete item amounts as zero', () => {
      expect(
        cashTransactionFormHelpers.getItemTotal([
          {
            id: 'item-1',
            amount: {
              amount: Number.NaN,
              currencyCode: 'NGN',
              isMinorUnit: false,
            },
            accountId: '',
            description: '',
          },
        ])
      ).toBe(0);
    });
  });

  describe('isExchangeRateRequired', () => {
    it('requires an exchange rate for different account and functional currencies', () => {
      expect(
        cashTransactionFormHelpers.isExchangeRateRequired('USD', 'NGN')
      ).toBe(true);
    });

    it('does not require an exchange rate for matching currencies', () => {
      expect(
        cashTransactionFormHelpers.isExchangeRateRequired('NGN', 'NGN')
      ).toBe(false);
    });

    it.each([
      [undefined, 'NGN'],
      ['USD', undefined],
      ['', 'NGN'],
    ])(
      'does not require an exchange rate when a currency is missing',
      (accountCurrencyCode, functionalCurrencyCode) => {
        expect(
          cashTransactionFormHelpers.isExchangeRateRequired(
            accountCurrencyCode,
            functionalCurrencyCode
          )
        ).toBe(false);
      }
    );
  });

  describe('matchesOfficialRate', () => {
    const officialRate = {
      baseCurrencyCode: 'USD',
      targetCurrencyCode: 'NGN',
      asOf: '2026-08-10T00:00:00.000Z',
    } as IExchangeRate;

    it('matches the currency pair and date', () => {
      expect(
        cashTransactionFormHelpers.matchesOfficialRate(
          officialRate,
          'USD',
          'NGN',
          '2026-08-10'
        )
      ).toBe(true);
    });

    it('rejects an absent or stale official rate', () => {
      expect(
        cashTransactionFormHelpers.matchesOfficialRate(
          undefined,
          'USD',
          'NGN',
          '2026-08-10'
        )
      ).toBe(false);
      expect(
        cashTransactionFormHelpers.matchesOfficialRate(
          officialRate,
          'USD',
          'NGN',
          '2026-08-09'
        )
      ).toBe(false);
    });
  });

  describe('getCounterpartyTextKeys', () => {
    it('uses counterparty copy when the transaction variant is undefined', () => {
      expect(cashTransactionFormHelpers.getCounterpartyTextKeys()).toEqual({
        empty: 'cash_transaction_counterparty_empty_text',
        label: 'cash_transaction_counterparty_label',
        placeholder: 'cash_transaction_counterparty_placeholder',
        required: 'cash_transaction_counterparty_required_text',
      });
    });

    it('uses payer copy for inflow transactions', () => {
      expect(
        cashTransactionFormHelpers.getCounterpartyTextKeys('inflow')
      ).toEqual({
        empty: 'cash_transaction_payer_empty_text',
        label: 'cash_transaction_payer_label',
        placeholder: 'cash_transaction_payer_placeholder',
        required: 'cash_transaction_payer_required_text',
      });
    });

    it('uses recipient copy for outflow transactions', () => {
      expect(
        cashTransactionFormHelpers.getCounterpartyTextKeys('outflow')
      ).toEqual({
        empty: 'cash_transaction_recipient_empty_text',
        label: 'cash_transaction_recipient_label',
        placeholder: 'cash_transaction_recipient_placeholder',
        required: 'cash_transaction_recipient_required_text',
      });
    });
  });

  describe('normalizeValues', () => {
    it('derives the transaction amount from items and normalizes text', () => {
      expect(cashTransactionFormHelpers.normalizeValues(values, true)).toEqual({
        accountId: 'usd-bank',
        categoryId: 'sales',
        amount: { amount: 125, currencyCode: 'USD', isMinorUnit: false },
        date: '2026-08-10',
        exchangeRate: { value: 1500, inverted: false },
        isItemized: true,
        items: [
          {
            id: 'item-1',
            amount: { amount: 125, currencyCode: 'USD', isMinorUnit: false },
            accountId: 'sales',
            description: 'Item description',
          },
        ],
        counterparty: {
          id: 'counterparty-1',
          name: 'Acme',
          type: 'organization',
        },
        description: 'Consulting',
        attachments: [],
      });
    });

    it('preserves the selected ID, omits an absent type, and clears an unneeded exchange rate', () => {
      expect(
        cashTransactionFormHelpers.normalizeValues(
          {
            ...values,
            exchangeRate: { value: 1500, inverted: false },
            counterparty: { id: 'new-party', name: ' New counterparty ' },
          },
          false
        )
      ).toEqual({
        accountId: 'usd-bank',
        categoryId: 'sales',
        amount: { amount: 125, currencyCode: 'USD', isMinorUnit: false },
        date: '2026-08-10',
        exchangeRate: null,
        isItemized: true,
        items: [
          {
            id: 'item-1',
            amount: { amount: 125, currencyCode: 'USD', isMinorUnit: false },
            accountId: 'sales',
            description: 'Item description',
          },
        ],
        counterparty: { id: 'new-party', name: 'New counterparty' },
        description: 'Consulting',
        attachments: [],
      });
    });

    it('uses the official rate when a required manual rate is absent', () => {
      const normalized = cashTransactionFormHelpers.normalizeValues(
        {
          ...values,
          exchangeRate: null,
        },
        true,
        1500
      );

      expect(normalized.exchangeRate).toEqual({
        value: 1500,
        inverted: false,
      });
    });

    it('preserves a required manually entered inverted rate', () => {
      const normalized = cashTransactionFormHelpers.normalizeValues(
        {
          ...values,
          exchangeRate: { value: 0.001, inverted: true },
        },
        true
      );

      expect(normalized.exchangeRate).toEqual({
        value: 0.001,
        inverted: true,
      });
    });
  });
});
