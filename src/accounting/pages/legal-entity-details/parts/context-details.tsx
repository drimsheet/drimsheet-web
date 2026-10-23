import {
  Empty,
  EmptyDescription,
  EmptyHeader,
} from '@/shared/components/empty';
import { Separator } from '@/shared/components/separator';
import { BookOpen, ChartNoAxesCombined } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import helpers from '../helper';
import type { ContextDetailsProps } from '../types';
import { IntervalDetails } from './interval-details';

export function ContextDetails({
  context,
  now,
}: Readonly<ContextDetailsProps>) {
  const { t } = useTranslation('accounting');
  const accounting_title = t('details_accounting_context_title');
  const reporting_title = t('details_reporting_context_title');
  const standard_label = t('details_standard_label');
  const currency_label = t('details_reporting_currency_label');
  const empty_text = t('details_no_context');

  const currency = context.reporting
    ? helpers.currency(context.reporting.reportingCurrencyCode)
    : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-7">
      <Separator />
      <div className="grid min-w-0 grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]">
        <section
          aria-label={accounting_title}
          className="flex min-w-0 flex-col gap-6"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="size-4" aria-hidden />
              {accounting_title}
            </div>
            {context.accounting && (
              <>
                <h3 className="m-0 break-words text-xl font-medium tracking-tight">
                  {context.accounting.name}
                </h3>
                <p className="m-0 text-xs text-muted-foreground">
                  {standard_label} · {context.accounting.accountingStandardCode}
                </p>
              </>
            )}
          </div>
          {context.accountingInterval ? (
            <IntervalDetails
              kind="accounting"
              interval={context.accountingInterval}
              now={now}
            />
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyDescription>{empty_text}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
        <Separator className="lg:hidden" />
        <Separator orientation="vertical" className="hidden lg:block" />
        <section
          aria-label={reporting_title}
          className="flex min-w-0 flex-col gap-6"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ChartNoAxesCombined className="size-4" aria-hidden />
              {reporting_title}
            </div>
            {context.reporting && (
              <>
                <h3 className="m-0 break-words text-xl font-medium tracking-tight">
                  {context.reporting.name}
                </h3>
                <p className="m-0 text-xs text-muted-foreground">
                  {currency_label} · <span aria-hidden>{currency?.flag}</span>{' '}
                  {currency?.name}
                </p>
              </>
            )}
          </div>
          {context.reportingInterval ? (
            <IntervalDetails
              kind="reporting"
              interval={context.reportingInterval}
              now={now}
            />
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyDescription>{empty_text}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </div>
    </div>
  );
}
