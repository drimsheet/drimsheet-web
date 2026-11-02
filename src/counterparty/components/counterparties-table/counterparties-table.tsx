import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useGetCounterpartyRoleLabel } from '@/counterparty/hooks/use-get-counterparty-role-label';
import { useGetCounterpartyTypeLabel } from '@/counterparty/hooks/use-get-counterparty-type-label';
import { counterpartyMapper } from '@/counterparty/lib/mappers/counterparty.mapper';
import { Badge } from '@/shared/components/badge';
import { DataTable, type ITableColumn } from '@/shared/components/data-table';
import { FormattedDate } from '@/shared/components/date';
import { StatusBadge } from '@/shared/components/status-badge';
import {
  ECounterpartyRole,
  ECounterpartyStatus,
  ECounterpartyType,
  type ICounterpartyDto,
  type UCounterpartyStatus,
  type UCounterpartyType,
} from '@/shared/lib/api/Api';
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
  filters,
  onArchiveCounterparty,
  onCheckCounterpartyDeleteEligibility,
  onDeleteCounterparty,
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
        proportion: 2,
        minWidth: 210,
        title: counterparty_name_label,
        sortable: true,
        render: (value, row) =>
          getCounterpartyHref ? (
            <Link
              className="text-link underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-ring"
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
        proportion: 1,
        minWidth: 104,
        title: status_text,
        sortable: false,
        filterable: true,
        filterMultiple: false,
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
        proportion: 1.2,
        minWidth: 128,
        title: type_label,
        sortable: false,
        filterable: true,
        filterMultiple: false,
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
        proportion: 1.5,
        minWidth: 156,
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
                <Badge key={role} variant="neutral">
                  {getCounterpartyRoleLabel(role)}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        dataIndex: 'createdAt',
        proportion: 1.1,
        minWidth: 116,
        title: created_on_label,
        sortable: true,
        render: (value) => {
          if (!value) {
            return '';
          }

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
        width: 64,
        title: '',
        sortable: false,
        render: (_, row) => (
          <CounterpartyRowActions
            archiving={archiving}
            counterparty={row}
            onArchive={onArchiveCounterparty}
            onCheckDeleteEligibility={onCheckCounterpartyDeleteEligibility}
            onDelete={onDeleteCounterparty}
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
    onCheckCounterpartyDeleteEligibility,
    onDeleteCounterparty,
    onEditCounterparty,
  ]);

  return (
    <DataTable
      columns={columns}
      pagination={
        pagination && onPageChange
          ? {
              meta: pagination,
              onPageChange,
            }
          : undefined
      }
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
  );
}
