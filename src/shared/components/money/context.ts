import { createContext } from 'react';

export const MoneyJurisdictionContext = createContext<string | undefined>(
  undefined
);

export const MoneyJurisdictionProvider = MoneyJurisdictionContext.Provider;
