import { Skeleton } from '@/shared/components/skeleton';
import { TableCell, TableRow } from '@/shared/components/table';
import type { DataTableSkeletonProps } from './types';

export function DataTableSkeleton({
  columnsCount,
  showSelection = false,
  rowsCount = 5,
}: Readonly<DataTableSkeletonProps>) {
  return (
    <>
      {Array.from({ length: rowsCount }, (_, row) => (
        <TableRow key={row} className="hover:bg-transparent">
          {showSelection && (
            <TableCell className="px-4">
              <Skeleton className="size-4" />
            </TableCell>
          )}
          {Array.from({ length: columnsCount }, (_, column) => (
            <TableCell
              key={column}
              className="h-(--table-row-height,60px) px-4 py-2.5"
            >
              <Skeleton className="h-4 w-3/4" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
