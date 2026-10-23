import { Badge } from '@/shared/components/badge';
import { FormattedDate } from '@/shared/components/date';
import { PageSection } from '@/shared/components/page-section';
import { PageTitle } from '@/shared/components/page-title';
import { ECounterpartyType } from '@/shared/lib/api/Api';
import { Building2, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import counterpartyDetailsHelpers from './helper';
import { CounterpartyProfileActions } from './parts/profile-actions';
import type { CounterpartyDetailsProps } from './types';

export function CounterpartyDetails({
  counterparty,
  children,
  ...actionProps
}: Readonly<CounterpartyDetailsProps>) {
  const { t } = useTranslation(['counterparty', 'shared']);
  const addresses = counterpartyDetailsHelpers.getAddresses(counterparty);

  const TypeIcon =
    counterparty.type === ECounterpartyType.Organization
      ? Building2
      : UserRound;

  const status_text = t(`shared:${counterparty.status}`);
  const type_text = t(`${counterparty.type}_label`);
  const details_title = t('profile_details_title');
  const relationships_label = t('relationships_label');
  const address_label = t('address_label');
  const missing_address_text = t('missing_address_text');
  const no_roles_text = t('no_roles_text');
  const added_label = t('added_label');
  const updated_label = t('updated_label');

  return (
    <div className="flex min-w-0 flex-col">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <TypeIcon className="size-6" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <PageTitle className="break-words">{counterparty.name}</PageTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{type_text}</span>
              <span aria-hidden="true">·</span>
              <Badge variant="secondary">{status_text}</Badge>
            </div>
          </div>
        </div>
        <CounterpartyProfileActions {...actionProps} />
      </header>
      <PageSection title={details_title}>
        <dl className="grid gap-x-12 gap-y-6 text-sm sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
            <dt className="text-muted-foreground">{relationships_label}</dt>
            <dd className="flex flex-wrap gap-2">
              {counterparty.roles.length ? (
                counterparty.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {t(`${role}_label`)}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">{no_roles_text}</span>
              )}
            </dd>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <dt className="text-muted-foreground">{address_label}</dt>
            <dd className="flex flex-col gap-3">
              {addresses.length === 0 && (
                <span className="text-muted-foreground">
                  {missing_address_text}
                </span>
              )}
              {addresses.map(({ lines, roles }) => (
                <div key={roles.join(',')} className="flex flex-col gap-1">
                  {addresses.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                      {roles.map((role) => t(`${role}_label`)).join(', ')}
                    </p>
                  )}
                  <address className="break-words not-italic leading-relaxed">
                    {lines.map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </address>
                </div>
              ))}
            </dd>
          </div>
          <div className="flex flex-col gap-2">
            <dt className="text-muted-foreground">{added_label}</dt>
            <dd>
              <FormattedDate value={new Date(counterparty.createdAt)} />
            </dd>
          </div>
          <div className="flex flex-col gap-2">
            <dt className="text-muted-foreground">{updated_label}</dt>
            <dd>
              <FormattedDate value={new Date(counterparty.updatedAt)} />
            </dd>
          </div>
        </dl>
      </PageSection>
      {children}
    </div>
  );
}
