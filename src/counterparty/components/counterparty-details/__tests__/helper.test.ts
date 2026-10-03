import counterpartyDetailsHelpers from '@/counterparty/components/counterparty-details/helper';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const address = {
  line1: '14 Adeola Odeku Street',
  city: 'Victoria Island',
  region: 'Lagos',
  countryCode: 'NG',
};
const party: ICounterpartyDto = {
  id: 'one',
  accountingEntityId: 'entity',
  createdBy: '00000000-0000-4000-8000-000000000100',
  version: 1,
  name: 'Adenike',
  type: 'organization',
  status: 'active',
  roles: ['vendor', 'contractor'],
  meta: {},
  createdAt: '',
  updatedAt: '',
};

describe('counterpartyDetailsHelpers', () => {
  it('combines identical role addresses and expands the country name', () => {
    expect(
      counterpartyDetailsHelpers.getAddresses({
        ...party,
        meta: { vendor: { address }, contractor: { address } },
      })
    ).toEqual([
      {
        roles: ['vendor', 'contractor'],
        lines: ['14 Adeola Odeku Street', 'Victoria Island, Lagos', 'Nigeria'],
      },
    ]);
  });
  it('keeps different role addresses distinct', () => {
    expect(
      counterpartyDetailsHelpers.getAddresses({
        ...party,
        meta: {
          vendor: { address },
          contractor: { address: { ...address, line1: 'Other address' } },
        },
      })
    ).toHaveLength(2);
  });
  it('omits missing and null addresses', () => {
    expect(
      counterpartyDetailsHelpers.getAddresses({
        ...party,
        meta: { vendor: { address: null } },
      })
    ).toEqual([]);
  });
  it('retains optional lines and unknown country codes', () => {
    expect(
      counterpartyDetailsHelpers.getAddresses({
        ...party,
        meta: {
          vendor: {
            address: {
              ...address,
              line2: 'Suite 2',
              postalCode: '100001',
              countryCode: 'ZZ',
            },
          },
        },
      })[0].lines
    ).toEqual([
      '14 Adeola Odeku Street',
      'Suite 2',
      'Victoria Island, Lagos',
      '100001',
      'ZZ',
    ]);
  });
});
