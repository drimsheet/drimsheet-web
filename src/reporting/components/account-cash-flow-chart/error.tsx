import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import type { AccountCashFlowChartErrorProps } from './types';

export function AccountCashFlowChartError({
  title,
  description,
}: Readonly<AccountCashFlowChartErrorProps>) {
  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
