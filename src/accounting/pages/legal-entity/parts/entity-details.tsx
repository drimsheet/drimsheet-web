import { Badge } from '@/shared/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/card';
import { Separator } from '@/shared/components/separator';
import { useTranslation } from 'react-i18next';
import type { EntityDetailsProps } from '../types';
import { RecordFields } from './record-fields';

export function EntityDetails({ entity }: Readonly<EntityDetailsProps>) {
  const { t, i18n } = useTranslation('accounting');

  const regionNames = new Intl.DisplayNames([i18n.language], {
    type: 'region',
  });

  const details_title = t('legal_entity_details_title');
  const name_label = t('legal_entity_name_label');
  const status_text = t(`legal_entity_status_${entity.status}`);

  const fields = [
    {
      label: t('legal_entity_type_label'),
      value: t(`legal_entity_type_${entity.type}`),
    },
    {
      label: t('legal_entity_currency_label'),
      value: entity.functionalCurrencyCode,
    },
    {
      label: t('legal_entity_jurisdiction_label'),
      value: regionNames.of(entity.jurisdictionCode),
    },
    {
      label: t('legal_entity_status_label'),
      value: <Badge variant="secondary">{status_text}</Badge>,
    },
  ];

  return (
    <Card role="region" aria-labelledby="entity-details-title">
      <CardHeader>
        <CardTitle role="heading" aria-level={2} id="entity-details-title">
          {details_title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <dl className="flex flex-col gap-1.5">
          <dt className="text-xs text-muted-foreground">{name_label}</dt>
          <dd className="break-words text-2xl font-semibold tracking-tight">
            {entity.name}
          </dd>
        </dl>
        <Separator />
        <RecordFields fields={fields} className="sm:grid-cols-4" />
      </CardContent>
    </Card>
  );
}
