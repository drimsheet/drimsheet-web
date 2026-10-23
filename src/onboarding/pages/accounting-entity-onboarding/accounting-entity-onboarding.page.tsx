import type { IAccountingEntityFormValues } from '@/accounting/components/accounting-entity-form';
import type { ICategoriesFormValues } from '@/accounting/components/categories-form';
import type { IFinancialYearFormValues } from '@/accounting/components/financial-year-form';
import type { IReportsFormValues } from '@/accounting/components/reports-form';
import logoImg from '@/shared/assets/logo.svg';
import { AppHeader } from '@/shared/components/app';
import { SidebarProvider } from '@/shared/components/sidebar';
import { useCurrencies } from '@/shared/hooks/use-currencies';
import { useJurisdictions } from '@/shared/hooks/use-jurisdictions';
import { dateUtils } from '@/shared/lib/utils/date';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountingEntityStep } from './parts/accounting-entity-step';
import { ExpenseCategoriesStep } from './parts/expense-categories-step';
import { FinancialYearStep } from './parts/financial-year-step';
import { IncomeCategoriesStep } from './parts/income-categories-step';
import { ReportsStep } from './parts/reports-step';
import { AccountingEntityOnboardingSidebar } from './parts/sidebar';

export function AccountingEntityOnboardingPage() {
  const { t } = useTranslation(['onboarding', 'shared']);
  const [currentStep, setCurrentStep] = useState(1);

  const [entityValues, setEntityValues] =
    useState<IAccountingEntityFormValues>();

  const [financialYearValues, setFinancialYearValues] =
    useState<IFinancialYearFormValues>();

  const [reportsValues, setReportsValues] = useState<IReportsFormValues>();

  const [incomeValues, setIncomeValues] = useState<ICategoriesFormValues>();

  const [currentDate] = useState(() => dateUtils.formatDateForApi(new Date()));
  const mainRef = useRef<HTMLElement>(null);
  const currenciesQuery = useCurrencies();
  const jurisdictionsQuery = useJurisdictions({ throwOnError: false });

  const isLoading = currenciesQuery.isPending || jurisdictionsQuery.isPending;

  const hasError =
    !isLoading &&
    (currenciesQuery.isError ||
      jurisdictionsQuery.isError ||
      !currenciesQuery.data?.length ||
      !jurisdictionsQuery.data?.length);

  const jurisdiction = jurisdictionsQuery.data?.find(
    (item) => item.code === entityValues?.jurisdictionCode
  );

  const handleEntitySubmit = (values: IAccountingEntityFormValues) => {
    setEntityValues(values);
    setCurrentStep(2);
  };

  const handleFinancialYearSubmit = (values: IFinancialYearFormValues) => {
    setFinancialYearValues(values);
    setCurrentStep(3);
  };

  const handleReportsSubmit = (values: IReportsFormValues) => {
    setReportsValues(values);
    setCurrentStep(4);
  };

  const handleIncomeSubmit = (values: ICategoriesFormValues) => {
    setIncomeValues(values);
    setCurrentStep(5);
  };

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [currentStep]);

  const handleRetry = () => {
    void currenciesQuery.refetch();
    void jurisdictionsQuery.refetch();
  };

  const drimsheet_text = t('shared:drimsheet');
  const step_status = t('step_status', { step: currentStep, total: 5 });

  return (
    <SidebarProvider className="h-dvh min-h-0 flex-col overflow-hidden">
      <AppHeader
        showSidebarTrigger={false}
        className="flex min-h-16 shrink-0 items-center border-b px-4 py-2 sm:px-6"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <img src={logoImg} alt={drimsheet_text} className="size-7 shrink-0" />
        </div>
      </AppHeader>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <AccountingEntityOnboardingSidebar currentStep={currentStep} />
        <main
          ref={mainRef}
          tabIndex={-1}
          className="flex min-h-0 min-w-0 flex-1 scroll-pb-36 flex-col gap-4 overflow-y-auto overscroll-contain outline-none"
        >
          <p className="shrink-0 px-6 pt-8 text-xs text-muted-foreground sm:px-8 lg:px-10">
            {step_status}
          </p>
          <div className={currentStep === 1 ? 'flex flex-1' : 'hidden'}>
            <AccountingEntityStep
              currencies={currenciesQuery.data ?? []}
              jurisdictions={jurisdictionsQuery.data ?? []}
              isLoading={isLoading}
              hasError={hasError}
              onRetry={handleRetry}
              onSubmit={handleEntitySubmit}
            />
          </div>
          {entityValues && (
            <div className={currentStep === 2 ? 'flex flex-1' : 'hidden'}>
              <FinancialYearStep
                currentDate={currentDate}
                maxFiscalMonths={jurisdiction?.maxFiscalMonths}
                onBack={() => setCurrentStep(1)}
                onSubmit={handleFinancialYearSubmit}
              />
            </div>
          )}
          {financialYearValues && (
            <div className={currentStep === 3 ? 'flex flex-1' : 'hidden'}>
              <ReportsStep
                financialYear={financialYearValues}
                currencies={currenciesQuery.data ?? []}
                currentDate={currentDate}
                maxFiscalMonths={jurisdiction?.maxFiscalMonths}
                onBack={() => setCurrentStep(2)}
                onSubmit={handleReportsSubmit}
              />
            </div>
          )}
          {reportsValues && (
            <div className={currentStep === 4 ? 'flex flex-1' : 'hidden'}>
              <IncomeCategoriesStep
                onBack={() => setCurrentStep(3)}
                onSubmit={handleIncomeSubmit}
              />
            </div>
          )}
          {incomeValues && (
            <div className={currentStep === 5 ? 'flex flex-1' : 'hidden'}>
              <ExpenseCategoriesStep onBack={() => setCurrentStep(4)} />
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
