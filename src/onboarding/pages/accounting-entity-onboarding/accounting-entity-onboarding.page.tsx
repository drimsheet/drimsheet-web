import { useCreateExpenseAccount } from '@/account/hooks/use-create-expense-account';
import { useCreateRevenueAccount } from '@/account/hooks/use-create-revenue-account';
import { useSetupHeaderAccounts } from '@/account/hooks/use-setup-header-accounts';
import type { IAccountingEntityFormValues } from '@/accounting/components/accounting-entity-form';
import type { ICategoriesFormValues } from '@/accounting/components/categories-form';
import type { IFinancialYearFormValues } from '@/accounting/components/financial-year-form';
import type { IReportsFormValues } from '@/accounting/components/reports-form';
import { useCreateAccountingContext } from '@/accounting/hooks/use-create-accounting-context';
import { useCreateAccountingEntity } from '@/accounting/hooks/use-create-accounting-entity';
import { useCreateAccountingInterval } from '@/accounting/hooks/use-create-accounting-interval';
import { useCreateFiscalYear } from '@/accounting/hooks/use-create-fiscal-year';
import { useCreateReportingContext } from '@/accounting/hooks/use-create-reporting-context';
import { useCreateReportingInterval } from '@/accounting/hooks/use-create-reporting-interval';
import { useSwitchAccountingEntity } from '@/accounting/hooks/use-switch-accounting-entity';
import { onboardingCategoriesConfig } from '@/accounting/lib/configs/onboarding-categories.config';
import {
  accountingContextMapper,
  accountingEntityMapper,
  accountingIntervalMapper,
  expenseAccountMapper,
  fiscalYearMapper,
  reportingContextMapper,
  reportingIntervalMapper,
  revenueAccountMapper,
} from '@/accounting/lib/mappers/onboarding.mapper';
import { SidebarProvider, SidebarTrigger } from '@/shared/components/sidebar';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useCurrencies } from '@/shared/hooks/use-currencies';
import { useJurisdictions } from '@/shared/hooks/use-jurisdictions';
import { parseApiError } from '@/shared/lib/api';
import {
  EAppThemePreference,
  EAppUsageModePreference,
  type IAccountingEntity,
} from '@/shared/lib/api/Api';
import { dateUtils } from '@/shared/lib/utils/date';
import { useProfile } from '@/user/hooks/use-profile';
import { useUpdatePreferences } from '@/user/hooks/use-update-preferences';
import { useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import accountingEntityOnboardingHelpers from './helper';
import { AccountingEntityStep } from './parts/accounting-entity-step';
import { ExpenseCategoriesStep } from './parts/expense-categories-step';
import { FinancialYearStep } from './parts/financial-year-step';
import { IncomeCategoriesStep } from './parts/income-categories-step';
import { ReportsStep } from './parts/reports-step';
import { AccountingEntityOnboardingSidebar } from './parts/sidebar';
import type { IOnboardingProgress } from './types';

export function AccountingEntityOnboardingPage() {
  const accountControl = useOutletContext<ReactNode>();
  const { t } = useTranslation(['onboarding', 'shared']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isRetryBlocked, setIsRetryBlocked] = useState(false);
  const handleApiError = useApiErrorHandler();
  const expenseValuesRef = useRef<ICategoriesFormValues>(undefined);
  const submittingRef = useRef(false);

  const progressRef = useRef<IOnboardingProgress>({
    savedCategories: new Set(),
  });

  const updatePreferences = useUpdatePreferences();
  const createEntity = useCreateAccountingEntity();
  const switchEntity = useSwitchAccountingEntity();
  const createFiscalYear = useCreateFiscalYear();
  const createAccountingInterval = useCreateAccountingInterval();
  const createAccountingContext = useCreateAccountingContext();
  const createReportingInterval = useCreateReportingInterval();
  const createReportingContext = useCreateReportingContext();
  const setupHeaders = useSetupHeaderAccounts();
  const createRevenue = useCreateRevenueAccount();
  const createExpense = useCreateExpenseAccount();

  const [entityValues, setEntityValues] =
    useState<IAccountingEntityFormValues>();

  const [financialYearValues, setFinancialYearValues] =
    useState<IFinancialYearFormValues>();

  const [reportsValues, setReportsValues] = useState<IReportsFormValues>();

  const [incomeValues, setIncomeValues] = useState<ICategoriesFormValues>();

  const [currentDate] = useState(() => dateUtils.formatDateForApi(new Date()));
  const mainRef = useRef<HTMLElement>(null);
  const { data: profile } = useProfile();
  const currenciesQuery = useCurrencies();
  const jurisdictionsQuery = useJurisdictions({ throwOnError: false });

  const isLoading = currenciesQuery.isPending || jurisdictionsQuery.isPending;

  const individualName =
    `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();

  const hasError =
    !isLoading &&
    (currenciesQuery.isError ||
      jurisdictionsQuery.isError ||
      !currenciesQuery.data?.length ||
      !jurisdictionsQuery.data?.length);

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

  const handleFinish = async (expenseValues: ICategoriesFormValues) => {
    // The forms emitted validated payloads. These guards only enforce workflow state.
    if (
      submittingRef.current ||
      isRetryBlocked ||
      !entityValues ||
      !financialYearValues ||
      !reportsValues ||
      !incomeValues
    )
      return;

    const standard = accountingEntityOnboardingHelpers.getAccountingStandard(
      entityValues,
      jurisdictionsQuery.data ?? []
    );

    if (!standard) {
      handleApiError(
        new Error('Onboarding accounting standard is unavailable'),
        { showToast: true }
      );

      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setHasStarted(true);
    expenseValuesRef.current ??= expenseValues;
    const progress = progressRef.current;

    try {
      if (!progress.entity) {
        await updatePreferences.mutateAsync({
          appUsageMode: EAppUsageModePreference.NonPowerUser,
          theme: EAppThemePreference.System,
        });
      }

      progress.entity ??= await createEntity.mutateAsync(
        accountingEntityMapper.toDto(entityValues)
      );
      const entityId = progress.entity.id;

      if (!progress.switched) {
        await switchEntity.mutateAsync({ accountingEntityId: entityId });
        progress.switched = true;
      }

      progress.fiscalYearId ??= (
        await createFiscalYear.mutateAsync(
          fiscalYearMapper.toDto(financialYearValues, entityId)
        )
      ).id;

      progress.accountingIntervalId ??= (
        await createAccountingInterval.mutateAsync(
          accountingIntervalMapper.toDto(
            financialYearValues,
            progress.fiscalYearId
          )
        )
      ).id;

      progress.accountingContextId ??= (
        await createAccountingContext.mutateAsync(
          accountingContextMapper.toDto(
            financialYearValues,
            progress.fiscalYearId,
            progress.accountingIntervalId,
            standard
          )
        )
      ).id;

      progress.reportingIntervalId ??= (
        await createReportingInterval.mutateAsync(
          reportingIntervalMapper.toDto(reportsValues, progress.fiscalYearId)
        )
      ).id;

      progress.reportingContextId ??= (
        await createReportingContext.mutateAsync(
          reportingContextMapper.toDto(
            reportsValues,
            progress.accountingContextId,
            progress.reportingIntervalId
          )
        )
      ).id;

      progress.headerAccounts ??= await setupHeaders.mutateAsync(
        accountingEntityOnboardingHelpers.createHeaderAliases(t)
      );

      const selectedCategories = [
        ...incomeValues.categories,
        ...expenseValuesRef.current.categories,
      ].filter(({ selected }) => selected);

      for (const category of selectedCategories) {
        if (progress.savedCategories.has(category.id)) continue;

        const config = onboardingCategoriesConfig[category.parentId];

        const parent = progress.headerAccounts.find(
          (account) =>
            account.isControlAccount &&
            account.type === config.type &&
            account.behavior === config.behavior
        );

        if (!parent) {
          throw new Error(
            'Onboarding header account missing from setup response'
          );
        }

        if (config.type === 'revenue') {
          await createRevenue.mutateAsync(
            revenueAccountMapper.toDto(category, parent.id, config.behavior)
          );
        } else {
          await createExpense.mutateAsync(
            expenseAccountMapper.toDto(category, parent.id, config.behavior)
          );
        }

        progress.savedCategories.add(category.id);
      }
    } catch (error) {
      const failure = parseApiError(error);

      // Unknown write outcomes must not be retried blindly without backend reconciliation.
      const blocked =
        failure.code === 0 || failure.code >= 500 || failure.code === 409;

      setIsRetryBlocked(blocked);
      handleApiError(error, { showToast: true });

      return;
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }

    // Cache refreshes are reads and cannot turn completed writes into a failed submission.
    const entity = progress.entity;
    queryClient.setQueryData(
      ['accountingService', 'getAccountingEntity'],
      entity
    );
    queryClient.setQueryData<IAccountingEntity[]>(
      ['accountingService', 'getAccountingEntities'],
      (entities = []) => [
        ...entities.filter(({ id }) => id !== entity.id),
        entity,
      ]
    );
    void queryClient.invalidateQueries({
      queryKey: ['accountingService'],
      refetchType: 'none',
    });
    void queryClient.invalidateQueries({
      queryKey: ['ledgerAccountService'],
      refetchType: 'none',
    });
    void queryClient.invalidateQueries({
      queryKey: ['categoryService'],
      refetchType: 'none',
    });
    navigate('/dashboard', { replace: true });
  };

  const handleFinishRetry = () => {
    if (expenseValuesRef.current) void handleFinish(expenseValuesRef.current);
  };

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [currentStep]);

  const handleRetry = () => {
    void currenciesQuery.refetch();
    void jurisdictionsQuery.refetch();
  };

  const step_status = t('step_status', { step: currentStep, total: 5 });

  return (
    <SidebarProvider
      className="h-dvh min-h-0 overflow-hidden"
      style={{ '--sidebar-width': '14rem' } as React.CSSProperties}
    >
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <AccountingEntityOnboardingSidebar
          currentStep={currentStep}
          accountControl={accountControl}
        />
        <main
          ref={mainRef}
          tabIndex={-1}
          className="flex min-h-0 min-w-0 flex-1 scroll-pb-36 flex-col gap-4 overflow-y-auto overscroll-contain outline-none"
        >
          <SidebarTrigger className="mt-4 ml-6 shrink-0 md:hidden" />
          <p className="shrink-0 px-6 pt-8 text-xs text-muted-foreground sm:px-8 lg:px-10">
            {step_status}
          </p>
          <div className={currentStep === 1 ? 'flex flex-1' : 'hidden'}>
            <AccountingEntityStep
              individualName={individualName}
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
                key={entityValues.jurisdictionCode}
                jurisdictionCode={entityValues.jurisdictionCode}
                currentDate={currentDate}
                maxFiscalMonths={23}
                onBack={() => setCurrentStep(1)}
                onSubmit={handleFinancialYearSubmit}
              />
            </div>
          )}
          {financialYearValues && entityValues && (
            <div className={currentStep === 3 ? 'flex flex-1' : 'hidden'}>
              <ReportsStep
                financialYear={financialYearValues}
                officialCurrencyCode={entityValues.functionalCurrencyCode}
                currencies={currenciesQuery.data ?? []}
                currentDate={currentDate}
                maxFiscalMonths={23}
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
              <ExpenseCategoriesStep
                onBack={() => setCurrentStep(4)}
                onSubmit={handleFinish}
                onRetry={handleFinishRetry}
                isSubmitting={isSubmitting}
                hasStarted={hasStarted}
                isRetryBlocked={isRetryBlocked}
              />
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
