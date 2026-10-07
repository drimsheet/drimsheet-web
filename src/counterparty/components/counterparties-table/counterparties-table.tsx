import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useGetCounterpartyRoleLabel } from '@/counterparty/hooks/use-get-counterparty-role-label';
import { useGetCounterpartyTypeLabel } from '@/counterparty/hooks/use-get-counterparty-type-label';
import { counterpartyMapper } from '@/counterparty/lib/mappers/counterparty.mapper';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { DataTable, type ITableColumn } from '@/shared/components/data-table';
import { FormattedDate } from '@/shared/components/date';
import { SearchField } from '@/shared/components/search-field';
import { StatusBadge } from '@/shared/components/status-badge';
import { TablePagination } from '@/shared/components/table-pagination';
import {
  ECounterpartyRole,
  ECounterpartyStatus,
  ECounterpartyType,
  type ICounterpartyDto,
  type UCounterpartyStatus,
  type UCounterpartyType,
} from '@/shared/lib/api/Api';
import { cn } from '@/shared/lib/utils/cn';
import { CounterpartyRowActions } from './parts/counterparty-row-actions';
import type { CounterpartiesTableProps } from './types';

export function CounterpartiesTable({
  data,
  archiving = false,
  getCounterpartyHref,
  loading = false,
  selectable = false,
  selectedRowIds,
  onRowSelectionChange,
  pagination,
  onPageChange,
  stickyHeader = false,
  onSortChange,
  onFilterChange,
  currentSortKey,
  currentSortDirection,
  className,
  'data-testid': dataTestId = 'counterparties-table',
  searchValue = '',
  onSearchChange,
  filters,
  onAddCounterparty,
  onArchiveCounterparty,
  onEditCounterparty,
}: Readonly<CounterpartiesTableProps>) {
  const { t } = useTranslation(['counterparty', 'shared']);
  const getCounterpartyTypeLabel = useGetCounterpartyTypeLabel();
  const getCounterpartyRoleLabel = useGetCounterpartyRoleLabel();

  const columns = useMemo<ITableColumn<ICounterpartyDto>[]>(() => {
    const counterparty_name_label = t('counterparty:name_label');
    const status_text = t('shared:status');
    const active_label = t('shared:active');
    const archived_label = t('shared:archived');
    const type_label = t('counterparty:type_label');
    const roles_label = t('counterparty:roles_label');
    const created_on_label = t('shared:created_on');

    const individual_label = t('counterparty:individual_label');
    const organization_label = t('counterparty:organization_label');
    const employer_label = t('counterparty:employer_label');
    const contractor_label = t('counterparty:contractor_label');
    const vendor_label = t('counterparty:vendor_label');

    return [
      {
        dataIndex: 'name',
        title: counterparty_name_label,
        sortable: true,
        render: (value, row) =>
          getCounterpartyHref ? (
            <Link
              className="underline-offset-4 hover:underline focus-visible:underline"
              to={getCounterpartyHref(row.id)}
            >
              {String(value)}
            </Link>
          ) : (
            <span>{String(value)}</span>
          ),
      },
      {
        dataIndex: 'status',
        title: status_text,
        sortable: true,
        filterable: true,
        filterOptions: [
          { label: active_label, value: ECounterpartyStatus.Active },
          { label: archived_label, value: ECounterpartyStatus.Archived },
        ],
        render: (value) => {
          const statusVal = value as UCounterpartyStatus;

          return (
            <StatusBadge
              {...counterpartyMapper.mapStatusToBadgeProps(statusVal)}
            />
          );
        },
      },
      {
        dataIndex: 'type',
        title: type_label,
        sortable: true,
        filterable: true,
        filterOptions: [
          { label: individual_label, value: ECounterpartyType.Individual },
          { label: organization_label, value: ECounterpartyType.Organization },
        ],
        render: (value) => {
          const typeVal = value as UCounterpartyType;

          return <span>{getCounterpartyTypeLabel(typeVal)}</span>;
        },
      },
      {
        dataIndex: 'roles',
        title: roles_label,
        sortable: false,
        filterable: true,
        filterOptions: [
          { label: employer_label, value: ECounterpartyRole.Employer },
          { label: contractor_label, value: ECounterpartyRole.Contractor },
          { label: vendor_label, value: ECounterpartyRole.Vendor },
        ],
        render: (_, row) => {
          if (!row.roles || row.roles.length === 0) {
            return <span className="text-muted-foreground text-xs">—</span>;
          }

          return (
            <div className="flex flex-wrap gap-1">
              {row.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {getCounterpartyRoleLabel(role)}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        dataIndex: 'createdAt',
        title: created_on_label,
        sortable: true,
        render: (value) => {
          if (!value) return '';

          const date = new Date(String(value));

          return (
            <span className="text-xs text-muted-foreground font-medium">
              <FormattedDate value={date} />
            </span>
          );
        },
      },
      {
        dataIndex: 'id',
        title: '',
        sortable: false,
        render: (_, row) => (
          <CounterpartyRowActions
            archiving={archiving}
            counterparty={row}
            onArchive={onArchiveCounterparty}
            onEdit={onEditCounterparty}
          />
        ),
      },
    ];
  }, [
    t,
    getCounterpartyTypeLabel,
    getCounterpartyRoleLabel,
    getCounterpartyHref,
    archiving,
    onArchiveCounterparty,
    onEditCounterparty,
  ]);

  const search_placeholder_text = t('counterparty:search_placeholder');
  const add_counterparty_text = t('counterparty:add_counterparty');

  return (
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      <div className="flex items-center justify-between">
        <div className="w-full max-w-sm">
          <SearchField
            type="search"
            placeholder={search_placeholder_text}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Button onClick={onAddCounterparty}>
          <Plus />
          {add_counterparty_text}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        selectable={selectable}
        selectedRowIds={selectedRowIds}
        onRowSelectionChange={onRowSelectionChange}
        stickyHeader={stickyHeader}
        onSortChange={onSortChange}
        onFilterChange={onFilterChange}
        currentSortKey={currentSortKey}
        currentSortDirection={currentSortDirection}
        className={className}
        data-testid={dataTestId}
        filters={filters}
      />
      {pagination && onPageChange && (
        <TablePagination
          meta={pagination}
          onPageChange={onPageChange}
          className="mx-0 w-auto justify-end"
        />
      )}
    </div>
  );
}
