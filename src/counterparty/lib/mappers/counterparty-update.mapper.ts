import type { IContractorFormValues } from '@/counterparty/components/contractor-form';
import type { IAddressValues } from '@/counterparty/components/counterparty-address-fields';
import type { ICounterpartyFormValues } from '@/counterparty/components/counterparty-form';
import type { IEmployerFormValues } from '@/counterparty/components/employer-form';
import type { IVendorFormValues } from '@/counterparty/components/vendor-form';
import type {
  IAddressDto,
  ICounterpartyCreateMetaReq,
  ICounterpartyDto,
  ICounterpartyUpdateReq,
} from '@/shared/lib/api/Api';

function toAddressValues(address?: IAddressDto | null): IAddressValues {
  return {
    line1: address?.line1 ?? '',
    line2: address?.line2 ?? '',
    city: address?.city ?? '',
    region: address?.region ?? '',
    postalCode: address?.postalCode ?? '',
    countryCode: address?.countryCode ?? '',
  };
}

function toAddress(values: IAddressValues): IAddressDto {
  return {
    line1: values.line1 ?? '',
    line2: values.line2 || undefined,
    city: values.city ?? '',
    region: values.region || undefined,
    postalCode: values.postalCode || undefined,
    countryCode: values.countryCode ?? '',
  };
}

function toVendorAddress(values: IAddressValues): IAddressDto | null {
  return Object.values(values).some(Boolean) ? toAddress(values) : null;
}

function toMeta(party: ICounterpartyDto): ICounterpartyCreateMetaReq {
  const meta: ICounterpartyCreateMetaReq = {};
  if (party.meta.employer)
    meta.employer = {
      displayName: party.meta.employer.displayName || null,
      address: toAddress(toAddressValues(party.meta.employer.address)),
    };

  if (party.meta.vendor)
    meta.vendor = {
      address: toVendorAddress(toAddressValues(party.meta.vendor.address)),
    };

  if (party.meta.contractor)
    meta.contractor = {
      address: toAddress(toAddressValues(party.meta.contractor.address)),
    };

  return meta;
}

function toPreservedAddress(address: IAddressDto): IAddressDto {
  return {
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    region: address.region,
    postalCode: address.postalCode,
    countryCode: address.countryCode,
  };
}

function toReplacementMeta(
  edited: ICounterpartyCreateMetaReq,
  initial: ICounterpartyCreateMetaReq,
  baseline: ICounterpartyDto
): ICounterpartyCreateMetaReq {
  const employer =
    JSON.stringify(edited.employer) === JSON.stringify(initial.employer)
      ? baseline.meta.employer
      : edited.employer;

  const vendor =
    JSON.stringify(edited.vendor) === JSON.stringify(initial.vendor)
      ? baseline.meta.vendor
      : edited.vendor;

  const contractor =
    JSON.stringify(edited.contractor) === JSON.stringify(initial.contractor)
      ? baseline.meta.contractor
      : edited.contractor;

  const meta: ICounterpartyCreateMetaReq = {};
  if (employer)
    meta.employer = {
      displayName: employer.displayName,
      address: toPreservedAddress(employer.address),
    };

  if (vendor)
    meta.vendor = {
      address: vendor.address
        ? toPreservedAddress(vendor.address)
        : vendor.address,
    };

  if (contractor)
    meta.contractor = { address: toPreservedAddress(contractor.address) };

  return meta;
}

function toUpdateReq(
  values: ICounterpartyFormValues,
  baseline: ICounterpartyDto,
  canChangeType: boolean,
  meta?: ICounterpartyCreateMetaReq
): ICounterpartyUpdateReq {
  const initialMeta = toMeta(baseline);

  return {
    expectedVersion: baseline.version,
    name: values.name !== baseline.name ? values.name : undefined,
    type:
      canChangeType && values.type !== baseline.type ? values.type : undefined,
    meta:
      meta && JSON.stringify(meta) !== JSON.stringify(initialMeta)
        ? toReplacementMeta(meta, initialMeta, baseline)
        : undefined,
  };
}

export const counterpartyUpdateMapper = {
  toCounterpartyValues(party: ICounterpartyDto): ICounterpartyFormValues {
    return { name: party.name, type: party.type };
  },
  toVendorValues(party: ICounterpartyDto): IVendorFormValues {
    return {
      name: party.name,
      type: party.type,
      displayName: '',
      address: toAddressValues(party.meta.vendor?.address),
    };
  },
  toEmployerValues(party: ICounterpartyDto): IEmployerFormValues {
    const address = toAddress(party.meta.employer?.address ?? {});

    return {
      name: party.name,
      type: party.type,
      displayName: party.meta.employer?.displayName ?? '',
      address,
    };
  },
  toContractorValues(party: ICounterpartyDto): IContractorFormValues {
    const address = toAddress(party.meta.contractor?.address ?? {});

    return { name: party.name, type: party.type, address };
  },
  toCounterpartyUpdateReq: toUpdateReq,
  toVendorUpdateReq(
    values: IVendorFormValues,
    baseline: ICounterpartyDto,
    canChangeType: boolean
  ): ICounterpartyUpdateReq {
    const meta = toMeta(baseline);
    meta.vendor = { address: toVendorAddress(values.address) };

    return toUpdateReq(values, baseline, canChangeType, meta);
  },
  toEmployerUpdateReq(
    values: IEmployerFormValues,
    baseline: ICounterpartyDto,
    canChangeType: boolean
  ): ICounterpartyUpdateReq {
    const meta = toMeta(baseline);
    meta.employer = {
      displayName: values.displayName || null,
      address: toAddress(values.address),
    };

    return toUpdateReq(values, baseline, canChangeType, meta);
  },
  toContractorUpdateReq(
    values: IContractorFormValues,
    baseline: ICounterpartyDto,
    canChangeType: boolean
  ): ICounterpartyUpdateReq {
    const meta = toMeta(baseline);
    meta.contractor = { address: toAddress(values.address) };

    return toUpdateReq(values, baseline, canChangeType, meta);
  },
};
