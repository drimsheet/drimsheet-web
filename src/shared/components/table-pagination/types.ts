import type { IPaginationResponseMeta } from '@/shared/lib/api/Api';
export interface TablePaginationProps {
  /** Total and totalPages describe the filtered result, not the current page. */
  meta: IPaginationResponseMeta;
  onPageChange: (page: number) => void;
  unfilteredTotal?: number;
  disabled?: boolean;
  className?: string;
}
