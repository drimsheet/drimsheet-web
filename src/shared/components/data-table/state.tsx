import { Skeleton } from '@/shared/components/skeleton';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/table';
import { DataTableRowSkeleton } from './parts/data-row';
import type { DataTableSkeletonProps } from './types';

export function DataTableSkeleton({
  columnsCount,
  showSelection = false,
  rowsCount = 5,
}: Readonly<DataTableSkeletonProps>) {
  return (
    <div
      className="min-w-0 w-full space-y-2 bg-background text-foreground font-sans"
      aria-busy="true"
    >
      <div className="overflow-hidden rounded-md border border-border">
        <Table
          className="w-full table-fixed border-collapse"
          style={{ minWidth: columnsCount * 120 + Number(showSelection) * 48 }}
        >
          <colgroup>
            {showSelection && <col style={{ width: 48 }} />}
            {Array.from({ length: columnsCount }, (_, column) => (
              <col key={column} />
            ))}
          </colgroup>
          <TableHeader className="bg-muted">
            <TableRow className="border-border hover:bg-transparent">
              {showSelection && (
                <TableHead className="h-[42px] px-4">
                  <Skeleton className="size-4" />
                </TableHead>
              )}
              {Array.from({ length: columnsCount }, (_, column) => (
                <TableHead key={column} className="h-[42px] px-4">
                  <Skeleton className="h-3 w-2/3" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowsCount }, (_, row) => (
              <DataTableRowSkeleton
                key={row}
                columnsCount={columnsCount}
                showSelection={showSelection}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
