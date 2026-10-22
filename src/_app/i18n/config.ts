import navigationEn from '@/_app/i18n/locales/en/navigation.json';
import i18nInstance from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import ledgerAccountsEn from '@/account/i18n/locales/en/ledger-accounts.json';
import accountingEn from '@/accounting/i18n/locales/en/accounting.json';
import authEn from '@/auth/i18n/locales/en/auth.json';
import counterpartyEn from '@/counterparty/i18n/locales/en/counterparty.json';
import journalEntriesEn from '@/journal-entries/i18n/locales/en/journal-entries.json';
import onboardingEn from '@/onboarding/i18n/locales/en/onboarding.json';
import apiErrorsEn from '@/shared/i18n/locales/en/api-errors.json';
import sharedEn from '@/shared/i18n/locales/en/shared.json';
import userEn from '@/user/i18n/locales/en/user.json';

const resources = {
  en: {
    navigation: navigationEn,
    auth: authEn,
    shared: sharedEn,
    counterparty: counterpartyEn,
    'journal-entries': journalEntriesEn,
    'ledger-accounts': ledgerAccountsEn,
    accounting: accountingEn,
    onboarding: onboardingEn,
    'api-errors': apiErrorsEn,
    user: userEn,
  },
} as const;

i18nInstance
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'shared',
    interpolation: {
      escapeValue: false, // React already safe from xss
    },
  });

export const i18n = i18nInstance;
