import { counterpartyService } from '@/counterparty/lib/services/counterparty.service';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface ICounterpartyQueryOptions {
  throwOnError?: boolean;
  scope?: 'update';
}

export const counterpartyQueryKey = (id: string | undefined) =>
  ['counterpartyService', 'getCounterparty', id] as const;

export function useCounterparty(
  id: string | undefined,
  options: ICounterpartyQueryOptions = {}
) {
  const client = useQueryClient();

  return useQuery({
    queryKey: [
      ...counterpartyQueryKey(id),
      ...(options.scope ? [options.scope] : []),
    ],
    queryFn: () => counterpartyService.getCounterparty(id!),
    enabled: Boolean(id),
    throwOnError: options.throwOnError ?? true,
    ...(options.scope
      ? {
          retry: false,
          refetchOnMount: 'always' as const,
          refetchOnWindowFocus: false,
          placeholderData: () =>
            client.getQueryData<ICounterpartyDto>(counterpartyQueryKey(id)),
        }
      : {}),
  });
}
