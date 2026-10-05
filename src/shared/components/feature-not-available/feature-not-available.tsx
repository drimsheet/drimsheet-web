import { LockKeyholeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/components/button';

export function FeatureNotAvailable() {
  const { t } = useTranslation('shared');
  const feature_not_available_title = t('feature_not_available_title');

  const feature_not_available_description = t(
    'feature_not_available_description'
  );

  const request_access_action = t('request_access_action');

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div
          aria-hidden="true"
          className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full"
        >
          <LockKeyholeIcon className="size-5" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {feature_not_available_title}
          </h1>
          <p className="text-muted-foreground text-sm leading-6">
            {feature_not_available_description}
          </p>
        </div>

        <Button type="button">{request_access_action}</Button>
      </div>
    </main>
  );
}
