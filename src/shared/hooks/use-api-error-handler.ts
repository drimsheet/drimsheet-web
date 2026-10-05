import apiErrorsJson from '@/shared/i18n/locales/en/api-errors.json';
import { parseApiError } from '@/shared/lib/api';
import type { IApiValidationError } from '@/shared/lib/api/Api';
import { observabilityService } from '@/shared/lib/services/observability.service';
import i18n from 'i18next';
import { useCallback } from 'react';
import { toast } from 'sonner';

export type TApiErrorKey = keyof typeof apiErrorsJson;

const isApiErrorKey = (key: string): key is TApiErrorKey => {
  return key in apiErrorsJson;
};

const getValidationToastMessages = (
  validationErrors: IApiValidationError[]
) => {
  const messages = new Set<string>();

  validationErrors.forEach(({ message }) => {
    if (!message) {
      return undefined;
    }

    if (isApiErrorKey(message)) {
      messages.add(i18n.t(message, { ns: 'api-errors' }));
    } else {
      // TODO: report untranslated message
      messages.add(message);
    }
  });

  return [...messages];
};

type THandleErrorOptions = {
  showToast?: boolean;
  setValidationError?: (validationError: IApiValidationError[]) => void;
  report?: boolean;
};

interface IApiErrorHandlerConfig {
  handleUnauthorized?: () => void;
}

let apiErrorHandlerConfig: IApiErrorHandlerConfig = {};

export function configureApiErrorHandler(config: IApiErrorHandlerConfig) {
  apiErrorHandlerConfig = config;
}

function toError(value: unknown) {
  return value instanceof Error ? value : new Error('API client failure');
}

export function useApiErrorHandler() {
  const handleApiError = useCallback(
    (errorValue: unknown, options?: THandleErrorOptions) => {
      const error = parseApiError(errorValue);

      observabilityService.addApiFailureBreadcrumb({
        kind: error.kind,
        ...(error.method ? { method: error.method } : {}),
        ...(error.statusCode ? { statusCode: error.statusCode } : {}),
        ...(error.errorKey ? { errorKey: error.errorKey } : {}),
        ...(error.correlationId ? { correlationId: error.correlationId } : {}),
      });

      const isAuthActionFailure =
        error.kind === 'server-response' &&
        error.code === 401 &&
        !window.location.pathname.startsWith('/auth/');

      if (isAuthActionFailure) {
        apiErrorHandlerConfig.handleUnauthorized?.();

        return;
      }

      const isBrowserOwnedFailure = error.kind !== 'server-response';

      if (isBrowserOwnedFailure && options?.report !== false) {
        observabilityService.report(toError(errorValue), {
          source: 'api-client',
          operation: 'request',
          ...(error.errorKey ? { errorKey: error.errorKey } : {}),
          ...(error.correlationId
            ? { correlationId: error.correlationId }
            : {}),
        });
      }

      if (options?.showToast) {
        const validationToastMessages = getValidationToastMessages(
          error.validationErrors ?? []
        );

        const errorKey = error.errorKey;

        if (validationToastMessages.length > 0) {
          validationToastMessages.forEach((message) => toast.error(message));
        } else if (errorKey && isApiErrorKey(errorKey)) {
          toast.error(i18n.t(errorKey, { ns: 'api-errors' }));
        } else {
          toast.error(i18n.t('an_error_occurred', { ns: 'shared' }));
        }
      }

      options?.setValidationError?.(error.validationErrors ?? []);

      return error;
    },
    []
  );

  return handleApiError;
}
