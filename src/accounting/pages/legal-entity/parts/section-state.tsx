import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/empty';
import { Skeleton } from '@/shared/components/skeleton';
import { CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SectionStateProps } from '../types';

export function SectionState({
  label,
  state,
  onRetry,
}: Readonly<SectionStateProps>) {
  const { t } = useTranslation('accounting');
  const loading_text = t('legal_entity_loading_text', { section: label });
  const error_text = t('legal_entity_error_text', { section: label });
  const retry_label = t('legal_entity_retry_label');
  const empty_title = t('legal_entity_empty_title');
  const empty_description = t('legal_entity_empty_description');

  if (state === 'loading') {
    return (
      <div
        role="status"
        aria-label={loading_text}
        className="flex min-h-72 flex-col gap-6 rounded-xl p-6"
      >
        <span className="sr-only">{loading_text}</span>
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-6">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarDays aria-hidden />
          </EmptyMedia>
          <EmptyTitle>{empty_title}</EmptyTitle>
          <EmptyDescription>{empty_description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTitle>{label}</AlertTitle>
      <AlertDescription>
        {error_text}
        <Button variant="outline" onClick={onRetry}>
          {retry_label}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
