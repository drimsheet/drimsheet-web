import {
  AccountingEntityForm,
  AccountingEntityFormSkeleton,
} from '@/accounting/components/accounting-entity-form';
import { Alert, AlertDescription } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/collapsible';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { AccountingEntityStepProps } from '../types';
import { StepLayout } from './step-layout';

export function AccountingEntityStep({
  currencies,
  jurisdictions,
  isLoading = false,
  hasError = false,
  onRetry,
  onSubmit,
}: Readonly<AccountingEntityStepProps>) {
  const { t } = useTranslation('onboarding');
  const titleId = useId();
  const formId = useId();

  const title = t('entity_step_title');
  const description = t('entity_step_description');
  const about_title = t('entity_about_title');
  const about_description = t('entity_about_description');
  const continue_label = t('entity_continue_label');
  const error_text = t('entity_options_error_text');
  const retry_label = t('entity_options_retry_label');

  return (
    <StepLayout
      titleId={titleId}
      actions={
        <Button
          className="ml-auto"
          type="submit"
          form={formId}
          disabled={isLoading || hasError}
        >
          {continue_label}
          <ArrowRight data-icon="inline-end" />
        </Button>
      }
    >
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1
            id={titleId}
            className="m-0 text-2xl font-semibold tracking-tight"
          >
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Collapsible defaultOpen className="mb-6 flex flex-col gap-1">
          <CollapsibleTrigger className="group flex min-h-8 items-center justify-between gap-4 rounded-sm text-left text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-flex size-4 shrink-0 items-center justify-center font-serif text-base italic leading-none"
              >
                i
              </span>
              {about_title}
            </span>
            <ChevronDown
              aria-hidden
              className="size-4 shrink-0 transition-transform group-data-[state=closed]:-rotate-90 motion-reduce:transition-none"
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="text-sm text-muted-foreground">{about_description}</p>
          </CollapsibleContent>
        </Collapsible>
        {isLoading && <AccountingEntityFormSkeleton />}
        {hasError && (
          <Alert variant="destructive">
            <AlertDescription>
              <p>{error_text}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
              >
                {retry_label}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {!isLoading && (
          <AccountingEntityForm
            id={formId}
            onSubmit={onSubmit}
            currencies={currencies}
            jurisdictions={jurisdictions}
            disabled={hasError}
          />
        )}
      </div>
    </StepLayout>
  );
}
