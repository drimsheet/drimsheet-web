import { createPettyCashAccountFormValidation } from '@/account/components/petty-cash-account-form/validation';
import type { IExchangeRate } from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const messages = {
  accountNameRequired: 'Account name is required',
  accountNameMinLength: 'Account name is too short',
  accountNameMaxLength: 'Account name is too long',
  currencyRequired: 'Currency is required',
  openingBalanceRequired: 'Opening balance is required',
  openingBalanceNumber: 'Opening balance must be a number',
  openingBalanceNegative: 'Opening balance cannot be negative',
  openingDateRequired: 'Opening date is required',
  exchangeRateRequired: 'Exchange rate is required',
  exchangeRateNumber: 'Exchange rate must be a number',
  exchangeRatePositive: 'Exchange rate must be positive',
};

const schema = createPettyCashAccountFormValidation('NGN', messages);
const officialExchangeRate = { rate: 1500 } as IExchangeRate;

const validValues = {
  name: 'Office cash',
  currencyCode: 'NGN',
  createWithoutOpeningBalance: false,
  openingBalance: 100,
  openingDate: '2026-07-01',
  exchangeRate: null,
};

describe('petty cash account form validation', () => {
  it('accepts a same-currency opening balance', async () => {
    await expect(schema.validate(validValues)).resolves.toBeDefined();
  });

  it('accepts a zero opening balance', async () => {
    await expect(
      schema.validate({
        ...validValues,
        openingBalance: 0,
      })
    ).resolves.toBeDefined();
  });

  it('rejects a negative opening balance', async () => {
    await expect(
      schema.validate({
        ...validValues,
        openingBalance: -50,
      })
    ).rejects.toThrow('Opening balance cannot be negative');
  });

  it('requires an opening balance when opening balance is enabled', async () => {
    await expect(
      schema.validate({
        ...validValues,
        openingBalance: '',
      })
    ).rejects.toThrow('Opening balance is required');
  });

  it('requires an opening date when opening balance is enabled', async () => {
    await expect(
      schema.validate({
        ...validValues,
        openingDate: '',
      })
    ).rejects.toThrow('Opening date is required');
  });

  it('allows opening balance fields to be empty when disabled', async () => {
    await expect(
      schema.validate({
        ...validValues,
        createWithoutOpeningBalance: true,
        openingBalance: '',
        openingDate: '',
      })
    ).resolves.toBeDefined();
  });

  it('requires an exchange rate for a foreign currency', async () => {
    await expect(
      schema.validate({
        ...validValues,
        currencyCode: 'USD',
        exchangeRate: null,
      })
    ).rejects.toThrow('Exchange rate is required');
  });

  it('rejects a non-positive foreign-currency exchange rate', async () => {
    await expect(
      schema.validate({
        ...validValues,
        currencyCode: 'USD',
        exchangeRate: { value: 0, inverted: false },
      })
    ).rejects.toThrow('Exchange rate must be positive');
  });

  it('accepts a foreign currency without a manual rate when an official rate is available', async () => {
    const schemaWithOfficialRate = createPettyCashAccountFormValidation(
      'NGN',
      messages,
      officialExchangeRate
    );

    await expect(
      schemaWithOfficialRate.validate({
        ...validValues,
        currencyCode: 'USD',
        exchangeRate: null,
      })
    ).resolves.toBeDefined();
  });
});
