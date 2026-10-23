import { Sidebar, SidebarContent } from '@/shared/components/sidebar';
import { cn } from '@/shared/lib/utils/cn';
import { useTranslation } from 'react-i18next';

import type { AccountingEntityOnboardingSidebarProps } from '../types';

export function AccountingEntityOnboardingSidebar({
  currentStep = 1,
}: Readonly<AccountingEntityOnboardingSidebarProps>) {
  const { t } = useTranslation('onboarding');

  const steps = [
    t('entity_step_label'),
    t('financial_year_step_label'),
    t('reports_step_label'),
    t('income_categories_step_label'),
    t('expense_categories_step_label'),
  ];

  const steps_label = t('steps_label');

  return (
    <Sidebar
      collapsible="none"
      className="hidden h-auto shrink-0 border-r md:flex"
    >
      <SidebarContent className="px-3 py-6">
        <nav aria-label={steps_label} className="flex flex-col gap-4">
          <ol className="flex flex-col gap-2">
            {steps.map((label, index) => (
              <li
                key={label}
                aria-current={index + 1 === currentStep ? 'step' : undefined}
                className={cn(
                  'flex items-start gap-3 rounded-md border border-transparent px-3 py-3 text-sm',
                  index + 1 === currentStep
                    ? 'border-border bg-accent font-semibold text-accent-foreground'
                    : 'text-muted-foreground',
                  index + 1 < currentStep &&
                    'font-medium text-sidebar-foreground dark:text-white'
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'mt-1.5 size-2 shrink-0 rounded-full',
                    index + 1 === currentStep
                      ? 'animate-pulse-scale bg-primary motion-reduce:animate-none'
                      : 'bg-muted-foreground/40',
                    index + 1 < currentStep &&
                      'bg-sidebar-foreground dark:bg-white'
                  )}
                />
                <span>{label}</span>
              </li>
            ))}
          </ol>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
