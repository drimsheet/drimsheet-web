import { useGetCounterpartyRoleLabel } from '@/counterparty/hooks/use-get-counterparty-role-label';
import { useGetCounterpartyTypeLabel } from '@/counterparty/hooks/use-get-counterparty-type-label';
import { Badge } from '@/shared/components/badge';
import { Building2, UserRound } from 'lucide-react';
import type { CounterpartyOptionProps } from '../types';

export function CounterpartyOption({
  counterparty,
}: Readonly<CounterpartyOptionProps>) {
  const getTypeLabel = useGetCounterpartyTypeLabel();
  const getRoleLabel = useGetCounterpartyRoleLabel();

  const type_label = counterparty.type
    ? getTypeLabel(counterparty.type)
    : undefined;

  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      {counterparty.type === 'individual' && (
        <UserRound role="img" aria-hidden={false} aria-label={type_label} />
      )}
      {counterparty.type === 'organization' && (
        <Building2 role="img" aria-hidden={false} aria-label={type_label} />
      )}
      <span className="min-w-0 flex-1 truncate" title={counterparty.name}>
        {counterparty.name}
      </span>
      {Boolean(counterparty.roles?.length) && (
        <span className="ml-auto flex max-w-[60%] shrink-0 flex-wrap justify-end gap-1">
          {counterparty.roles?.map((role) => (
            <Badge key={role} variant="neutral">
              {getRoleLabel(role)}
            </Badge>
          ))}
        </span>
      )}
    </span>
  );
}
