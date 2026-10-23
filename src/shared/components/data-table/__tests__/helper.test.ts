import type { ITableColumn } from '@/shared/components/data-table';
import helpers from '@/shared/components/data-table/helper';
import { describe, expect, it } from 'vitest';
interface IRow {
  id: number;
  name: string;
  amount: number;
}
describe('data table layout', () => {
  it('reserves selection and fixed actions while preserving weighted minimum widths', () => {
    const columns: ITableColumn<IRow>[] = [
      { dataIndex: 'name', proportion: 3, minWidth: 300 },
      { dataIndex: 'amount', proportion: 1, minWidth: 160 },
      { dataIndex: 'id', width: 64 },
    ];

    const layout = helpers.layout(columns, true);
    expect(layout.minWidth).toBe(752);
    expect(layout.widths).toEqual(['calc(75% - 84px)', 'calc(25% - 28px)', 64]);
  });
  it('supports fixed-only columns and an empty column list without invalid sizes', () => {
    expect(
      helpers.layout([{ dataIndex: 'id', width: 40, minWidth: 64 }])
    ).toEqual({ widths: [64], minWidth: 64 });
    expect(helpers.layout([])).toEqual({ widths: [], minWidth: 0 });
    expect(
      helpers.layout([{ dataIndex: 'id', proportion: 0, minWidth: 120 }])
        .minWidth
    ).toBe(120);
  });
});
describe('data table values', () => {
  it('preserves explicit null renderers rather than falling back to raw values', () => {
    const column: ITableColumn<IRow> = {
      dataIndex: 'name',
      title: 'Fallback',
      headerRender: () => null,
      renderHeader: () => 'Legacy',
      render: () => null,
    };

    expect(helpers.header(column)).toBeNull();
    expect(helpers.cell(column, { id: 1, name: 'Raw', amount: 12 })).toBeNull();
  });
  it('clears one filter without mutating the controlled filter object', () => {
    const filters = { name: ['Acme'], amount: [12] };
    expect(helpers.filters(filters, 'name', [])).toEqual({ amount: [12] });
    expect(filters.name).toEqual(['Acme']);
  });
  it('cycles ascending, descending, and unsorted', () => {
    expect([
      helpers.nextSort(null),
      helpers.nextSort('asc'),
      helpers.nextSort('desc'),
    ]).toEqual(['asc', 'desc', null]);
  });
});
