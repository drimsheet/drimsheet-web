import { Alert, AlertDescription } from '@/shared/components/alert';
import { Badge } from '@/shared/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/card';
import { Separator } from '@/shared/components/separator';
import { useTranslation } from 'react-i18next';
import legalEntityHelpers from '../helper';
import type { AccountingContextDetailsProps } from '../types';
import { RecordFields } from './record-fields';

export function AccountingContextDetails({
  context,
}: Readonly<AccountingContextDetailsProps>) {
  const { t, i18n } = useTranslation('accounting');

  const period = context.accountingPeriods.find(
    (item) => item.id === context.currentAccountingPeriodId
  );

  const unavailable_text = t('legal_entity_unavailable_text');

  const current_period_label = t(
    'legal_entity_current_accounting_period_label'
  );

  const fiscal_year_title = t('legal_entity_fiscal_year_title');
  const accounting_period_title = t('legal_entity_accounting_period_title');
  const missing_text = t('legal_entity_current_period_missing_text');

  const status_text = context.closedAt
    ? t('legal_entity_status_closed')
    : t('legal_entity_status_open');

  const fiscal_status_text = t(
    `legal_entity_status_${context.fiscalYear.status}`
  );

  const status_label = t('legal_entity_status_label');

  const fiscalFields = [
    {
      label: t('legal_entity_start_date_label'),
      value: legalEntityHelpers.formatDate(
        context.fiscalYear.startDate,
        i18n.language,
        unavailable_text
      ),
    },
    {
      label: t('legal_entity_end_date_label'),
      value: legalEntityHelpers.formatDate(
        context.fiscalYear.endDate,
        i18n.language,
        unavailable_text
      ),
    },
    {
      label: status_label,
      value: <Badge variant="outline">{fiscal_status_text}</Badge>,
    },
  ];

  const periodFields = [
    {
      label: t('legal_entity_unit_label'),
      value: period ? t(`legal_entity_unit_${period.unit}`) : unavailable_text,
    },
    {
      label: t('legal_entity_current_period_label'),
      value: period?.name ?? unavailable_text,
    },
    {
      label: t('legal_entity_start_date_label'),
      value: legalEntityHelpers.formatDate(
        period?.startDate,
        i18n.language,
        unavailable_text
      ),
    },
    {
      label: t('legal_entity_end_date_label'),
      value: legalEntityHelpers.formatDate(
        period?.endDate,
        i18n.language,
        unavailable_text
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={3} className="break-words">
          {context.name}
        </CardTitle>
        <CardDescription>
          {context.accountingStandardCode} · {context.fiscalYear.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <dl className="flex flex-wrap items-start justify-between gap-4 rounded-lg bg-muted p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <dt className="text-xs text-muted-foreground">
              {current_period_label}
            </dt>
            <dd className="break-words text-lg font-semibold tracking-tight">
              {period?.name ?? unavailable_text}
            </dd>
          </div>
          <div className="flex flex-col items-end gap-2">
            <dt className="text-xs text-muted-foreground">{status_label}</dt>
            <dd>
              <Badge variant="secondary">{status_text}</Badge>
            </dd>
          </div>
        </dl>
        {!period && (
          <Alert>
            <AlertDescription>{missing_text}</AlertDescription>
          </Alert>
        )}
        <section
          className="flex flex-col gap-4"
          aria-labelledby={`fiscal-year-${context.id}`}
        >
          <h4
            id={`fiscal-year-${context.id}`}
            className="text-sm font-semibold"
          >
            {fiscal_year_title}
          </h4>
          <RecordFields fields={fiscalFields} />
        </section>
        <Separator />
        <section
          className="flex flex-col gap-4"
          aria-labelledby={`accounting-period-${context.id}`}
        >
          <h4
            id={`accounting-period-${context.id}`}
            className="text-sm font-semibold"
          >
            {accounting_period_title}
          </h4>
          <RecordFields fields={periodFields} />
        </section>
      </CardContent>
    </Card>
  );
}
