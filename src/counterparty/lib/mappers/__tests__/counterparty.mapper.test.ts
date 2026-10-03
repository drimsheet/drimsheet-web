import type {
  IContractorFormValues,
  ICounterpartyFormValues,
  IEmployerFormValues,
  IVendorFormValues,
} from '@/counterparty/components';
import { counterpartyMapper } from '@/counterparty/lib/mappers/counterparty.mapper';
import {
  ECounterpartyRole,
  ECounterpartyStatus,
  ECounterpartyType,
} from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

describe('counterparty.mapper', () => {
  describe('mapStatusToBadgeProps', () => {
    it('maps draft status to neutral badge props', () => {
      const result = counterpartyMapper.mapStatusToBadgeProps('draft');
      expect(result).toEqual({ variant: 'neutral', label: 'Draft' });
    });

    it('maps active status to success badge props', () => {
      const result = counterpartyMapper.mapStatusToBadgeProps('active');
      expect(result).toEqual({ variant: 'success', label: 'Active' });
    });

    it('maps archived status to neutral badge props', () => {
      const result = counterpartyMapper.mapStatusToBadgeProps('archived');
      expect(result).toEqual({ variant: 'neutral', label: 'Archived' });
    });
  });

  describe('toGetCounterpartiesQuery', () => {
    it('maps table query state to the generated counterparties query contract', () => {
      const result = counterpartyMapper.toGetCounterpartiesQuery({
        search: 'Acme',
        page: 2,
        limit: 10,
        sortKey: 'name',
        sortDirection: 'asc',
        filters: {
          status: [ECounterpartyStatus.Active],
          type: [ECounterpartyType.Organization],
          roles: [ECounterpartyRole.Vendor, ECounterpartyRole.Contractor],
        },
      });

      expect(result).toEqual({
        limit: 10,
        orderBy: 'name',
        sortDirection: 'asc',
        search: 'Acme',
        page: 2,
        roles: [ECounterpartyRole.Vendor, ECounterpartyRole.Contractor],
        type: ECounterpartyType.Organization,
        status: ECounterpartyStatus.Active,
      });
    });

    it('maps created date sorting and empty optional values explicitly', () => {
      const result = counterpartyMapper.toGetCounterpartiesQuery({
        search: '',
        page: 1,
        limit: 10,
        sortKey: 'createdAt',
        sortDirection: 'desc',
        filters: {},
      });

      expect(result).toEqual({
        limit: 10,
        orderBy: 'createdAt',
        sortDirection: 'desc',
        search: undefined,
        page: 1,
        roles: undefined,
        type: undefined,
        status: undefined,
      });
    });

    it('omits orderBy and sortDirection for unsupported UI sort keys', () => {
      const result = counterpartyMapper.toGetCounterpartiesQuery({
        search: undefined,
        page: 3,
        limit: 25,
        sortKey: 'status',
        sortDirection: 'asc',
        filters: {},
      });

      expect(result).toEqual({
        limit: 25,
        orderBy: undefined,
        sortDirection: undefined,
        search: undefined,
        page: 3,
        roles: undefined,
        type: undefined,
        status: undefined,
      });
    });

    it('maps the first singular filter value and every selected role', () => {
      const result = counterpartyMapper.toGetCounterpartiesQuery({
        search: 'Jane',
        page: 1,
        limit: 10,
        sortKey: undefined,
        sortDirection: null,
        filters: {
          status: [ECounterpartyStatus.Archived, ECounterpartyStatus.Active],
          type: [ECounterpartyType.Individual, ECounterpartyType.Organization],
          roles: [ECounterpartyRole.Employer, ECounterpartyRole.Vendor],
        },
      });

      expect(result).toEqual({
        limit: 10,
        orderBy: undefined,
        sortDirection: undefined,
        search: 'Jane',
        page: 1,
        roles: [ECounterpartyRole.Employer, ECounterpartyRole.Vendor],
        type: ECounterpartyType.Individual,
        status: ECounterpartyStatus.Archived,
      });
    });
  });

  describe('toCounterpartyCreateReq', () => {
    it('maps counterparty form values to DTO', () => {
      const values: ICounterpartyFormValues = {
        name: 'John Doe',
        type: 'individual',
      };
      const result = counterpartyMapper.toCounterpartyCreateReq(values);
      expect(result).toEqual({
        name: 'John Doe',
        type: 'individual',
        status: ECounterpartyStatus.Active,
      });
    });
  });

  describe('toVendorCreateReq', () => {
    it('maps vendor form values without address to DTO', () => {
      const values: IVendorFormValues = {
        name: 'Acme Corp',
        type: 'organization',
        displayName: 'Acme',
        address: {},
      };
      const result = counterpartyMapper.toVendorCreateReq(values);
      expect(result).toEqual({
        name: 'Acme Corp',
        type: 'organization',
        status: ECounterpartyStatus.Active,
        meta: {
          vendor: {
            address: undefined,
          },
        },
      });
    });

    it('maps vendor form values with address to DTO', () => {
      const values: IVendorFormValues = {
        name: 'Acme Corp',
        type: 'organization',
        displayName: 'Acme',
        address: {
          line1: '123 Main St',
          city: 'Lagos',
          countryCode: 'NG',
        },
      };
      const result = counterpartyMapper.toVendorCreateReq(values);
      expect(result).toEqual({
        name: 'Acme Corp',
        type: 'organization',
        status: ECounterpartyStatus.Active,
        meta: {
          vendor: {
            address: {
              line1: '123 Main St',
              line2: undefined,
              city: 'Lagos',
              region: undefined,
              countryCode: 'NG',
            },
          },
        },
      });
    });
  });

  describe('toContractorCreateReq', () => {
    it('maps contractor form values to DTO, ignoring displayName', () => {
      const values: IContractorFormValues = {
        name: 'Jane Smith',
        type: 'individual',
        displayName: 'Jane Special name',
        address: {
          line1: '456 side road',
          city: 'Abuja',
          countryCode: 'NG',
        },
      };
      const result = counterpartyMapper.toContractorCreateReq(values);
      expect(result).toEqual({
        name: 'Jane Smith',
        type: 'individual',
        status: ECounterpartyStatus.Active,
        meta: {
          contractor: {
            address: {
              line1: '456 side road',
              line2: undefined,
              city: 'Abuja',
              region: undefined,
              countryCode: 'NG',
            },
          },
        },
      });
    });
  });

  describe('toEmployerCreateReq', () => {
    it('maps employer form values with displayName to DTO', () => {
      const values: IEmployerFormValues = {
        name: 'Tech Inc',
        type: 'organization',
        displayName: 'Tech LLC',
        address: {
          line1: '789 Business Blvd',
          city: 'Ibadan',
          countryCode: 'NG',
        },
      };
      const result = counterpartyMapper.toEmployerCreateReq(values);
      expect(result).toEqual({
        name: 'Tech Inc',
        type: 'organization',
        status: ECounterpartyStatus.Active,
        meta: {
          employer: {
            displayName: 'Tech LLC',
            address: {
              line1: '789 Business Blvd',
              line2: undefined,
              city: 'Ibadan',
              region: undefined,
              countryCode: 'NG',
            },
          },
        },
      });
    });

    it('maps employer form values without displayName to DTO', () => {
      const values: IEmployerFormValues = {
        name: 'Tech Inc',
        type: 'organization',
        address: {
          line1: '789 Business Blvd',
          city: 'Ibadan',
          countryCode: 'NG',
        },
      };
      const result = counterpartyMapper.toEmployerCreateReq(values);
      expect(result).toEqual({
        name: 'Tech Inc',
        type: 'organization',
        status: ECounterpartyStatus.Active,
        meta: {
          employer: {
            displayName: null,
            address: {
              line1: '789 Business Blvd',
              line2: undefined,
              city: 'Ibadan',
              region: undefined,
              countryCode: 'NG',
            },
          },
        },
      });
    });
  });
});
