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
import type { ReportingContextDetailsProps } from '../types';
import { RecordFields } from './record-fields';

export function ReportingContextDetails({
  context,
}: Readonly<ReportingContextDetailsProps>) {
  const { t, i18n } = useTranslation('accounting');

  const period = context.reportingPeriods.find(
    (item) => item.id === context.currentReportingPeriodId
  );

  const unavailable_text = t('legal_entity_unavailable_text');
  const current_period_label = t('legal_entity_current_reporting_period_label');
  const reporting_period_title = t('legal_entity_reporting_period_title');
  const missing_text = t('legal_entity_current_period_missing_text');

  const status_text = context.closedAt
    ? t('legal_entity_status_closed')
    : t('legal_entity_status_open');

  const status_label = t('legal_entity_status_label');

  const currencyFields = [
    {
      label: t('legal_entity_reporting_currency_label'),
      value: context.reportingCurrencyCode,
    },
  ];

  const periodFields = [
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
    {
      label: t('legal_entity_unit_label'),
      value: period ? t(`legal_entity_unit_${period.unit}`) : unavailable_text,
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
        <RecordFields fields={currencyFields} />
        <Separator />
        <section
          className="flex flex-col gap-4"
          aria-labelledby={`reporting-period-${context.id}`}
        >
          <h4
            id={`reporting-period-${context.id}`}
            className="text-sm font-semibold"
          >
            {reporting_period_title}
          </h4>
          <RecordFields fields={periodFields} />
        </section>
      </CardContent>
    </Card>
  );
}
