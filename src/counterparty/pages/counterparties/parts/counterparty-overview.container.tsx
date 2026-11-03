import { useCounterparties } from '@/counterparty/hooks/use-counterparties';
import { ECounterpartyRole } from '@/shared/lib/api/Api';
import {
  CounterpartyOverview,
  CounterpartyOverviewError,
  CounterpartyOverviewSkeleton,
} from './counterparty-overview';

export function CounterpartyOverviewContainer() {
  // Pagination metadata counts every matching record, independently of the table.
  const employers = useCounterparties({
    page: 1,
    limit: 1,
    roles: [ECounterpartyRole.Employer],
  });

  const vendors = useCounterparties({
    page: 1,
    limit: 1,
    roles: [ECounterpartyRole.Vendor],
  });

  const contractors = useCounterparties({
    page: 1,
    limit: 1,
    roles: [ECounterpartyRole.Contractor],
  });

  if (employers.isError || vendors.isError || contractors.isError) {
    return <CounterpartyOverviewError />;
  }

  if (!employers.data || !vendors.data || !contractors.data) {
    return <CounterpartyOverviewSkeleton />;
  }

  return (
    <CounterpartyOverview
      employers={employers.data.meta.total}
      vendors={vendors.data.meta.total}
      contractors={contractors.data.meta.total}
    />
  );
}
