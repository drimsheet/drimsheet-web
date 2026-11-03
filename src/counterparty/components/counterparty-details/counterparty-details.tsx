import { Badge } from '@/shared/components/badge';
import { useTranslation } from 'react-i18next';
import counterpartyDetailsHelpers from './helper';
import type { CounterpartyDetailsProps } from './types';

export function CounterpartyDetails({
  counterparty,
}: Readonly<CounterpartyDetailsProps>) {
  const { t } = useTranslation(['counterparty', 'shared']);
  const addresses = counterpartyDetailsHelpers.getAddresses(counterparty);

  const relationships_label = t('relationships_label');
  const address_label = t('address_label');
  const missing_address_text = t('missing_address_text');
  const no_roles_text = t('no_roles_text');

  return (
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
    </dl>
  );
}
