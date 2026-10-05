import { useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface UseTableQueryParamsOptions<
  TFilterKeys extends string = string,
> {
  defaultSortKey?: string;
  defaultSortDirection?: 'asc' | 'desc';
  filterKeys?: TFilterKeys[];
}

export function useTableQueryParams<
  TSortKey extends string = string,
  TFilterKeys extends string = string,
>(options: UseTableQueryParamsOptions<TFilterKeys> = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const pendingSearchParams = useRef({
    source: searchParams,
    value: searchParams,
  });

  const updateSearchParams = useCallback(
    (update: (params: URLSearchParams) => void) => {
      const pending = pendingSearchParams.current;

      // Compose rapid edits until the router supplies a new URL snapshot.
      const next = new URLSearchParams(
        pending.source === searchParams ? pending.value : searchParams
      );

      update(next);
      pendingSearchParams.current = { source: searchParams, value: next };
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const searchQuery = searchParams.get('q') || '';
  const page = Number(searchParams.get('page')) || 1;

  const sortKey = (searchParams.get('sort') || options.defaultSortKey) as
    | TSortKey
    | undefined;

  const sortDirection =
    (searchParams.get('order') as 'asc' | 'desc' | null) ||
    options.defaultSortDirection ||
    null;

  const filters = useMemo(() => {
    const result: Record<string, (string | number)[]> = {};
    if (options.filterKeys) {
      for (const key of options.filterKeys) {
        const val = searchParams.get(key);
        if (val) {
          result[key] = val.split(',');
        }
      }
    }

    return result;
  }, [searchParams, options.filterKeys]);

  const handleSearchChange = useCallback(
    (value: string) => {
      updateSearchParams((next) => {
        if (value) {
          next.set('q', value);
        } else {
          next.delete('q');
        }

        next.set('page', '1');
      });
    },
    [updateSearchParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateSearchParams((next) => {
        if (newPage > 1) {
          next.set('page', String(newPage));
        } else {
          next.delete('page');
        }
      });
    },
    [updateSearchParams]
  );

  const handleSortChange = useCallback(
    (key: string, direction: 'asc' | 'desc' | null) => {
      updateSearchParams((next) => {
        if (key && direction) {
          next.set('sort', key);
          next.set('order', direction);
        } else {
          next.delete('sort');
          next.delete('order');
        }

        next.set('page', '1');
      });
    },
    [updateSearchParams]
  );

  const handleFilterChange = useCallback(
    (newFilters: Record<string, (string | number)[]>) => {
      updateSearchParams((next) => {
        if (options.filterKeys) {
          for (const key of options.filterKeys) {
            const val = newFilters[key];
            if (val && val.length > 0) {
              next.set(key, val.join(','));
            } else {
              next.delete(key);
            }
          }
        }

        next.set('page', '1');
      });
    },
    [options.filterKeys, updateSearchParams]
  );

  return {
    searchQuery,
    page,
    sortKey,
    sortDirection,
    filters,
    handleSearchChange,
    handlePageChange,
    handleSortChange,
    handleFilterChange,
  };
}
