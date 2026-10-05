import type {
  IContractorFormValues,
  ICounterpartyFormValues,
  IEmployerFormValues,
  IVendorFormValues,
} from '@/counterparty/components';
import type { TStatusBadgeValue } from '@/shared/components/status-badge';
import {
  ECounterpartyStatus,
  type ICounterpartyCreateReq,
  type ICounterpartyDto,
  type IGetCounterpartiesQuery,
  type UCounterpartyRole,
  type UCounterpartySortBy,
  type UCounterpartyStatus,
  type UCounterpartyType,
} from '@/shared/lib/api/Api';
import { t } from 'i18next';

interface ICounterpartyTableQueryState {
  search?: string;
  page?: number;
  limit?: number;
  sortKey?: keyof ICounterpartyDto;
  sortDirection?: 'asc' | 'desc' | null;
  filters: Record<string, (string | number)[]>;
}

export const counterpartyMapper = {
  mapStatusToBadgeProps(status: UCounterpartyStatus): TStatusBadgeValue {
    switch (status) {
      case ECounterpartyStatus.Draft:
        return { variant: 'neutral', label: t('shared:draft') };
      case ECounterpartyStatus.Active:
        return { variant: 'success', label: t('shared:active') };
      case ECounterpartyStatus.Archived:
        return { variant: 'neutral', label: t('shared:archived') };
    }
  },

  toGetCounterpartiesQuery(
    values: ICounterpartyTableQueryState
  ): IGetCounterpartiesQuery {
    const sortKeyMap: Partial<
      Record<keyof ICounterpartyDto, UCounterpartySortBy>
    > = {
      name: 'name',
      createdAt: 'createdAt',
    };

    const orderBy = values.sortKey ? sortKeyMap[values.sortKey] : undefined;

    const status = values.filters.status?.[0] as
      | UCounterpartyStatus
      | undefined;

    const type = values.filters.type?.[0] as UCounterpartyType | undefined;

    const roles =
      values.filters.roles && values.filters.roles.length > 0
        ? (values.filters.roles as UCounterpartyRole[])
        : undefined;

    return {
      limit: values.limit,
      orderBy,
      sortDirection: orderBy ? values.sortDirection || undefined : undefined,
      search: values.search || undefined,
      page: values.page,
      roles,
      type,
      status,
    };
  },

  toCounterpartyCreateReq(
    values: ICounterpartyFormValues
  ): ICounterpartyCreateReq {
    return {
      name: values.name,
      type: values.type,
      status: ECounterpartyStatus.Active,
    };
  },

  toVendorCreateReq(values: IVendorFormValues): ICounterpartyCreateReq {
    const address = values.address;

    const hasAddress =
      address &&
      (address.line1 ||
        address.line2 ||
        address.city ||
        address.region ||
        address.countryCode);

    return {
      name: values.name,
      type: values.type,
      status: ECounterpartyStatus.Active,
      meta: {
        vendor: {
          address: hasAddress
            ? {
                line1: address.line1 ?? '',
                line2: address.line2 || undefined,
                city: address.city ?? '',
                region: address.region || undefined,
                countryCode: address.countryCode ?? '',
              }
            : undefined,
        },
      },
    };
  },

  toContractorCreateReq(values: IContractorFormValues): ICounterpartyCreateReq {
    return {
      name: values.name,
      type: values.type,
      status: ECounterpartyStatus.Active,
      meta: {
        contractor: {
          address: {
            line1: values.address.line1,
            line2: values.address.line2 || undefined,
            city: values.address.city,
            region: values.address.region || undefined,
            countryCode: values.address.countryCode,
          },
        },
      },
    };
  },

  toEmployerCreateReq(values: IEmployerFormValues): ICounterpartyCreateReq {
    return {
      name: values.name,
      type: values.type,
      status: ECounterpartyStatus.Active,
      meta: {
        employer: {
          displayName: values.displayName || null,
          address: {
            line1: values.address.line1,
            line2: values.address.line2 || undefined,
            city: values.address.city,
            region: values.address.region || undefined,
            countryCode: values.address.countryCode,
          },
        },
      },
    };
  },
};
