import { useTableQueryParams } from '@/shared/hooks/use-table-query-params';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

describe('useTableQueryParams', () => {
  const wrapperWithParams = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter
      initialEntries={[
        '/accounts?q=test&page=2&sort=name&order=desc&status=active,archived',
      ]}
    >
      {children}
    </MemoryRouter>
  );

  const wrapperDefault = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={['/accounts']}>{children}</MemoryRouter>
  );

  it('should parse initial values from search parameters', () => {
    const { result } = renderHook(
      () =>
        useTableQueryParams({
          filterKeys: ['status'],
        }),
      { wrapper: wrapperWithParams }
    );

    expect(result.current.searchQuery).toBe('test');
    expect(result.current.page).toBe(2);
    expect(result.current.sortKey).toBe('name');
    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.filters).toEqual({ status: ['active', 'archived'] });
  });

  it('should return default values when search parameters are not present', () => {
    const { result } = renderHook(
      () =>
        useTableQueryParams({
          defaultSortKey: 'createdAt',
          defaultSortDirection: 'asc',
          filterKeys: ['status'],
        }),
      { wrapper: wrapperDefault }
    );

    expect(result.current.searchQuery).toBe('');
    expect(result.current.page).toBe(1);
    expect(result.current.sortKey).toBe('createdAt');
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.filters).toEqual({});
  });

  it('should update search query and reset page on handleSearchChange', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={['/accounts?page=3']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(
      () => {
        const qParams = useTableQueryParams();
        const loc = useLocation();

        return { qParams, loc };
      },
      { wrapper }
    );

    act(() => {
      result.current.qParams.handleSearchChange('hello');
    });

    const searchParams = new URLSearchParams(result.current.loc.search);
    expect(searchParams.get('q')).toBe('hello');
    expect(searchParams.get('page')).toBe('1');
  });

  it('should remove search query from URL when handleSearchChange is empty', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={['/accounts?q=test']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(
      () => {
        const qParams = useTableQueryParams();
        const loc = useLocation();

        return { qParams, loc };
      },
      { wrapper }
    );

    act(() => {
      result.current.qParams.handleSearchChange('');
    });

    const searchParams = new URLSearchParams(result.current.loc.search);
    expect(searchParams.has('q')).toBe(false);
    expect(searchParams.get('page')).toBe('1');
  });

  it('should update page on handlePageChange', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={['/accounts']}>{children}</MemoryRouter>
    );

    const { result } = renderHook(
      () => {
        const qParams = useTableQueryParams();
        const loc = useLocation();

        return { qParams, loc };
      },
      { wrapper }
    );

    act(() => {
      result.current.qParams.handlePageChange(5);
    });

    const searchParams1 = new URLSearchParams(result.current.loc.search);
    expect(searchParams1.get('page')).toBe('5');

    act(() => {
      result.current.qParams.handlePageChange(1); // Page 1 is default, omitted from URL
    });

    const searchParams2 = new URLSearchParams(result.current.loc.search);
    expect(searchParams2.has('page')).toBe(false);
  });

  it('should update sort and reset page on handleSortChange', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={['/accounts?page=2']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(
      () => {
        const qParams = useTableQueryParams();
        const loc = useLocation();

        return { qParams, loc };
      },
      { wrapper }
    );

    act(() => {
      result.current.qParams.handleSortChange('balance', 'asc');
    });

    const searchParams1 = new URLSearchParams(result.current.loc.search);
    expect(searchParams1.get('sort')).toBe('balance');
    expect(searchParams1.get('order')).toBe('asc');
    expect(searchParams1.get('page')).toBe('1');

    act(() => {
      result.current.qParams.handleSortChange('balance', null);
    });

    const searchParams2 = new URLSearchParams(result.current.loc.search);
    expect(searchParams2.has('sort')).toBe(false);
    expect(searchParams2.has('order')).toBe(false);
    expect(searchParams2.get('page')).toBe('1');
  });

  it('should update filters and reset page on handleFilterChange', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={['/accounts?page=4']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(
      () => {
        const qParams = useTableQueryParams({ filterKeys: ['status', 'type'] });
        const loc = useLocation();

        return { qParams, loc };
      },
      { wrapper }
    );

    act(() => {
      result.current.qParams.handleFilterChange({
        status: ['active'],
        type: ['cash', 'bank'],
      });
    });

    const searchParams1 = new URLSearchParams(result.current.loc.search);
    expect(searchParams1.get('status')).toBe('active');
    expect(searchParams1.get('type')).toBe('cash,bank');
    expect(searchParams1.get('page')).toBe('1');

    act(() => {
      result.current.qParams.handleFilterChange({ status: [] });
    });

    const searchParams2 = new URLSearchParams(result.current.loc.search);
    expect(searchParams2.has('status')).toBe(false);
    expect(searchParams2.get('page')).toBe('1');
  });

  it('preserves search when sorting before the URL update renders', () => {
    const { result } = renderHook(
      () => ({ tableQuery: useTableQueryParams(), location: useLocation() }),
      { wrapper: wrapperDefault }
    );

    act(() => {
      result.current.tableQuery.handleSearchChange('gift');
      result.current.tableQuery.handleSortChange('effectiveDate', 'asc');
    });

    const params = new URLSearchParams(result.current.location.search);
    expect(params.get('q')).toBe('gift');
    expect(params.get('sort')).toBe('effectiveDate');
    expect(params.get('order')).toBe('asc');
    expect(params.get('page')).toBe('1');
  });

  it('uses the new URL after navigation instead of restoring pending search parameters', () => {
    const { result } = renderHook(
      () => ({
        tableQuery: useTableQueryParams(),
        location: useLocation(),
        navigate: useNavigate(),
      }),
      { wrapper: wrapperDefault }
    );

    act(() => result.current.tableQuery.handleSearchChange('gift'));
    act(() => result.current.navigate('/accounts?q=rent&status=active'));
    act(() => result.current.tableQuery.handleSortChange('name', 'asc'));

    const params = new URLSearchParams(result.current.location.search);
    expect(params.get('q')).toBe('rent');
    expect(params.get('status')).toBe('active');
    expect(params.get('sort')).toBe('name');
  });
});
