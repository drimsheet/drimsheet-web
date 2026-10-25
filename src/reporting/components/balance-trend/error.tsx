import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { TriangleAlert } from 'lucide-react';
import type { BalanceTrendErrorProps } from './types';
export function BalanceTrendError({
  title,
  description,
}: Readonly<BalanceTrendErrorProps>) {
  return (
    <div className="min-h-63 min-w-0">
      <div className="flex w-full flex-col items-start gap-4">
        <Alert variant="destructive">
          <TriangleAlert aria-hidden />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
