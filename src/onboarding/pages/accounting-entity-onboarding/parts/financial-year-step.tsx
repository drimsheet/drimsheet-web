import { FinancialYearForm } from '@/accounting/components/financial-year-form';
import { Button } from '@/shared/components/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/collapsible';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { FinancialYearStepProps } from '../types';

export function FinancialYearStep({
  currentDate,
  maxFiscalMonths,
  onBack,
}: Readonly<FinancialYearStepProps>) {
  const { t } = useTranslation('onboarding');

  const titleId = useId();

  const title = t('financial_year_step_title');
  const description = t('financial_year_step_description');
  const about_title = t('financial_year_about_title');
  const about_description = t('financial_year_about_description');
  const continue_label = t('financial_year_continue_label');
  const back_label = t('financial_year_back_label');

  return (
    <section
      aria-labelledby={titleId}
      className="flex w-full max-w-[620px] flex-1 flex-col gap-6"
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
        <FinancialYearForm
          currentDate={currentDate}
          maxFiscalMonths={maxFiscalMonths}
        />
      </div>
      <footer className="mt-auto flex flex-wrap justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          {back_label}
        </Button>
        <Button type="button">
          {continue_label}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </footer>
    </section>
  );
}
