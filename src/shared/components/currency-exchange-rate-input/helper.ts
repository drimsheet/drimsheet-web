function getValue(value: number | undefined, officialRate: number | undefined) {
  if (value !== undefined) {
    return value;
  }

  return officialRate;
}

const currencyExchangeRateInputHelpers = Object.freeze({
  getValue,
});

export default currencyExchangeRateInputHelpers;
