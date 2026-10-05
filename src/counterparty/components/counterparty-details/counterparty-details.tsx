import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { FormattedDate } from '@/shared/components/date';
import { ECounterpartyType } from '@/shared/lib/api/Api';
import { Building2, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import counterpartyDetailsHelpers from './helper';
import type { CounterpartyDetailsProps } from './types';

export function CounterpartyDetails({
  counterparty,
  children,
  onEdit,
  editDisabled = false,
}: Readonly<CounterpartyDetailsProps>) {
  const { t } = useTranslation(['counterparty', 'shared']);
  const addresses = counterpartyDetailsHelpers.getAddresses(counterparty);

  const TypeIcon =
    counterparty.type === ECounterpartyType.Organization
      ? Building2
      : UserRound;

  const status_label = t('shared:status');
  const status_text = t(`shared:${counterparty.status}`);
  const type_label = t('type_label');
  const type_text = t(`${counterparty.type}_label`);
  const relationships_label = t('relationships_label');
  const address_label = t('address_label');
  const missing_address_text = t('missing_address_text');
  const no_roles_text = t('no_roles_text');
  const edit_label = t('edit_label');
  const added_label = t('added_label');
  const updated_label = t('updated_label');

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="min-w-0 break-words text-3xl font-semibold">
          {counterparty.name}
        </h1>
        <Button
          variant="outline"
          onClick={onEdit}
          disabled={editDisabled || !onEdit}
        >
          {edit_label}
        </Button>
      </div>
      <dl className="grid gap-8 sm:grid-cols-3">
        <div className="flex flex-col gap-3">
          <dt className="text-muted-foreground">{status_label}</dt>
          <dd>
            <Badge variant="secondary">{status_text}</Badge>
          </dd>
        </div>
        <div className="flex flex-col gap-3">
          <dt className="text-muted-foreground">{type_label}</dt>
          <dd className="flex items-center gap-2">
            <TypeIcon className="size-5" aria-hidden="true" />
            {type_text}
          </dd>
        </div>
        <div className="flex flex-col gap-3">
          <dt className="text-muted-foreground">{relationships_label}</dt>
          <dd className="flex flex-wrap gap-2">
            {counterparty.roles.length
              ? counterparty.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {t(`${role}_label`)}
                  </Badge>
                ))
              : no_roles_text}
          </dd>
        </div>
      </dl>
      <section className="flex flex-col gap-3" aria-label={address_label}>
        <h2 className="text-base text-muted-foreground">{address_label}</h2>
        {addresses.length === 0 && (
          <p className="text-muted-foreground">{missing_address_text}</p>
        )}
        {addresses.map(({ lines, roles }) => (
          <div key={roles.join(',')} className="flex flex-col gap-2">
            {addresses.length > 1 && (
              <h3 className="text-sm text-muted-foreground">
                {roles.map((role) => t(`${role}_label`)).join(', ')}
              </h3>
            )}
            <address className="break-words not-italic leading-relaxed">
              {lines.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </address>
          </div>
        ))}
      </section>
      {children}
      <footer className="flex flex-wrap justify-between gap-4 text-sm text-muted-foreground">
        <span>
          {added_label}{' '}
          <FormattedDate value={new Date(counterparty.createdAt)} />
        </span>
        <span>
          {updated_label}{' '}
          <FormattedDate value={new Date(counterparty.updatedAt)} />
        </span>
      </footer>
    </div>
  );
}
