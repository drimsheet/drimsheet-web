import { Button } from '@/shared/components/button';
import { cn } from '@/shared/lib/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TablePaginationProps } from './types';

export function TablePagination({
  meta,
  onPageChange,
  unfilteredTotal,
  disabled = false,
  className,
}: Readonly<TablePaginationProps>) {
  const { t } = useTranslation('shared');
  const totalPages = Math.max(1, meta.totalPages);

  const start = meta.total
    ? Math.min((meta.page - 1) * meta.limit + 1, meta.total)
    : 0;

  const end = Math.min(meta.page * meta.limit, meta.total);

  const range_text = t('table_pagination_range', {
    start,
    end,
    total: meta.total,
  });

  const page_text = t('table_pagination_page', { page: meta.page, totalPages });

  const filtered_text = t('table_pagination_filtered', {
    total: unfilteredTotal,
  });

  const previous_label = t('table_previous_page_label');
  const next_label = t('table_next_page_label');
  const pagination_label = t('table_pagination_label');

  return (
    <nav
      aria-label={pagination_label}
      className={cn(
        'flex flex-wrap items-center justify-end gap-3 px-4 py-3 text-xs text-muted-foreground',
        className
      )}
    >
      <span aria-live="polite" className="tabular-nums">
        {range_text}
        {unfilteredTotal !== undefined && unfilteredTotal > meta.total && (
          <> · {filtered_text}</>
        )}
      </span>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={previous_label}
          disabled={disabled || meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <span className="tabular-nums">{page_text}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={next_label}
          disabled={disabled || meta.page >= totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
