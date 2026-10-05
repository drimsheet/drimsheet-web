import type { IHttpErrorDto } from '@/shared/lib/api/Api';
import { isValidUUID } from '@/shared/lib/utils/uuid';
import { isAxiosError } from 'axios';

export type UApiFailureKind = 'server-response' | 'network' | 'client';

export type TApiError = IHttpErrorDto & {
  code: number;
  correlationId?: string;
  kind: UApiFailureKind;
  method?: string;
  statusCode?: number;
};

function getMethod(value: unknown) {
  return typeof value === 'string' ? value.toUpperCase() : undefined;
}

export const parseApiError = (error: unknown): TApiError => {
  if (!isAxiosError<IHttpErrorDto>(error)) {
    return {
      code: 0,
      name: error instanceof Error ? error.name : 'UnknownError',
      errorKey: '',
      validationErrors: [],
      kind: 'client',
    };
  }

  const { response } = error;
  const method = getMethod(error.config?.method);

  if (!response) {
    return {
      code: 0,
      name: error.name || 'AxiosError',
      errorKey: '',
      validationErrors: [],
      kind: error.request ? 'network' : 'client',
      ...(method ? { method } : {}),
    };
  }

  const correlationIdHeader = response.headers['x-correlation-id'];

  const correlationId = isValidUUID(correlationIdHeader)
    ? correlationIdHeader
    : undefined;

  return {
    code: response.status,
    name: response.data?.name ?? 'UnknownError',
    errorKey: response.data?.errorKey ?? '',
    validationErrors: response.data?.validationErrors ?? [],
    cause: response.data?.cause,
    kind: 'server-response',
    statusCode: response.status,
    ...(correlationId ? { correlationId } : {}),
    ...(method ? { method } : {}),
  };
};

export const isFeatureFlagApiError = (error: unknown) => {
  const apiError = parseApiError(error);

  return (
    apiError.kind === 'server-response' &&
    apiError.errorKey.startsWith('feature_flag_error_')
  );
};
