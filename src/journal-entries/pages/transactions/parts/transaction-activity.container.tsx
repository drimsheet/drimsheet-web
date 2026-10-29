import { accountingService } from '@/accounting/lib/services/accounting.service';
import { ledgerReportingService } from '@/reporting/lib/services/ledger-reporting.service';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth } from 'date-fns';
import { useState } from 'react';
import transactionsHelpers from '../helper';
import { TransactionActivity } from './transaction-activity';

export function TransactionActivityContainer() {
  const today = new Date();
  const [date, setDate] = useState(() => startOfMonth(today));
  const entityId = accountingService.getAccountingEntityId();
  const query = transactionsHelpers.activityQuery(date, today);

  const activity = useQuery({
    queryKey: [
      'ledgerReportingService',
      'getAccountActivityByTypes',
      query,
      entityId,
    ],
    queryFn: ({ signal }) =>
      ledgerReportingService.getAccountActivityByTypes(query, signal),
    throwOnError: false,
  });

  return (
    <TransactionActivity
      date={date}
      today={today}
      onDateChange={setDate}
      state={activity.status === 'pending' ? 'loading' : activity.status}
      days={activity.data && transactionsHelpers.activityDays(activity.data)}
      currencyCode={activity.data?.currencyCode}
    />
  );
}
