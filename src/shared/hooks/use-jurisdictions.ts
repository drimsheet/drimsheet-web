import { jurisdictionService } from '@/shared/lib/services/jurisdiction.service';
import { useQuery } from '@tanstack/react-query';

interface IJurisdictionsQueryOptions {
  enabled?: boolean;
  throwOnError?: boolean;
  scope?: 'dialog';
}

export function useJurisdictions(options: IJurisdictionsQueryOptions = {}) {
  return useQuery({
    // A dialog's local retry/error state must not affect boundary-owned readers.
    queryKey: [
      'jurisdictionService',
      'getJurisdictions',
      ...(options.scope ? [options.scope] : []),
    ],
    queryFn: () => jurisdictionService.getJurisdictions(),
    enabled: options.enabled ?? true,
    throwOnError: options.throwOnError ?? true,
  });
}
