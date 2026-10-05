import {
  configureApiErrorHandler,
  useApiErrorHandler,
} from '@/shared/hooks/use-api-error-handler';
import type { IHttpErrorDto } from '@/shared/lib/api/Api';
import { observabilityService } from '@/shared/lib/services/observability.service';
import { act, renderHook } from '@testing-library/react';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/services/observability.service', () => ({
  observabilityService: {
    addApiFailureBreadcrumb: vi.fn(),
    initialize: vi.fn(),
    report: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

const VALID_CORRELATION_ID = '0198ad49-0f4a-7709-a5bf-2f7cfbaea7c4';

function makeAxiosError(
  overrides: Partial<AxiosError<IHttpErrorDto>>
): AxiosError<IHttpErrorDto> {
  return Object.assign(new Error('Request failed'), {
    isAxiosError: true as const,
    name: 'AxiosError',
    toJSON: () => ({}),
    ...overrides,
  }) as AxiosError<IHttpErrorDto>;
}

function makeResponseError(
  status: number,
  data: IHttpErrorDto
): AxiosError<IHttpErrorDto> {
  return makeAxiosError({
    config: { method: 'post', headers: {} as never },
    response: {
      status,
      statusText: 'Request failed',
      config: { headers: {} as never },
      headers: { 'x-correlation-id': VALID_CORRELATION_ID },
      data,
    },
  });
}

describe('useApiErrorHandler', () => {
  const handleUnauthorized = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/dashboard');
    configureApiErrorHandler({ handleUnauthorized });
  });

  it('records a bounded Core failure without creating a frontend exception', () => {
    const error = makeResponseError(500, {
      name: 'InternalServerError',
      errorKey: 'app_error_unexpected',
    });

    const { result } = renderHook(() => useApiErrorHandler());

    act(() => {
      result.current(error, { showToast: true });
    });

    expect(observabilityService.addApiFailureBreadcrumb).toHaveBeenCalledWith({
      kind: 'server-response',
      method: 'POST',
      statusCode: 500,
      errorKey: 'app_error_unexpected',
      correlationId: VALID_CORRELATION_ID,
    });
    expect(observabilityService.report).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Something went wrong.');
  });

  it('preserves unauthorized handling outside auth routes', () => {
    const error = makeResponseError(401, {
      name: 'UnauthorizedError',
      errorKey: 'app_error_unauthorized',
    });

    const { result } = renderHook(() => useApiErrorHandler());

    let parsedError: ReturnType<typeof result.current>;
    act(() => {
      parsedError = result.current(error, { showToast: true });
    });

    expect(handleUnauthorized).toHaveBeenCalledTimes(1);
    expect(parsedError!).toBeUndefined();
    expect(toast.error).not.toHaveBeenCalled();
    expect(observabilityService.report).not.toHaveBeenCalled();
  });

  it('does not force sign-out for an unauthorized response on an auth route', () => {
    window.history.pushState({}, '', '/auth/signin');

    const error = makeResponseError(401, {
      name: 'UnauthorizedError',
      errorKey: 'app_error_unauthorized',
    });

    const { result } = renderHook(() => useApiErrorHandler());

    act(() => {
      result.current(error, { showToast: true });
    });

    expect(handleUnauthorized).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Unauthorized.');
  });

  it('reports browser-owned network failures by default', () => {
    const error = makeAxiosError({
      config: { method: 'get', headers: {} as never },
      request: {},
    });

    const { result } = renderHook(() => useApiErrorHandler());

    act(() => {
      result.current(error);
    });

    expect(observabilityService.addApiFailureBreadcrumb).toHaveBeenCalledWith({
      kind: 'network',
      method: 'GET',
    });
    expect(observabilityService.report).toHaveBeenCalledWith(error, {
      source: 'api-client',
      operation: 'request',
    });
  });

  it('respects report false for a browser-owned failure', () => {
    const error = new SyntaxError('Client parsing failed');
    const { result } = renderHook(() => useApiErrorHandler());

    act(() => {
      result.current(error, { report: false });
    });

    expect(observabilityService.addApiFailureBreadcrumb).toHaveBeenCalledWith({
      kind: 'client',
    });
    expect(observabilityService.report).not.toHaveBeenCalled();
  });

  it('shows distinct localized validation messages before the top-level error', () => {
    const validationErrors = [
      { field: 'email', message: 'auth_error_email_required_invalid' },
      { field: 'password', message: 'auth_error_password_invalid' },
      { field: 'passwordConfirmation', message: 'auth_error_password_invalid' },
      { field: 'firstName', message: '' },
    ];

    const setValidationError = vi.fn();

    const error = makeResponseError(422, {
      name: 'ValidationError',
      errorKey: 'app_error_validation_error',
      validationErrors,
    });

    const { result } = renderHook(() => useApiErrorHandler());

    act(() => {
      result.current(error, { showToast: true, setValidationError });
    });

    expect(toast.error).toHaveBeenCalledTimes(2);
    expect(toast.error).toHaveBeenNthCalledWith(1, 'Email is required.');
    expect(toast.error).toHaveBeenNthCalledWith(2, 'Invalid password.');
    expect(toast.error).not.toHaveBeenCalledWith('Validation error.');
    expect(setValidationError).toHaveBeenCalledWith(validationErrors);
  });

  it('uses a localized top-level error when validation messages are unusable', () => {
    const error = makeResponseError(422, {
      name: 'ValidationError',
      errorKey: 'app_error_validation_error',
      validationErrors: [{ field: 'email', message: '' }],
    });

    const { result } = renderHook(() => useApiErrorHandler());

    act(() => {
      result.current(error, { showToast: true });
    });

    expect(toast.error).toHaveBeenCalledOnce();
    expect(toast.error).toHaveBeenCalledWith('Validation error.');
  });

  it('preserves validation projection and shows untranslated API messages', () => {
    const validationErrors = [{ field: 'name', message: 'Name is required' }];
    const setValidationError = vi.fn();

    const error = makeResponseError(422, {
      name: 'ValidationError',
      errorKey: 'unknown_error_key',
      validationErrors,
    });

    const { result } = renderHook(() => useApiErrorHandler());

    act(() => {
      result.current(error, { showToast: true, setValidationError });
    });

    expect(setValidationError).toHaveBeenCalledWith(validationErrors);
    expect(toast.error).toHaveBeenCalledWith('Name is required');
  });

  it('uses the localized generic toast without validation or top-level keys', () => {
    const error = makeResponseError(422, {
      name: 'ValidationError',
      errorKey: 'unknown_error_key',
    });

    const { result } = renderHook(() => useApiErrorHandler());

    act(() => {
      result.current(error, { showToast: true });
    });

    expect(toast.error).toHaveBeenCalledWith('An error occurred');
  });
});
