import { CategoriesForm } from '@/accounting/components/categories-form';
import { Button } from '@/shared/components/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/collapsible';
import { PageTitle } from '@/shared/components/page-title';
import { ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { ExpenseCategoriesStepProps } from '../types';
import { StepLayout } from './step-layout';

export function ExpenseCategoriesStep({
  onBack,
  onSubmit,
  isSubmitting = false,
  hasStarted = false,
}: Readonly<ExpenseCategoriesStepProps>) {
  const { t } = useTranslation('onboarding');

  const titleId = useId();
  const formId = useId();

  const title = t('expense_categories_step_title');
  const description = t('expense_categories_step_description');
  const about_title = t('expense_categories_about_title');
  const about_description = t('expense_categories_about_description');

  const continue_label = t('expense_categories_continue_label');

  const back_label = t('financial_year_back_label');

  return (
    <StepLayout
      titleId={titleId}
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={hasStarted || isSubmitting}
          >
            {back_label}
          </Button>
          <Button
            type="submit"
            form={formId}
            loading={isSubmitting}
            disabled={hasStarted}
          >
            {continue_label}
          </Button>
        </>
      }
    >
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-2">
          <PageTitle id={titleId}>{title}</PageTitle>
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
        <CategoriesForm
          id={formId}
          kind="expense"
          disabled={hasStarted || isSubmitting}
          onSubmit={onSubmit}
        />
      </div>
    </StepLayout>
  );
}
