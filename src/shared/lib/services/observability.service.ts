import {
  observabilityConfig,
  type IObservabilityConfig,
} from '@/shared/lib/configs/observability.config';
import { isValidUUID } from '@/shared/lib/utils/uuid';
import type { Breadcrumb, ErrorEvent, Event } from '@sentry/react';
import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const SAFE_LABEL_PATTERN = /^[A-Za-z][A-Za-z0-9_.:-]{0,127}$/;
const SAFE_ROUTE_PATTERN = /^(?:[A-Z]+ )?\/[A-Za-z0-9_:/.*-]*$/;
const TRACE_ID_PATTERN = /^[0-9a-f]{32}$/;
const SPAN_ID_PATTERN = /^[0-9a-f]{16}$/;
const EVENT_ID_PATTERN = /^[0-9a-f]{32}$/;

const DEBUG_ID_PATTERN =
  /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;

type TBrowserOptions = Parameters<typeof Sentry.init>[0];
type TSentrySpan = Parameters<
  NonNullable<TBrowserOptions['beforeSendSpan']>
>[0];
type TSentryTransaction = Parameters<
  NonNullable<TBrowserOptions['beforeSendTransaction']>
>[0];

export interface IObservabilityReportContext {
  correlationId?: string;
  errorKey?: string;
  operation?: string;
  source?: string;
  statusCode?: number;
}

export interface IApiFailureBreadcrumbContext {
  correlationId?: string;
  errorKey?: string;
  kind: 'server-response' | 'network' | 'client';
  method?: string;
  statusCode?: number;
}

function safeLabel(value: unknown) {
  return typeof value === 'string' && SAFE_LABEL_PATTERN.test(value)
    ? value
    : undefined;
}

function safeHttpMethod(value: unknown) {
  if (typeof value !== 'string') return undefined;

  const method = value.toUpperCase();

  return /^(DELETE|GET|HEAD|OPTIONS|PATCH|POST|PUT)$/.test(method)
    ? method
    : undefined;
}

function safeStatusCode(value: unknown) {
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 100 &&
    value <= 599
    ? value
    : undefined;
}

function safeIdentifier(value: unknown, pattern: RegExp) {
  return typeof value === 'string' && pattern.test(value) ? value : undefined;
}

function projectReportContext(context: IObservabilityReportContext) {
  const projected: Record<string, string | number> = {};
  const source = safeLabel(context.source);
  const operation = safeLabel(context.operation);
  const errorKey = safeLabel(context.errorKey);
  const statusCode = safeStatusCode(context.statusCode);

  if (source) projected.source = source;

  if (operation) projected.operation = operation;

  if (errorKey) projected.errorKey = errorKey;

  if (statusCode) projected.statusCode = statusCode;

  if (isValidUUID(context.correlationId)) {
    projected.correlationId = context.correlationId;
  }

  return projected;
}

function projectTraceContext(contexts: Event['contexts']): Event['contexts'] {
  const trace = contexts?.trace;
  if (!trace || typeof trace !== 'object') return undefined;

  const traceId = safeIdentifier(trace.trace_id, TRACE_ID_PATTERN);
  const spanId = safeIdentifier(trace.span_id, SPAN_ID_PATTERN);
  const parentSpanId = safeIdentifier(trace.parent_span_id, SPAN_ID_PATTERN);
  if (!traceId || !spanId) return undefined;

  return {
    trace: {
      trace_id: traceId,
      span_id: spanId,
      ...(parentSpanId ? { parent_span_id: parentSpanId } : {}),
      ...(safeLabel(trace.op) ? { op: safeLabel(trace.op) } : {}),
      ...(safeLabel(trace.status) ? { status: safeLabel(trace.status) } : {}),
      ...(safeLabel(trace.origin) ? { origin: safeLabel(trace.origin) } : {}),
    },
  } as Event['contexts'];
}

function projectStacktrace(
  stacktrace: NonNullable<
    NonNullable<NonNullable<Event['exception']>['values']>[number]
  >['stacktrace']
) {
  if (!stacktrace?.frames) return undefined;

  return {
    frames: stacktrace.frames.map((frame) => ({
      ...(safeLabel(frame.module) ? { module: safeLabel(frame.module) } : {}),
      ...(typeof frame.filename === 'string'
        ? { filename: frame.filename.split('?')[0]?.split('#')[0] }
        : {}),
      ...(typeof frame.abs_path === 'string'
        ? { abs_path: frame.abs_path.split('?')[0]?.split('#')[0] }
        : {}),
      ...(typeof frame.function === 'string'
        ? { function: frame.function.slice(0, 256) }
        : {}),
      ...(typeof frame.lineno === 'number' ? { lineno: frame.lineno } : {}),
      ...(typeof frame.colno === 'number' ? { colno: frame.colno } : {}),
      ...(typeof frame.in_app === 'boolean' ? { in_app: frame.in_app } : {}),
      ...(safeIdentifier(frame.debug_id, DEBUG_ID_PATTERN)
        ? { debug_id: frame.debug_id }
        : {}),
    })),
  };
}

function projectException(exception: Event['exception']): Event['exception'] {
  const values = exception?.values;
  const sourceException = values?.[values.length - 1];
  if (!sourceException) return undefined;

  const type = safeLabel(sourceException.type) ?? 'UnknownError';
  const stacktrace = projectStacktrace(sourceException.stacktrace);

  const mechanism = sourceException.mechanism
    ? {
        type: safeLabel(sourceException.mechanism.type) ?? 'generic',
        ...(typeof sourceException.mechanism.handled === 'boolean'
          ? { handled: sourceException.mechanism.handled }
          : {}),
        ...(typeof sourceException.mechanism.synthetic === 'boolean'
          ? { synthetic: sourceException.mechanism.synthetic }
          : {}),
      }
    : undefined;

  return {
    values: [
      {
        type,
        value: type,
        ...(stacktrace ? { stacktrace } : {}),
        ...(mechanism ? { mechanism } : {}),
      },
    ],
  };
}

function projectDebugMeta(debugMeta: Event['debug_meta']): Event['debug_meta'] {
  if (!Array.isArray(debugMeta?.images)) return undefined;

  const images = debugMeta.images.flatMap((image) => {
    const debugId = safeIdentifier(image.debug_id, DEBUG_ID_PATTERN);
    const type = safeLabel(image.type);
    if (!debugId || !type) return [];

    return [
      {
        type,
        debug_id: debugId,
        ...(typeof image.code_file === 'string'
          ? { code_file: image.code_file.split('?')[0]?.split('#')[0] }
          : {}),
      },
    ];
  });

  return { images } as Event['debug_meta'];
}

function projectBreadcrumbData(data: Breadcrumb['data']) {
  if (!data || typeof data !== 'object') return undefined;

  const projected: Record<string, string | number> = {};
  const method = safeHttpMethod(data.method);

  const statusCode =
    safeStatusCode(data.statusCode) ?? safeStatusCode(data.status_code);

  const errorKey = safeLabel(data.errorKey);

  const kind =
    data.kind === 'server-response' ||
    data.kind === 'network' ||
    data.kind === 'client'
      ? data.kind
      : undefined;

  if (method) projected.method = method;

  if (statusCode) projected.statusCode = statusCode;

  if (errorKey) projected.errorKey = errorKey;

  if (kind) projected.kind = kind;

  if (isValidUUID(data.correlationId)) {
    projected.correlationId = data.correlationId;
  }

  return Object.keys(projected).length > 0 ? projected : undefined;
}

function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  const category = breadcrumb.category;
  const isApiFailure = category === 'api.failure';

  const isHttpBreadcrumb =
    breadcrumb.type === 'http' || category === 'fetch' || category === 'xhr';

  if (!isApiFailure && !isHttpBreadcrumb) return null;

  const data = projectBreadcrumbData(breadcrumb.data);

  return {
    type: 'http',
    category: isApiFailure ? 'api.failure' : 'http.client',
    ...(breadcrumb.level ? { level: breadcrumb.level } : {}),
    ...(typeof breadcrumb.timestamp === 'number' &&
    Number.isFinite(breadcrumb.timestamp)
      ? { timestamp: breadcrumb.timestamp }
      : {}),
    ...(data ? { data } : {}),
  };
}

function projectBreadcrumbs(breadcrumbs: Event['breadcrumbs']) {
  if (!Array.isArray(breadcrumbs)) return undefined;

  const projected = breadcrumbs.flatMap((breadcrumb) => {
    const safeBreadcrumb = scrubBreadcrumb(breadcrumb);

    return safeBreadcrumb ? [safeBreadcrumb] : [];
  });

  return projected.length > 0 ? projected : undefined;
}

function normalizeTransaction(
  transaction: string | undefined,
  source: Event['transaction_info'] extends infer TTransactionInfo
    ? TTransactionInfo extends { source: infer TSource }
      ? TSource
      : undefined
    : undefined
) {
  if (
    transaction &&
    source === 'route' &&
    transaction.length <= 256 &&
    SAFE_ROUTE_PATTERN.test(transaction) &&
    !transaction.includes('?') &&
    !transaction.includes('#')
  ) {
    return transaction;
  }

  return 'ui.unmatched';
}

function projectSpanData(data: TSentrySpan['data']) {
  const projected: TSentrySpan['data'] = {};

  const method = safeHttpMethod(
    data?.['http.request.method'] ?? data?.['http.method']
  );

  const statusCode = safeStatusCode(
    data?.['http.response.status_code'] ?? data?.['http.status_code']
  );

  const sentryOrigin = safeLabel(data?.['sentry.origin']);
  const sentryOperation = safeLabel(data?.['sentry.op']);

  if (method) projected['http.request.method'] = method;

  if (statusCode) projected['http.response.status_code'] = statusCode;

  if (sentryOrigin) projected['sentry.origin'] = sentryOrigin;

  if (sentryOperation) projected['sentry.op'] = sentryOperation;

  return projected;
}

function normalizeSpanDescription(
  description: string | undefined,
  operation: string | undefined
) {
  if (operation?.startsWith('http')) return 'http.request';

  if (operation?.startsWith('resource')) return 'resource.request';

  if (operation === 'pageload' || operation === 'navigation') {
    return description && SAFE_ROUTE_PATTERN.test(description)
      ? description
      : 'ui.unmatched';
  }

  return undefined;
}

function scrubSpan(span: TSentrySpan): TSentrySpan {
  const operation = safeLabel(span.op);
  const description = normalizeSpanDescription(span.description, operation);

  const traceId =
    safeIdentifier(span.trace_id, TRACE_ID_PATTERN) ?? '0'.repeat(32);

  const spanId =
    safeIdentifier(span.span_id, SPAN_ID_PATTERN) ?? '0'.repeat(16);

  const parentSpanId = safeIdentifier(span.parent_span_id, SPAN_ID_PATTERN);
  const status = safeLabel(span.status);
  const origin = safeLabel(span.origin);

  return {
    data: projectSpanData(span.data),
    trace_id: traceId,
    span_id: spanId,
    start_timestamp: Number.isFinite(span.start_timestamp)
      ? span.start_timestamp
      : 0,
    ...(description ? { description } : {}),
    ...(operation ? { op: operation } : {}),
    ...(parentSpanId ? { parent_span_id: parentSpanId } : {}),
    ...(status ? { status } : {}),
    ...(typeof span.timestamp === 'number' && Number.isFinite(span.timestamp)
      ? { timestamp: span.timestamp }
      : {}),
    ...(origin ? { origin: origin as TSentrySpan['origin'] } : {}),
    ...(span.measurements ? { measurements: span.measurements } : {}),
  };
}

function scrubErrorEvent(event: ErrorEvent, release: string): ErrorEvent {
  try {
    const exception = projectException(event.exception);
    const contexts = projectTraceContext(event.contexts);
    const breadcrumbs = projectBreadcrumbs(event.breadcrumbs);
    const extra = projectReportContext(event.extra ?? {});
    const requestMethod = safeHttpMethod(event.request?.method);
    const debugMeta = projectDebugMeta(event.debug_meta);

    const transaction =
      event.transaction_info?.source === 'route'
        ? normalizeTransaction(event.transaction, event.transaction_info.source)
        : undefined;

    return {
      type: undefined,
      ...(safeIdentifier(event.event_id, EVENT_ID_PATTERN)
        ? { event_id: event.event_id }
        : {}),
      ...(typeof event.timestamp === 'number' &&
      Number.isFinite(event.timestamp)
        ? { timestamp: event.timestamp }
        : {}),
      ...(typeof event.start_timestamp === 'number' &&
      Number.isFinite(event.start_timestamp)
        ? { start_timestamp: event.start_timestamp }
        : {}),
      ...(event.level ? { level: event.level } : {}),
      ...(safeLabel(event.platform) ? { platform: event.platform } : {}),
      release,
      ...(safeLabel(event.environment)
        ? { environment: event.environment }
        : {}),
      ...(exception ? { exception } : {}),
      ...(contexts ? { contexts } : {}),
      ...(breadcrumbs ? { breadcrumbs } : {}),
      ...(Object.keys(extra).length > 0 ? { extra } : {}),
      ...(requestMethod ? { request: { method: requestMethod } } : {}),
      ...(debugMeta ? { debug_meta: debugMeta } : {}),
      ...(transaction
        ? {
            transaction,
            transaction_info: { source: 'route' },
          }
        : {}),
    };
  } catch {
    return {
      type: undefined,
      release,
      exception: {
        values: [{ type: 'UnknownError', value: 'UnknownError' }],
      },
    };
  }
}

function scrubTransaction(
  event: TSentryTransaction,
  release: string
): TSentryTransaction {
  try {
    const contexts = projectTraceContext(event.contexts);
    const requestMethod = safeHttpMethod(event.request?.method);
    const eventId = safeIdentifier(event.event_id, EVENT_ID_PATTERN);

    const transaction = normalizeTransaction(
      event.transaction,
      event.transaction_info?.source
    );

    return {
      type: 'transaction',
      transaction,
      ...(eventId ? { event_id: eventId } : {}),
      ...(typeof event.timestamp === 'number' &&
      Number.isFinite(event.timestamp)
        ? { timestamp: event.timestamp }
        : {}),
      ...(typeof event.start_timestamp === 'number' &&
      Number.isFinite(event.start_timestamp)
        ? { start_timestamp: event.start_timestamp }
        : {}),
      ...(safeLabel(event.platform) ? { platform: event.platform } : {}),
      release,
      ...(safeLabel(event.environment)
        ? { environment: event.environment }
        : {}),
      ...(requestMethod ? { request: { method: requestMethod } } : {}),
      ...(contexts ? { contexts } : {}),
      ...(event.spans ? { spans: event.spans.map(scrubSpan) } : {}),
      ...(event.measurements ? { measurements: event.measurements } : {}),
      ...(event.transaction_info?.source === 'route'
        ? { transaction_info: { source: 'route' } }
        : {}),
    };
  } catch {
    return { type: 'transaction', transaction: 'ui.unmatched', release };
  }
}

let initializationAttempted = false;
let telemetryEnabled = false;

function initialize(config: IObservabilityConfig = observabilityConfig) {
  if (initializationAttempted) return;

  initializationAttempted = true;

  if (!config.enabled || !config.dsn) return;

  try {
    const client = Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      sendDefaultPii: false,
      tracesSampleRate: config.tracesSampleRate,
      integrations: [
        Sentry.reactRouterV7BrowserTracingIntegration({
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes,
        }),
      ],
      beforeSend: (event) => scrubErrorEvent(event, config.release),
      beforeSendTransaction: (event) => scrubTransaction(event, config.release),
      beforeSendSpan: scrubSpan,
      beforeBreadcrumb: scrubBreadcrumb,
    });

    telemetryEnabled = Boolean(client);
  } catch {
    telemetryEnabled = false;
  }
}

function report(error: Error, context: IObservabilityReportContext = {}) {
  if (!telemetryEnabled) return;

  try {
    Sentry.captureException(error, {
      extra: projectReportContext(context),
    });
  } catch {
    // Telemetry failures must never affect application behavior.
  }
}

function addApiFailureBreadcrumb(context: IApiFailureBreadcrumbContext) {
  if (!telemetryEnabled) return;

  try {
    const statusCode = safeStatusCode(context.statusCode);
    const method = safeHttpMethod(context.method);
    const errorKey = safeLabel(context.errorKey);
    const data: Record<string, string | number> = { kind: context.kind };

    if (statusCode) data.statusCode = statusCode;

    if (method) data.method = method;

    if (errorKey) data.errorKey = errorKey;

    if (isValidUUID(context.correlationId)) {
      data.correlationId = context.correlationId;
    }

    Sentry.addBreadcrumb({
      type: 'http',
      category: 'api.failure',
      level: statusCode && statusCode >= 500 ? 'error' : 'warning',
      data,
    });
  } catch {
    // Telemetry failures must never affect application behavior.
  }
}

export const observabilityService = Object.freeze({
  addApiFailureBreadcrumb,
  initialize,
  report,
});
