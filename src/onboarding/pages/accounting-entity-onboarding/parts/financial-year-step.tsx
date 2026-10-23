import { FinancialYearForm } from '@/accounting/components/financial-year-form';
import { Button } from '@/shared/components/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/collapsible';
import { PageTitle } from '@/shared/components/page-title';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { FinancialYearStepProps } from '../types';
import { StepLayout } from './step-layout';

export function FinancialYearStep({
  currentDate,
  jurisdictionCode,
  maxFiscalMonths,
  onBack,
  onSubmit,
}: Readonly<FinancialYearStepProps>) {
  const { t } = useTranslation('onboarding');

  const titleId = useId();
  const formId = useId();

  const title = t('financial_year_step_title');
  const description = t('financial_year_step_description');
  const about_title = t('financial_year_about_title');
  const about_description = t('financial_year_about_description');
  const continue_label = t('financial_year_continue_label');
  const back_label = t('financial_year_back_label');

  return (
    <StepLayout
      titleId={titleId}
      actions={
        <>
          <Button type="button" variant="outline" onClick={onBack}>
            {back_label}
          </Button>
          <Button type="submit" form={formId}>
            {continue_label}
            <ArrowRight data-icon="inline-end" />
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
        <FinancialYearForm
          id={formId}
          onSubmit={onSubmit}
          currentDate={currentDate}
          jurisdictionCode={jurisdictionCode}
          maxFiscalMonths={maxFiscalMonths}
        />
      </div>
    </StepLayout>
  );
}
