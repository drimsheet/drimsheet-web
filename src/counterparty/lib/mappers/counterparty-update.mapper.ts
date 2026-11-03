import type { IContractorFormValues } from '@/counterparty/components/contractor-form';
import type { IAddressValues } from '@/counterparty/components/counterparty-address-fields';
import type { ICounterpartyFormValues } from '@/counterparty/components/counterparty-form';
import type { IEmployerFormValues } from '@/counterparty/components/employer-form';
import type { IVendorFormValues } from '@/counterparty/components/vendor-form';
import type {
  IAddressDto,
  ICounterpartyCreateRoleDetailsReq,
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

function toRoleDetails(
  party: ICounterpartyDto
): ICounterpartyCreateRoleDetailsReq {
  const roleDetails: ICounterpartyCreateRoleDetailsReq = {};
  if (party.roleDetails.employer) {
    roleDetails.employer = {
      displayName: party.roleDetails.employer.displayName || null,
      address: toAddress(toAddressValues(party.roleDetails.employer.address)),
    };
  }

  if (party.roleDetails.vendor) {
    roleDetails.vendor = {
      address: toVendorAddress(
        toAddressValues(party.roleDetails.vendor.address)
      ),
    };
  }

  if (party.roleDetails.contractor) {
    roleDetails.contractor = {
      address: toAddress(toAddressValues(party.roleDetails.contractor.address)),
    };
  }

  return roleDetails;
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

function toReplacementRoleDetails(
  edited: ICounterpartyCreateRoleDetailsReq,
  initial: ICounterpartyCreateRoleDetailsReq,
  baseline: ICounterpartyDto
): ICounterpartyCreateRoleDetailsReq {
  const employer =
    JSON.stringify(edited.employer) === JSON.stringify(initial.employer)
      ? baseline.roleDetails.employer
      : edited.employer;

  const vendor =
    JSON.stringify(edited.vendor) === JSON.stringify(initial.vendor)
      ? baseline.roleDetails.vendor
      : edited.vendor;

  const contractor =
    JSON.stringify(edited.contractor) === JSON.stringify(initial.contractor)
      ? baseline.roleDetails.contractor
      : edited.contractor;

  const roleDetails: ICounterpartyCreateRoleDetailsReq = {};
  if (employer) {
    roleDetails.employer = {
      displayName: employer.displayName,
      address: toPreservedAddress(employer.address),
    };
  }

  if (vendor) {
    roleDetails.vendor = {
      address: vendor.address
        ? toPreservedAddress(vendor.address)
        : vendor.address,
    };
  }

  if (contractor) {
    roleDetails.contractor = {
      address: toPreservedAddress(contractor.address),
    };
  }

  return roleDetails;
}

function toUpdateReq(
  values: ICounterpartyFormValues,
  baseline: ICounterpartyDto,
  canChangeType: boolean,
  roleDetails?: ICounterpartyCreateRoleDetailsReq
): ICounterpartyUpdateReq {
  const initialRoleDetails = toRoleDetails(baseline);

  return {
    name: values.name !== baseline.name ? values.name : undefined,
    type:
      canChangeType && values.type !== baseline.type ? values.type : undefined,
    roleDetails:
      roleDetails &&
      JSON.stringify(roleDetails) !== JSON.stringify(initialRoleDetails)
        ? toReplacementRoleDetails(roleDetails, initialRoleDetails, baseline)
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
      address: toAddressValues(party.roleDetails.vendor?.address),
    };
  },
  toEmployerValues(party: ICounterpartyDto): IEmployerFormValues {
    const address = toAddress(party.roleDetails.employer?.address ?? {});

    return {
      name: party.name,
      type: party.type,
      displayName: party.roleDetails.employer?.displayName ?? '',
      address,
    };
  },
  toContractorValues(party: ICounterpartyDto): IContractorFormValues {
    const address = toAddress(party.roleDetails.contractor?.address ?? {});

    return { name: party.name, type: party.type, address };
  },
  toCounterpartyUpdateReq: toUpdateReq,
  toVendorUpdateReq(
    values: IVendorFormValues,
    baseline: ICounterpartyDto,
    canChangeType: boolean
  ): ICounterpartyUpdateReq {
    const roleDetails = toRoleDetails(baseline);
    roleDetails.vendor = { address: toVendorAddress(values.address) };

    return toUpdateReq(values, baseline, canChangeType, roleDetails);
  },
  toEmployerUpdateReq(
    values: IEmployerFormValues,
    baseline: ICounterpartyDto,
    canChangeType: boolean
  ): ICounterpartyUpdateReq {
    const roleDetails = toRoleDetails(baseline);
    roleDetails.employer = {
      displayName: values.displayName || null,
      address: toAddress(values.address),
    };

    return toUpdateReq(values, baseline, canChangeType, roleDetails);
  },
  toContractorUpdateReq(
    values: IContractorFormValues,
    baseline: ICounterpartyDto,
    canChangeType: boolean
  ): ICounterpartyUpdateReq {
    const roleDetails = toRoleDetails(baseline);
    roleDetails.contractor = { address: toAddress(values.address) };

    return toUpdateReq(values, baseline, canChangeType, roleDetails);
  },
};
