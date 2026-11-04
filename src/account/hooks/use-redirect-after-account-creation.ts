import type { UAccountCreationRedirectAlias } from '@/account/lib/types/account-creation-redirect.types';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function useRedirectAfterAccountCreation(defaultRedirect = '/accounts') {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRedirect = searchParams.get('redirect');
  const requestedAlias = searchParams.get('redirectAccountAlias');

  const hasRedirect =
    requestedRedirect !== null &&
    requestedRedirect.startsWith('/') &&
    !requestedRedirect.startsWith('//');

  const redirect = hasRedirect ? requestedRedirect : defaultRedirect;

  const accountAlias: UAccountCreationRedirectAlias | undefined =
    requestedAlias === 'categoryId' ||
    requestedAlias === 'accountId' ||
    requestedAlias === 'destinationAccountId' ||
    requestedAlias === 'sourceAccountId'
      ? requestedAlias
      : undefined;

  const redirectAfterCreation = (accountId: string) => {
    const destination = new URL(redirect, window.location.origin);

    if (hasRedirect && accountAlias) {
      destination.searchParams.set(accountAlias, accountId);
    }

    return navigate(
      `${destination.pathname}${destination.search}${destination.hash}`,
      {
        replace: true,
      }
    );
  };

  const redirectAfterCancellation = () => navigate(redirect, { replace: true });

  return { hasRedirect, redirectAfterCreation, redirectAfterCancellation };
}
