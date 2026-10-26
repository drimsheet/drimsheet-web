import { AppSection } from '@/shared/components/app-section';
import { Badge } from '@/shared/components/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/empty';
import { Separator } from '@/shared/components/separator';
import { Skeleton } from '@/shared/components/skeleton';
import { AccountingEntityAvatar } from '@/user/components/accounting-entity-avatar';
import { Building2 } from 'lucide-react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProfileEntitiesProps } from '../types';

export function ProfileEntities({
  entities,
  activeEntityId,
  userId,
}: Readonly<ProfileEntitiesProps>) {
  const { t, i18n } = useTranslation('user');

  const regionNames = new Intl.DisplayNames([i18n.language], {
    type: 'region',
  });

  const typeLabels = {
    individual: t('individual_entity_type'),
    sole_trader: t('sole_trader_entity_type'),
    private_company: t('private_company_entity_type'),
  };

  const entities_title = t('profile_entities_title');
  const entities_description = t('profile_entities_description');
  const current_label = t('profile_current_entity_label');
  const owner_label = t('profile_owner_label');
  const jurisdiction_label = t('profile_jurisdiction_label');
  const currency_label = t('profile_currency_label');
  const empty_title = t('profile_entities_empty_title');
  const empty_description = t('profile_entities_empty_description');

  const count_label = t('profile_entities_count_label', {
    count: entities.length,
  });

  return (
    <AppSection
      title={entities_title}
      role="region"
      titleId="profile-entities-title"
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">{entities_description}</p>
        <Badge variant="secondary">{count_label}</Badge>
      </div>

      <div>
        {entities.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2 aria-hidden />
              </EmptyMedia>
              <EmptyTitle>{empty_title}</EmptyTitle>
              <EmptyDescription>{empty_description}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-5">
            {entities.map((entity, index) => (
              <Fragment key={entity.id}>
                {index > 0 && (
                  <li aria-hidden>
                    <Separator />
                  </li>
                )}
                <li className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,0.4fr)_minmax(8rem,0.4fr)] sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <AccountingEntityAvatar name={entity.name} size="lg" />
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words font-medium">{entity.name}</p>
                        {entity.id === activeEntityId && (
                          <Badge variant="secondary">{current_label}</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{typeLabels[entity.type]}</span>
                        {entity.ownerId === userId && (
                          <Badge variant="outline">{owner_label}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <dl className="grid grid-cols-2 gap-4 sm:contents">
                    <div className="flex flex-col gap-1">
                      <dt className="text-xs text-muted-foreground">
                        {jurisdiction_label}
                      </dt>
                      <dd>{regionNames.of(entity.jurisdictionCode)}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-xs text-muted-foreground">
                        {currency_label}
                      </dt>
                      <dd className="font-medium tabular-nums">
                        {entity.functionalCurrencyCode}
                      </dd>
                    </div>
                  </dl>
                </li>
              </Fragment>
            ))}
          </ul>
        )}
      </div>
    </AppSection>
  );
}

export function ProfileEntitiesSkeleton() {
  const { t } = useTranslation('user');
  const loading_label = t('profile_entities_title');

  const profile_section_loading_text = t('profile_section_loading_text', {
    section: loading_label,
  });

  return (
    <AppSection
      aria-busy="true"
      title={loading_label}
      className="h-full min-w-0"
    >
      <output
        className="sr-only"
        aria-label={profile_section_loading_text}
        aria-busy="true"
      >
        {profile_section_loading_text}
      </output>
      <Skeleton className="h-5 w-full max-w-96" />
      <div className="flex flex-col gap-5">
        {[0, 1].map((row) => (
          <Fragment key={row}>
            {row > 0 && <Separator />}
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,0.4fr)_minmax(8rem,0.4fr)] sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Skeleton className="h-6 w-full max-w-40" />
                  <Skeleton className="h-4 w-32 max-w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:contents">
                {[0, 1].map((field) => (
                  <div key={field} className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                ))}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </AppSection>
  );
}
