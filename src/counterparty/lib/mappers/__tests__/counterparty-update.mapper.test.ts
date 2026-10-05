import { counterpartyUpdateMapper as mapper } from '@/counterparty/lib/mappers/counterparty-update.mapper';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const address = {
  line1: 'Street',
  line2: 'Floor 2',
  city: 'Lagos',
  region: 'Lagos',
  postalCode: '100001',
  countryCode: 'NG',
};

const party: ICounterpartyDto = {
  id: 'one',
  accountingEntityId: 'entity',
  createdBy: 'actor',
  version: 7,
  name: 'Original',
  type: 'organization',
  status: 'draft',
  roles: ['vendor', 'employer', 'contractor'],
  meta: {
    vendor: { address },
    employer: { displayName: 'Employer', address },
    contractor: { address },
  },
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('counterparty update mapper', () => {
  it('maps unchanged core values without metadata, status, or a type change', () => {
    expect(
      mapper.toCounterpartyUpdateReq(
        mapper.toCounterpartyValues(party),
        party,
        true
      )
    ).toEqual({
      expectedVersion: 7,
      name: undefined,
      type: undefined,
      meta: undefined,
    });
  });
  it('includes allowed type edits and omits a locked type', () => {
    const values = { name: 'Changed', type: 'individual' as const };
    expect(mapper.toCounterpartyUpdateReq(values, party, true)).toEqual({
      expectedVersion: 7,
      name: 'Changed',
      type: 'individual',
      meta: undefined,
    });
    expect(mapper.toCounterpartyUpdateReq(values, party, false)).toEqual({
      expectedVersion: 7,
      name: 'Changed',
      type: undefined,
      meta: undefined,
    });
  });
  it('round trips each role without sending unchanged metadata', () => {
    expect(mapper.toVendorValues(party).address).toEqual(address);
    expect(mapper.toEmployerValues(party).displayName).toBe('Employer');
    expect(mapper.toContractorValues(party).address).toEqual(address);

    const unchanged = {
      expectedVersion: 7,
      name: undefined,
      type: undefined,
      meta: undefined,
    };

    expect(
      mapper.toVendorUpdateReq(mapper.toVendorValues(party), party, true)
    ).toEqual(unchanged);
    expect(
      mapper.toEmployerUpdateReq(mapper.toEmployerValues(party), party, true)
    ).toEqual(unchanged);
    expect(
      mapper.toContractorUpdateReq(
        mapper.toContractorValues(party),
        party,
        true
      )
    ).toEqual(unchanged);
  });
  it('updates one role and retains complete metadata for the others', () => {
    const values = mapper.toVendorValues(party);
    values.address.city = 'Abuja';
    expect(mapper.toVendorUpdateReq(values, party, false)).toEqual({
      expectedVersion: 7,
      name: undefined,
      type: undefined,
      meta: {
        vendor: { address: { ...address, city: 'Abuja' } },
        employer: party.meta.employer,
        contractor: party.meta.contractor,
      },
    });
  });
  it('clears a vendor address explicitly while retaining other roles', () => {
    const values = mapper.toVendorValues(party);
    values.address = {};
    expect(mapper.toVendorUpdateReq(values, party, true)).toEqual({
      expectedVersion: 7,
      name: undefined,
      type: undefined,
      meta: {
        vendor: { address: null },
        employer: party.meta.employer,
        contractor: party.meta.contractor,
      },
    });
  });
  it('preserves an untouched null vendor address', () => {
    const baseline = {
      ...party,
      meta: { vendor: { address: null } },
      roles: ['vendor' as const],
    };

    expect(
      mapper.toVendorUpdateReq(mapper.toVendorValues(baseline), baseline, true)
    ).toEqual({
      expectedVersion: 7,
      name: undefined,
      type: undefined,
      meta: undefined,
    });
  });
  it('retains untouched null and empty optional values in a full replacement', () => {
    const baseline: ICounterpartyDto = {
      ...party,
      meta: {
        employer: { displayName: '', address: { ...address, line2: '' } },
        vendor: { address: null },
        contractor: { address },
      },
    };

    const values = mapper.toContractorValues(baseline);
    values.address.city = 'Abuja';
    expect(mapper.toContractorUpdateReq(values, baseline, false)).toEqual({
      expectedVersion: 7,
      name: undefined,
      type: undefined,
      meta: {
        employer: baseline.meta.employer,
        vendor: baseline.meta.vendor,
        contractor: { address: { ...address, city: 'Abuja' } },
      },
    });
  });
  it('clears employer display name and retains contractor postal code', () => {
    const values = mapper.toEmployerValues(party);
    values.displayName = '';
    expect(mapper.toEmployerUpdateReq(values, party, true)).toEqual({
      expectedVersion: 7,
      name: undefined,
      type: undefined,
      meta: {
        employer: { displayName: null, address },
        vendor: party.meta.vendor,
        contractor: party.meta.contractor,
      },
    });
    const contractor = mapper.toContractorValues(party);
    contractor.address.line1 = 'New street';
    expect(mapper.toContractorUpdateReq(contractor, party, true)).toEqual({
      expectedVersion: 7,
      name: undefined,
      type: undefined,
      meta: {
        employer: party.meta.employer,
        vendor: party.meta.vendor,
        contractor: { address: { ...address, line1: 'New street' } },
      },
    });
  });
});
