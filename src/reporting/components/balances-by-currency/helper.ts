import currencies from '@/shared/configs/currencies.json';

function currencyLogo(currencyCode: string) {
  return currencies.find(
    ({ code }) => code.toLowerCase() === currencyCode.toLowerCase()
  )?.logo;
}

const balancesByCurrencyHelpers = Object.freeze({ currencyLogo });
export default balancesByCurrencyHelpers;
