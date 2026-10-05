import countries from '@/shared/configs/countries.json';
import type { ICounterpartyDto, UCounterpartyRole } from '@/shared/lib/api/Api';

function getAddresses(counterparty: ICounterpartyDto) {
  const addresses: { lines: string[]; roles: UCounterpartyRole[] }[] = [];
  for (const role of counterparty.roles) {
    const address = counterparty.meta[role]?.address;
    if (!address) continue;

    const country =
      countries.find((item) => item.code === address.countryCode)?.name ??
      address.countryCode;

    const lines = [
      address.line1,
      address.line2,
      [address.city, address.region].filter(Boolean).join(', '),
      address.postalCode,
      country,
    ].filter((line): line is string => Boolean(line));

    const existing = addresses.find(
      (item) => JSON.stringify(item.lines) === JSON.stringify(lines)
    );

    if (existing) existing.roles.push(role);
    else addresses.push({ lines, roles: [role] });
  }

  return addresses;
}

const counterpartyDetailsHelpers = Object.freeze({ getAddresses });
export default counterpartyDetailsHelpers;
