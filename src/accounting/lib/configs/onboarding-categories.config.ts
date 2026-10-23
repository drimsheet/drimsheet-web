export const onboardingCategoriesConfig = Object.freeze({
  services: { type: 'revenue', behavior: 'services' },
  employment: { type: 'revenue', behavior: 'employment_income' },
  grants: { type: 'revenue', behavior: 'grants' },
  gifts: { type: 'revenue', behavior: 'gifts' },
  direct_costs: { type: 'expense', behavior: 'default_direct_cost' },
  rent_utilities: { type: 'expense', behavior: 'rent_and_utilities' },
  bank_charges: { type: 'expense', behavior: 'bank_charge' },
  interest: { type: 'expense', behavior: 'interest' },
} as const);
