import {
  AccountingEntityCreationForm,
  AccountingEntityCreationFormSkeleton,
  type IAccountingEntityFormValues,
} from '@/accounting/components/accounting-entity-creation-form';
import { useCreateAccountingEntity } from '@/accounting/hooks/use-create-accounting-entity';
import { useCreateExpenseAccount } from '@/accounting/hooks/use-create-expense-account';
import { useCreateRevenueAccount } from '@/accounting/hooks/use-create-revenue-account';
import { useCreateStatutoryPayableAccount } from '@/accounting/hooks/use-create-statutory-payable-account';
import { useCreateStatutoryReceivableAccount } from '@/accounting/hooks/use-create-statutory-receivable-account';
import { useCreateSuspenseAccount } from '@/accounting/hooks/use-create-suspense-account';
import { useRecommendedBootstrap } from '@/accounting/hooks/use-recommended-bootstrap';
import { useSetupHeaderAccounts } from '@/accounting/hooks/use-setup-header-accounts';
import { accountingBootstrapMapper } from '@/accounting/lib/mappers/accounting-bootstrap.mapper';
import { accountingEntityMapper } from '@/accounting/lib/mappers/accounting-entity.mapper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useCurrencies } from '@/shared/hooks/use-currencies';
import { useJurisdictions } from '@/shared/hooks/use-jurisdictions';
import type {
  IAccountingEntityCreationDto,
  IRecommendedBootstrapAccountDto,
} from '@/shared/lib/api/Api';
import { useProfile } from '@/user/hooks/use-profile';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import helpers from './helper';
import { expenseBehavior, revenueBehavior, suspenseType } from './validation';

interface AccountingEntityCreationDialogProps {
  initialOnboarding?: boolean;
  open: boolean;
  done: () => Promise<void>;
  onClose?: () => void;
}

export function AccountingEntityCreationDialog({
  open,
  initialOnboarding = false,
  done,
  onClose,
}: Readonly<AccountingEntityCreationDialogProps>) {
  const { t } = useTranslation('accounting');
  const handleApiError = useApiErrorHandler();

  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmissionError, setHasSubmissionError] = useState(false);
  const submittingRef = useRef(false);
  const { mutateAsync: createAccountingEntity } = useCreateAccountingEntity();

  const { refetch: getRecommendations } = useRecommendedBootstrap({
    disabled: true,
  });

  const { mutateAsync: setupHeaders } = useSetupHeaderAccounts();

  const { mutateAsync: createReceivable } =
    useCreateStatutoryReceivableAccount();

  const { mutateAsync: createPayable } = useCreateStatutoryPayableAccount();
  const { mutateAsync: createRevenue } = useCreateRevenueAccount();
  const { mutateAsync: createExpense } = useCreateExpenseAccount();
  const { mutateAsync: createSuspense } = useCreateSuspenseAccount();

  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: currencies = [] } = useCurrencies();
  const { data: jurisdictions = [] } = useJurisdictions();

  const individualName =
    `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();

  const handleNonAccountantOnboarding = async (
    payload: IAccountingEntityCreationDto
  ) => {
    const { data: catalog } = await getRecommendations({ throwOnError: true });
    const invalidCatalogMessage = t('onboarding_invalid_catalog_error');
    if (!catalog) throw new Error(invalidCatalogMessage);

    const getName = (record: IRecommendedBootstrapAccountDto) => {
      const key = helpers.accountNameKey(record.key);
      if (!key) throw new Error(invalidCatalogMessage);

      return t(key);
    };

    const currency = payload.functionalCurrencyCode;

    const receivables = catalog.receivables.map((record) =>
      accountingBootstrapMapper.toReceivable(getName(record), currency)
    );

    const payables = catalog.payables.map((record) =>
      accountingBootstrapMapper.toPayable(getName(record), currency)
    );

    const revenue = catalog.revenue.map((record) =>
      accountingBootstrapMapper.toRevenue(
        getName(record),
        revenueBehavior(record.behavior, invalidCatalogMessage)
      )
    );

    const expense = catalog.expense.map((record) =>
      accountingBootstrapMapper.toExpense(
        getName(record),
        expenseBehavior(record.behavior, invalidCatalogMessage)
      )
    );

    const suspense = catalog.suspense.map((record) =>
      accountingBootstrapMapper.toSuspense(
        getName(record),
        suspenseType(record.type, invalidCatalogMessage),
        currency
      )
    );

    const entity = await createAccountingEntity(payload);
    queryClient.setQueryData(
      ['accountingService', 'getAccountingEntity'],
      entity
    );
    await setupHeaders(helpers.headerNames(t));
    for (const account of receivables) await createReceivable(account);
    for (const account of payables) await createPayable(account);
    for (const account of revenue) await createRevenue(account);
    for (const account of expense) await createExpense(account);
    for (const account of suspense) await createSuspense(account);
    await queryClient.invalidateQueries({
      queryKey: ['ledgerAccountService'],
      refetchType: 'none',
    });
    await queryClient.invalidateQueries({
      queryKey: ['userService', 'getPreferences'],
      refetchType: 'none',
    });
  };

  const handleSubmit = async (values: IAccountingEntityFormValues) => {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setHasSubmissionError(false);
    try {
      const payload =
        accountingEntityMapper.toAccountingEntityCreationDto(values);

      if (
        initialOnboarding &&
        payload.appPreferences.appUsageMode === 'non_power_user'
      ) {
        await handleNonAccountantOnboarding(payload);
      } else await createAccountingEntity(payload);

      await done();
      toast.success(t('welcome_to_drimsheet_text'));
    } catch (error) {
      setHasSubmissionError(true);
      if (
        error instanceof Error &&
        [
          t('onboarding_invalid_catalog_error'),
          t('onboarding_entity_refresh_error'),
        ].includes(error.message)
      ) {
        toast.error(error.message);
      } else handleApiError(error, { showToast: true });
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const dialog_title = t('account_setup_title');
  const dialog_description = t('account_setup_description');

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isSubmitting) onClose?.();
  };

  return (
    <Dialog
      open={open || isSubmitting || (initialOnboarding && hasSubmissionError)}
      onOpenChange={handleOpenChange}
      modal
    >
      <DialogContent className="sm:max-w-sm" showCloseButton={Boolean(onClose)}>
        <DialogHeader>
          <DialogTitle>{dialog_title}</DialogTitle>
          <DialogDescription className="text-sm">
            {dialog_description}
          </DialogDescription>
        </DialogHeader>
        {isLoadingProfile ? (
          <AccountingEntityCreationFormSkeleton />
        ) : (
          <AccountingEntityCreationForm
            individualName={individualName}
            loading={isSubmitting}
            onSubmit={handleSubmit}
            currencies={currencies}
            jurisdictions={jurisdictions}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
