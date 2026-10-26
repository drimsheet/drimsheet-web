import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { TriangleAlert } from 'lucide-react';
import type { AccountsTableErrorProps } from '../types';

export function AccountsTableError({
  title,
  description,
}: Readonly<AccountsTableErrorProps>) {
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <Alert variant="destructive">
        <TriangleAlert aria-hidden />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
}
