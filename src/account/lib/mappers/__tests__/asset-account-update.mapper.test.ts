import { assetAccountUpdateMapper } from '@/account/lib/mappers/asset-account-update.mapper';
import type {
  IBankDetails,
  ILedgerAccountDto,
  IOpeningBalanceDto,
  TEntityId,
} from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const account: ILedgerAccountDto = {
  id: 'account-1' as TEntityId,
  code: '100001',
  materializedPath: '100001',
  accountingEntityId: 'entity-1' as TEntityId,
  type: 'asset',
  normalBalance: 'debit',
  subType: 'cash_and_cash_equivalent',
  behavior: 'bank',
  isControlAccount: false,
  name: 'Operating account',
  status: 'active',
  contraAccountRule: 'contra_permitted',
  adjunctAccountRule: 'adjunct_permitted',
  openingBalanceDate: '2026-10-01T00:00:00Z',
  createdBy: 'user-1' as TEntityId,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
  balance: { amount: 12345, currencyCode: 'USD', isMinorUnit: true },
  functionalBalance: {
    amount: 123450,
    currencyCode: 'NGN',
    isMinorUnit: false,
  },
};

const bank: IBankDetails = {
  countryCode: 'NG',
  bankName: 'Example Bank',
  accountName: 'Acme',
  accountNumber: '0123456789',
};

const openingBalance: IOpeningBalanceDto = {
  amount: { amount: 2550, currencyCode: 'USD', isMinorUnit: true },
  date: '2026-10-01T00:00:00Z',
  exchangeRate: {
    baseCurrencyCode: 'USD',
    targetCurrencyCode: 'NGN',
    rate: 1500,
    type: 'market',
    asOf: '2026-10-01T00:00:00Z',
    source: 'manual',
  },
};

describe('assetAccountUpdateMapper', () => {
  it('prefills the fetched opening balance, date and exchange rate instead of the current balance', () => {
    expect(
      assetAccountUpdateMapper.toPettyCashValues(account, openingBalance)
    ).toEqual({
      name: 'Operating account',
      currencyCode: 'USD',
      createWithoutOpeningBalance: true,
      openingBalance: 25.5,
      openingDate: '2026-10-01',
      exchangeRate: { value: 1500, inverted: false },
    });
    expect(
      assetAccountUpdateMapper.toBankValues(account, bank, openingBalance)
    ).toEqual({
      name: 'Operating account',
      currencyCode: 'USD',
      bankLocation: 'NG',
      bankName: 'Example Bank',
      accountName: 'Acme',
      accountNumber: '0123456789',
      createWithoutOpeningBalance: true,
      openingBalance: 25.5,
      openingDate: '2026-10-01',
      exchangeRate: { value: 1500, inverted: false },
      isSubAccount: false,
    });
  });

  it('enables setting an opening balance when no opening journal exists', () => {
    expect(assetAccountUpdateMapper.toPettyCashValues(account, null)).toEqual({
      name: 'Operating account',
      currencyCode: 'USD',
      createWithoutOpeningBalance: false,
      openingBalance: '',
      openingDate: '',
      exchangeRate: null,
    });
  });

  it.each([
    ['JPY', 1200, true, 1200],
    ['KWD', 12345, true, 12.345],
    ['USD', 12.34, false, 12.34],
    ['USD', 0, true, 0],
  ] as const)(
    'maps %s opening amounts with the correct unit',
    (currencyCode, amount, isMinorUnit, expected) => {
      expect(
        assetAccountUpdateMapper.toPettyCashValues(account, {
          ...openingBalance,
          amount: { currencyCode, amount, isMinorUnit },
          exchangeRate: null,
        }).openingBalance
      ).toBe(expected);
    }
  );

  it('omits unchanged fields and all immutable fields', () => {
    expect(
      assetAccountUpdateMapper.toBankUpdateReq(
        assetAccountUpdateMapper.toBankValues(account, bank, openingBalance),
        account,
        bank
      )
    ).toEqual({
      name: undefined,
      currencyCode: undefined,
      bankAccount: undefined,
      openingBalance: undefined,
    });
    expect(
      assetAccountUpdateMapper.toPettyCashUpdateReq(
        {
          ...assetAccountUpdateMapper.toPettyCashValues(
            account,
            openingBalance
          ),
          name: 'Travel cash',
        },
        account
      )
    ).toEqual({
      name: 'Travel cash',
      currencyCode: undefined,
      openingBalance: undefined,
    });
  });

  it('maps currency-only changes for both account update endpoints', () => {
    const values = {
      ...assetAccountUpdateMapper.toBankValues(account, bank, null),
      currencyCode: 'NGN',
      createWithoutOpeningBalance: true,
    };

    expect(
      assetAccountUpdateMapper.toPettyCashUpdateReq(values, account)
    ).toEqual({
      name: undefined,
      currencyCode: 'NGN',
      openingBalance: undefined,
    });
    expect(
      assetAccountUpdateMapper.toBankUpdateReq(values, account, bank)
    ).toEqual({
      name: undefined,
      currencyCode: 'NGN',
      bankAccount: undefined,
      openingBalance: undefined,
    });
  });

  it('replaces all three bank details when any bank field changes', () => {
    expect(
      assetAccountUpdateMapper.toBankUpdateReq(
        {
          ...assetAccountUpdateMapper.toBankValues(
            account,
            bank,
            openingBalance
          ),
          accountName: 'New holder',
        },
        account,
        bank
      )
    ).toEqual({
      name: undefined,
      currencyCode: undefined,
      bankAccount: {
        bankName: 'Example Bank',
        accountNumber: '0123456789',
        accountName: 'New holder',
      },
      openingBalance: undefined,
    });
  });

  it('maps an explicit replacement balance and inverted exchange rate', () => {
    expect(
      assetAccountUpdateMapper.toPettyCashUpdateReq(
        {
          ...assetAccountUpdateMapper.toPettyCashValues(
            account,
            openingBalance
          ),
          createWithoutOpeningBalance: false,
          openingBalance: 25.5,
          exchangeRate: { value: 0.001, inverted: true },
        },
        account
      )
    ).toEqual({
      name: undefined,
      currencyCode: undefined,
      openingBalance: {
        amount: { amount: 25.5, currencyCode: 'USD', isMinorUnit: false },
        date: '2026-10-01',
        exchangeRate: {
          baseCurrencyCode: 'USD',
          targetCurrencyCode: 'NGN',
          rate: 1000,
          type: 'market',
          asOf: '2026-10-01',
          source: 'manual',
        },
      },
    });
  });
});
