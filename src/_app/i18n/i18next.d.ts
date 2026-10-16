import navigationEn from '@/_app/i18n/locales/en/navigation.json';
import ledgerAccountsEn from '@/account/i18n/locales/en/ledger-accounts.json';
import accountingEn from '@/accounting/i18n/locales/en/accounting.json';
import authEn from '@/auth/i18n/locales/en/auth.json';
import counterpartyEn from '@/counterparty/i18n/locales/en/counterparty.json';
import journalEntriesEn from '@/journal-entries/i18n/locales/en/journal-entries.json';
import apiErrorsEn from '@/shared/i18n/locales/en/api-errors.json';
import sharedEn from '@/shared/i18n/locales/en/shared.json';
import userEn from '@/user/i18n/locales/en/user.json';
import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'shared';
    resources: {
      navigation: typeof navigationEn;
      auth: typeof authEn;
      shared: typeof sharedEn;
      counterparty: typeof counterpartyEn;
      'journal-entries': typeof journalEntriesEn;
      'ledger-accounts': typeof ledgerAccountsEn;
      accounting: typeof accountingEn;
      'api-errors': typeof apiErrorsEn;
      user: typeof userEn;
    };
  }
}
