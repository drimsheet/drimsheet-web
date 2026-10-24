import type { IBankDetailsFormValues } from '@/account/components/bank-details-form';
import type { IPettyCashAccountFormValues } from '@/account/components/petty-cash-account-form';
import { assetAccountMapper } from '@/account/lib/mappers/asset-account.mapper';
import { EExchangeRateType, type IExchangeRate } from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const values: IPettyCashAccountFormValues = {
  name: 'Office cash',
  currencyCode: 'NGN',
  createWithoutOpeningBalance: false,
  openingBalance: 100,
  openingDate: '2026-07-01',
  exchangeRate: null,
};

const bankFormValues: IBankDetailsFormValues = {
  name: 'Operating Account',
  currencyCode: 'NGN',
  bankLocation: 'NG',
  bankName: 'Access Bank',
  accountNumber: '0123456789',
  accountName: 'Acme Ltd',
  createWithoutOpeningBalance: false,
  openingBalance: 5000,
  openingDate: '2026-07-01',
  exchangeRate: null,
  isSubAccount: false,
};

describe('assetAccountMapper', () => {
  describe('toOpeningBalanceExchangeRateQuery', () => {
    it('maps complete foreign-currency context to an official-rate query', () => {
      expect(
        assetAccountMapper.toOpeningBalanceExchangeRateQuery(
          {
            currencyCode: 'USD',
            date: '2026-07-01',
            createWithoutOpeningBalance: false,
          },
          'NGN'
        )
      ).toEqual({
        currencyPair: 'USD/NGN',
        type: EExchangeRateType.Official,
        asOf: '2026-07-01',
        limit: 1,
      });
    });

    it.each([
      [
        {
          currencyCode: '',
          date: '2026-07-01',
          createWithoutOpeningBalance: false,
        },
        'NGN',
      ],
      [
        {
          currencyCode: 'USD',
          date: '',
          createWithoutOpeningBalance: false,
        },
        'NGN',
      ],
      [
        {
          currencyCode: 'NGN',
          date: '2026-07-01',
          createWithoutOpeningBalance: false,
        },
        'NGN',
      ],
      [
        {
          currencyCode: 'USD',
          date: '2026-07-01',
          createWithoutOpeningBalance: true,
        },
        'NGN',
      ],
      [
        {
          currencyCode: 'USD',
          date: '2026-07-01',
          createWithoutOpeningBalance: false,
        },
        '',
      ],
    ])('omits queries for ineligible context', (context, currencyCode) => {
      expect(
        assetAccountMapper.toOpeningBalanceExchangeRateQuery(
          context,
          currencyCode
        )
      ).toBeUndefined();
    });
  });

  describe('toPettyCashAccountCreationDto', () => {
    it('maps an account without an opening balance', () => {
      expect(
        assetAccountMapper.toPettyCashAccountCreationDto(
          {
            ...values,
            createWithoutOpeningBalance: true,
            openingBalance: '',
            openingDate: '',
          },
          'NGN'
        )
      ).toEqual({
        name: 'Office cash',
        currencyCode: 'NGN',
        isControlAccount: false,
        openingBalance: null,
      });
    });

    it('maps a same-currency opening balance without an exchange rate', () => {
      expect(
        assetAccountMapper.toPettyCashAccountCreationDto(values, 'NGN')
      ).toEqual({
        name: 'Office cash',
        currencyCode: 'NGN',
        isControlAccount: false,
        openingBalance: {
          amount: {
            amount: 100,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
          date: '2026-07-01',
          exchangeRate: null,
        },
      });
    });

    it('maps a foreign-currency opening balance with its entered rate', () => {
      expect(
        assetAccountMapper.toPettyCashAccountCreationDto(
          {
            ...values,
            name: 'Travel cash',
            currencyCode: 'USD',
            exchangeRate: { value: 1500, inverted: false },
          },
          'NGN'
        )
      ).toEqual({
        name: 'Travel cash',
        currencyCode: 'USD',
        isControlAccount: false,
        openingBalance: {
          amount: {
            amount: 100,
            currencyCode: 'USD',
            isMinorUnit: false,
          },
          date: '2026-07-01',
          exchangeRate: {
            baseCurrencyCode: 'USD',
            targetCurrencyCode: 'NGN',
            rate: 1500,
            type: EExchangeRateType.Market,
            asOf: '2026-07-01',
            source: 'manual',
          },
        },
      });
    });

    it('uses an official rate when the petty-cash form rate is null', () => {
      const result = assetAccountMapper.toPettyCashAccountCreationDto(
        { ...values, currencyCode: 'USD' },
        'NGN',
        { rate: 1500 } as IExchangeRate
      );

      expect(result).toEqual({
        name: 'Office cash',
        currencyCode: 'USD',
        isControlAccount: false,
        openingBalance: {
          amount: {
            amount: 100,
            currencyCode: 'USD',
            isMinorUnit: false,
          },
          date: '2026-07-01',
          exchangeRate: {
            baseCurrencyCode: 'USD',
            targetCurrencyCode: 'NGN',
            rate: 1500,
            type: EExchangeRateType.Market,
            asOf: '2026-07-01',
            source: 'manual',
          },
        },
      });
    });

    it('restores an inverted petty-cash rate to the canonical pair', () => {
      const result = assetAccountMapper.toPettyCashAccountCreationDto(
        {
          ...values,
          currencyCode: 'USD',
          exchangeRate: { value: 0.001, inverted: true },
        },
        'NGN'
      );

      expect(result.openingBalance?.exchangeRate).toMatchObject({
        baseCurrencyCode: 'USD',
        targetCurrencyCode: 'NGN',
        rate: 1000,
      });
    });
  });

  describe('toBankAccountCreationDto', () => {
    it('maps a bank account without an opening balance', () => {
      expect(
        assetAccountMapper.toBankAccountCreationDto(
          {
            ...bankFormValues,
            createWithoutOpeningBalance: true,
            openingBalance: '',
            openingDate: '',
          },
          'NGN'
        )
      ).toEqual({
        name: 'Operating Account',
        currencyCode: 'NGN',
        bankAccount: {
          bankName: 'Access Bank',
          accountName: 'Acme Ltd',
          accountNumber: '0123456789',
        },
        openingBalance: null,
      });
    });

    it('maps a same-currency bank account opening balance', () => {
      expect(
        assetAccountMapper.toBankAccountCreationDto(bankFormValues, 'NGN')
      ).toEqual({
        name: 'Operating Account',
        currencyCode: 'NGN',
        bankAccount: {
          bankName: 'Access Bank',
          accountName: 'Acme Ltd',
          accountNumber: '0123456789',
        },
        openingBalance: {
          amount: {
            amount: 5000,
            currencyCode: 'NGN',
            isMinorUnit: false,
          },
          date: '2026-07-01',
          exchangeRate: null,
        },
      });
    });

    it('maps a foreign-currency bank account opening balance with exchange rate', () => {
      expect(
        assetAccountMapper.toBankAccountCreationDto(
          {
            ...bankFormValues,
            currencyCode: 'USD',
            exchangeRate: { value: 1500, inverted: false },
          },
          'NGN'
        )
      ).toEqual({
        name: 'Operating Account',
        currencyCode: 'USD',
        bankAccount: {
          bankName: 'Access Bank',
          accountName: 'Acme Ltd',
          accountNumber: '0123456789',
        },
        openingBalance: {
          amount: {
            amount: 5000,
            currencyCode: 'USD',
            isMinorUnit: false,
          },
          date: '2026-07-01',
          exchangeRate: {
            baseCurrencyCode: 'USD',
            targetCurrencyCode: 'NGN',
            rate: 1500,
            type: EExchangeRateType.Market,
            asOf: '2026-07-01',
            source: 'manual',
          },
        },
      });
    });

    it('uses an official rate when the bank form rate is null', () => {
      const result = assetAccountMapper.toBankAccountCreationDto(
        { ...bankFormValues, currencyCode: 'USD' },
        'NGN',
        { rate: 1500 } as IExchangeRate
      );

      expect(result.openingBalance?.exchangeRate).toMatchObject({
        baseCurrencyCode: 'USD',
        targetCurrencyCode: 'NGN',
        rate: 1500,
      });
    });

    it('restores an inverted bank-account rate to the canonical pair', () => {
      const result = assetAccountMapper.toBankAccountCreationDto(
        {
          ...bankFormValues,
          currencyCode: 'USD',
          exchangeRate: { value: 0.001, inverted: true },
        },
        'NGN'
      );

      expect(result.openingBalance?.exchangeRate).toMatchObject({
        baseCurrencyCode: 'USD',
        targetCurrencyCode: 'NGN',
        rate: 1000,
      });
    });
  });
});
