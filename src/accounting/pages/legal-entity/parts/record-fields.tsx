import { cn } from '@/shared/lib/utils/cn';
import type { RecordFieldsProps } from '../types';

export function RecordFields({
  fields,
  className,
}: Readonly<RecordFieldsProps>) {
  return (
    <dl className={cn('grid grid-cols-2 gap-x-6 gap-y-5', className)}>
      {fields.map(({ label, value }) => (
        <div key={label} className="flex min-w-0 flex-col gap-1.5">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="break-words font-medium tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
