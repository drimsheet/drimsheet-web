import { journalEntryStorageService } from '@/journal-entries/lib/services/storage.service';
import type {
  ITransactionContinuationSearchParams,
  UTransactionAccountField,
  UTransactionCreationType,
} from '@/journal-entries/lib/types/transaction-continuation.types';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useScopedKey } from '@/shared/hooks/use-scoped-key';
import {
  ELedgerAccountBehavior,
  type ULedgerAccountBehavior,
} from '@/shared/lib/api/Api';
import { observabilityService } from '@/shared/lib/services/observability.service';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function useTransactionContinuation<T extends object>(
  type: UTransactionCreationType,
  params: ITransactionContinuationSearchParams
) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialParams] = useState(params);

  const [showAccountTypeSelection, setShowAccountTypeSelection] =
    useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [showPettyCashAccountCreation, setShowPettyCashAccountCreation] =
    useState(false);

  const [inlineInitialValues, setInlineInitialValues] = useState<T>();
  const pendingValues = useRef<T | undefined>(undefined);
  const accountField = useRef<UTransactionAccountField>('accountId');
  const scopedKey = useScopedKey('journal-entries');
  const handleApiError = useApiErrorHandler();
  const continuationKey = initialParams.continuationKey;

  const continuation = useQuery({
    queryKey: [
      'journalEntryStorageService',
      'loadContinuation',
      scopedKey,
      type,
      continuationKey,
    ],
    enabled: Boolean(continuationKey && scopedKey),
    queryFn: async () => {
      if (!scopedKey || !continuationKey) {
        return null;
      }

      return journalEntryStorageService
        .loadContinuation<T>(scopedKey, type, continuationKey)
        .then((value) => value ?? null)
        .catch(() => null);
    },
    staleTime: Infinity,
    gcTime: 0,
  });

  const isRestoring = Boolean(continuationKey) && continuation.isPending;

  const initialValues = useMemo(() => {
    if (inlineInitialValues) {
      return inlineInitialValues;
    }

    // TODO: reset saved exchange rates when a returned account uses a different currency.
    const overrides: Record<string, string> = {};

    for (const key of [
      'accountId',
      'sourceAccountId',
      'destinationAccountId',
    ] as const) {
      if (initialParams[key]) {
        overrides[key] = initialParams[key];
      }
    }

    return { ...continuation.data, ...overrides } as Partial<T>;
  }, [continuation.data, initialParams, inlineInitialValues]);

  const handleAddAccount = (
    values: T,
    field: UTransactionAccountField = 'accountId'
  ) => {
    pendingValues.current = values;
    accountField.current = field;
    setShowAccountTypeSelection(true);
  };

  const handleAccountTypeSelected = async (
    behavior: ULedgerAccountBehavior
  ) => {
    if (!pendingValues.current || isSaving) {
      return;
    }

    if (behavior === ELedgerAccountBehavior.PettyCash) {
      setShowAccountTypeSelection(false);
      setShowPettyCashAccountCreation(true);

      return;
    }

    if (behavior !== ELedgerAccountBehavior.Bank) {
      // TODO: support virtual and credit card account creation when those flows exist.
      return;
    }

    if (!scopedKey) {
      return;
    }

    setIsSaving(true);

    try {
      const key = continuationKey ?? crypto.randomUUID();
      await journalEntryStorageService.saveContinuation(
        scopedKey,
        type,
        key,
        pendingValues.current
      );

      const returnParams = new URLSearchParams({
        continuationKey: key,
      });

      const creationParams = new URLSearchParams({
        redirect: `/transactions/${type}?${returnParams}`,
        redirectAccountAlias: accountField.current,
      });

      await navigate(`/accounts/new/bank?${creationParams}`);
    } catch (error) {
      handleApiError(error, { showToast: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePettyCashAccountCreated = (accountId: string) => {
    if (pendingValues.current) {
      setInlineInitialValues({
        ...pendingValues.current,
        [accountField.current]: accountId,
      });
    }
  };

  const handleContinuationComplete = async () => {
    if (scopedKey && continuationKey) {
      await journalEntryStorageService
        .removeContinuation(scopedKey, type, continuationKey)
        .catch((error: unknown) => {
          observabilityService.report(
            error instanceof Error
              ? error
              : new Error('Continuation cleanup failed'),
            {
              source: 'transaction-continuation',
            }
          );
        });
    }
  };

  useEffect(() => {
    if (
      isRestoring ||
      !Object.keys(initialParams).some((key) => searchParams.has(key))
    ) {
      return;
    }

    // Keep the captured initial parameters after replacing the browser URL.
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        for (const key of Object.keys(initialParams)) {
          next.delete(key);
        }

        return next;
      },
      { replace: true }
    );
  }, [initialParams, isRestoring, searchParams, setSearchParams]);

  return {
    initialValues,
    isRestoring,
    isSaving,
    showAccountTypeSelection,
    showPettyCashAccountCreation,
    handleAddAccount,
    handleAccountTypeSelected,
    handleAccountTypeSelectionClose: () => setShowAccountTypeSelection(false),
    handlePettyCashAccountCreated,
    handlePettyCashAccountCreationClose: () =>
      setShowPettyCashAccountCreation(false),
    handleContinuationComplete,
  };
}
