import countries from '@/shared/configs/countries.json';

function getLocale(jurisdictionCode?: string) {
  const country = countries.find(
    ({ code }) => code === jurisdictionCode?.toUpperCase()
  );

  return country?.locale ?? 'en-US';
}

const moneyHelpers = Object.freeze({ getLocale });

export default moneyHelpers;
