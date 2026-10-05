import type { IObservabilityConfig } from '@/shared/lib/configs/observability.config';
import * as Sentry from '@sentry/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sentry/react')>();

  return {
    ...actual,
    addBreadcrumb: vi.fn(),
    captureException: vi.fn(),
    init: vi.fn(),
    reactRouterV7BrowserTracingIntegration: vi.fn(() => ({
      name: 'ReactRouterV7BrowserTracing',
    })),
  };
});

const ENABLED_CONFIG: IObservabilityConfig = {
  dsn: 'https://public-key@o1.ingest.sentry.io/123',
  enabled: true,
  environment: 'staging',
  release: 'drimsheet-web@1.2.3',
  tracesSampleRate: 1,
};

const VALID_CORRELATION_ID = '0198ad49-0f4a-7709-a5bf-2f7cfbaea7c4';
const TRACE_ID = '0123456789abcdef0123456789abcdef';
const SPAN_ID = '0123456789abcdef';
const DEBUG_ID = '01234567-89ab-cdef-0123-456789abcdef';

type TObservabilityService =
  (typeof import('@/shared/lib/services/observability.service'))['observabilityService'];

let observabilityService: TObservabilityService;

function getSentryOptions() {
  const options = vi.mocked(Sentry.init).mock.calls[0]?.[0];
  if (!options) throw new Error('Expected Sentry initialization options');

  return options;
}

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.mocked(Sentry.init).mockReturnValue({} as never);
  observabilityService = (
    await import('@/shared/lib/services/observability.service')
  ).observabilityService;
});

describe('observabilityService', () => {
  it('initializes Sentry once with routing, tracing, release, and privacy controls', () => {
    observabilityService.initialize(ENABLED_CONFIG);
    observabilityService.initialize(ENABLED_CONFIG);

    expect(Sentry.reactRouterV7BrowserTracingIntegration).toHaveBeenCalledTimes(
      1
    );
    expect(Sentry.init).toHaveBeenCalledTimes(1);
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: ENABLED_CONFIG.dsn,
        environment: 'staging',
        release: 'drimsheet-web@1.2.3',
        sendDefaultPii: false,
        tracesSampleRate: 1,
        integrations: [expect.objectContaining({ name: expect.any(String) })],
        beforeSend: expect.any(Function),
        beforeSendTransaction: expect.any(Function),
        beforeSendSpan: expect.any(Function),
        beforeBreadcrumb: expect.any(Function),
      })
    );
  });

  it('keeps disabled telemetry inert and treats initialization as idempotent', () => {
    observabilityService.initialize({
      ...ENABLED_CONFIG,
      dsn: undefined,
      enabled: false,
    });
    observabilityService.initialize(ENABLED_CONFIG);
    observabilityService.report(new Error('ignored'));
    observabilityService.addApiFailureBreadcrumb({ kind: 'network' });

    expect(Sentry.init).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
  });

  it('does not throw or enable reporting when SDK initialization fails', () => {
    vi.mocked(Sentry.init).mockImplementationOnce(() => {
      throw new Error('Sentry unavailable');
    });

    expect(() => observabilityService.initialize(ENABLED_CONFIG)).not.toThrow();
    expect(() =>
      observabilityService.report(new Error('application failure'))
    ).not.toThrow();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('keeps capture and breadcrumb SDK failures non-fatal', () => {
    observabilityService.initialize(ENABLED_CONFIG);
    vi.mocked(Sentry.captureException).mockImplementationOnce(() => {
      throw new Error('Capture unavailable');
    });
    vi.mocked(Sentry.addBreadcrumb).mockImplementationOnce(() => {
      throw new Error('Breadcrumb unavailable');
    });

    expect(() =>
      observabilityService.report(new Error('application failure'), {
        source: 'api-client',
      })
    ).not.toThrow();
    expect(() =>
      observabilityService.addApiFailureBreadcrumb({ kind: 'network' })
    ).not.toThrow();
  });

  it('projects only approved manual report context', () => {
    observabilityService.initialize(ENABLED_CONFIG);

    const context = {
      source: 'api-client',
      operation: 'request',
      errorKey: 'runtime_error_unavailable',
      statusCode: 503,
      correlationId: VALID_CORRELATION_ID,
      email: 'private@example.com',
      amount: 100_00,
      token: 'secret-token',
    };

    observabilityService.report(
      new Error('failed for private@example.com'),
      context
    );

    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), {
      extra: {
        source: 'api-client',
        operation: 'request',
        errorKey: 'runtime_error_unavailable',
        statusCode: 503,
        correlationId: VALID_CORRELATION_ID,
      },
    });
    expect(
      JSON.stringify(vi.mocked(Sentry.captureException).mock.calls[0])
    ).not.toContain('secret-token');
  });

  it('removes identity, payload, URL, arbitrary breadcrumbs, and exception text from error events', async () => {
    observabilityService.initialize(ENABLED_CONFIG);
    const beforeSend = getSentryOptions().beforeSend;
    if (!beforeSend) throw new Error('Expected beforeSend');

    const scrubbed = await beforeSend(
      {
        type: undefined,
        event_id: 'a'.repeat(32),
        release: 'untrusted@9.9.9',
        environment: 'staging',
        message: 'failed for private@example.com with secret-token',
        user: { id: 'private-user-id', email: 'private@example.com' },
        request: {
          method: 'POST',
          url: 'https://app.example.com/accounts/private-user-id?token=secret-token',
          data: { amount: 100_00 },
          headers: { authorization: 'Bearer secret-token' },
        },
        extra: {
          source: 'api-client',
          operation: 'request',
          correlationId: VALID_CORRELATION_ID,
          form: { email: 'private@example.com' },
          amount: 100_00,
        },
        contexts: {
          trace: { trace_id: TRACE_ID, span_id: SPAN_ID, op: 'ui.render' },
          private: { userId: 'private-user-id' },
        },
        debug_meta: {
          images: [
            {
              type: 'sourcemap',
              debug_id: DEBUG_ID,
              code_file:
                'https://app.example.com/assets/app.js?token=secret-token',
            },
          ],
        },
        breadcrumbs: [
          {
            category: 'console',
            message: 'private@example.com secret-token',
          },
          {
            type: 'http',
            category: 'xhr',
            data: {
              method: 'POST',
              status_code: 500,
              url: 'https://core.example.com/users/private-user-id?token=secret-token',
            },
          },
        ],
        exception: {
          values: [
            {
              type: 'TypeError',
              value: 'private@example.com secret-token',
              stacktrace: {
                frames: [
                  {
                    filename:
                      'https://app.example.com/assets/app.js?token=secret-token',
                    function: 'renderApplication',
                    lineno: 10,
                    colno: 20,
                    in_app: true,
                  },
                ],
              },
            },
          ],
        },
      },
      {}
    );

    expect(scrubbed).toMatchObject({
      release: ENABLED_CONFIG.release,
      environment: 'staging',
      request: { method: 'POST' },
      contexts: {
        trace: { trace_id: TRACE_ID, span_id: SPAN_ID, op: 'ui.render' },
      },
      extra: {
        source: 'api-client',
        operation: 'request',
        correlationId: VALID_CORRELATION_ID,
      },
      exception: {
        values: [
          {
            type: 'TypeError',
            value: 'TypeError',
            stacktrace: {
              frames: [
                expect.objectContaining({
                  filename: 'https://app.example.com/assets/app.js',
                  function: 'renderApplication',
                }),
              ],
            },
          },
        ],
      },
      debug_meta: {
        images: [
          {
            type: 'sourcemap',
            debug_id: DEBUG_ID,
            code_file: 'https://app.example.com/assets/app.js',
          },
        ],
      },
      breadcrumbs: [
        {
          type: 'http',
          category: 'http.client',
          data: { method: 'POST', statusCode: 500 },
        },
      ],
    });

    const serialized = JSON.stringify(scrubbed);
    expect(serialized).not.toContain('private@example.com');
    expect(serialized).not.toContain('private-user-id');
    expect(serialized).not.toContain('secret-token');
    expect(serialized).not.toContain('10000');
  });

  it('keeps normalized route and trace identity while scrubbing transaction spans', async () => {
    observabilityService.initialize(ENABLED_CONFIG);
    const beforeSendTransaction = getSentryOptions().beforeSendTransaction;
    if (!beforeSendTransaction) {
      throw new Error('Expected beforeSendTransaction');
    }

    const scrubbed = await beforeSendTransaction(
      {
        type: 'transaction',
        release: 'untrusted@9.9.9',
        transaction: '/accounts/:accountId',
        transaction_info: { source: 'route' },
        user: { id: 'private-user-id' },
        request: {
          method: 'GET',
          url: 'https://app.example.com/accounts/private-user-id?token=secret-token',
        },
        contexts: { trace: { trace_id: TRACE_ID, span_id: SPAN_ID } },
        spans: [
          {
            data: {
              'http.request.method': 'GET',
              'http.response.status_code': 500,
              'url.full':
                'https://core.example.com/accounts/private-user-id?token=secret-token',
              amount: 100_00,
            },
            description:
              'GET https://core.example.com/accounts/private-user-id?token=secret-token',
            op: 'http.client',
            trace_id: TRACE_ID,
            span_id: SPAN_ID,
            start_timestamp: 1,
            timestamp: 2,
          },
        ],
        measurements: { lcp: { value: 1_000, unit: 'millisecond' } },
      },
      {}
    );

    expect(scrubbed).toMatchObject({
      type: 'transaction',
      release: ENABLED_CONFIG.release,
      transaction: '/accounts/:accountId',
      transaction_info: { source: 'route' },
      request: { method: 'GET' },
      contexts: { trace: { trace_id: TRACE_ID, span_id: SPAN_ID } },
      spans: [
        {
          description: 'http.request',
          op: 'http.client',
          data: {
            'http.request.method': 'GET',
            'http.response.status_code': 500,
          },
        },
      ],
      measurements: { lcp: { value: 1_000, unit: 'millisecond' } },
    });
    expect(JSON.stringify(scrubbed)).not.toContain('private-user-id');
    expect(JSON.stringify(scrubbed)).not.toContain('secret-token');
    expect(JSON.stringify(scrubbed)).not.toContain('10000');
  });

  it('drops UI breadcrumbs and projects safe API-failure breadcrumbs', () => {
    observabilityService.initialize(ENABLED_CONFIG);
    const beforeBreadcrumb = getSentryOptions().beforeBreadcrumb;
    if (!beforeBreadcrumb) throw new Error('Expected beforeBreadcrumb');

    expect(
      beforeBreadcrumb({ category: 'ui.click', message: 'private input' })
    ).toBeNull();
    expect(
      beforeBreadcrumb({
        type: 'http',
        category: 'api.failure',
        data: {
          kind: 'server-response',
          method: 'post',
          statusCode: 500,
          correlationId: VALID_CORRELATION_ID,
          responseBody: { amount: 100_00 },
        },
      })
    ).toEqual({
      type: 'http',
      category: 'api.failure',
      data: {
        kind: 'server-response',
        method: 'POST',
        statusCode: 500,
        correlationId: VALID_CORRELATION_ID,
      },
    });
  });

  it('records bounded API failure breadcrumbs and rejects malformed context', () => {
    observabilityService.initialize(ENABLED_CONFIG);

    observabilityService.addApiFailureBreadcrumb({
      kind: 'server-response',
      method: 'post',
      statusCode: 500,
      errorKey: 'runtime_error_unavailable',
      correlationId: 'private@example.com',
    });

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      type: 'http',
      category: 'api.failure',
      level: 'error',
      data: {
        kind: 'server-response',
        method: 'POST',
        statusCode: 500,
        errorKey: 'runtime_error_unavailable',
      },
    });
  });
});
