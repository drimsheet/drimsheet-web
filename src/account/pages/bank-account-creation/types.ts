import type { UAccountCreationRedirectAlias } from '@/account/lib/types/account-creation-redirect.types';

export interface IBankAccountCreationPageSearchParams {
  redirect?: string;
  redirectAccountAlias?: UAccountCreationRedirectAlias;
}
