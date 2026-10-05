const OBSERVABILITY_ENVIRONMENTS = [
  'local',
  'development',
  'staging',
  'production',
  'test',
] as const;

declare const __APP_RELEASE__: string;

export const APP_RELEASE = __APP_RELEASE__;

export type UObservabilityEnvironment =
  (typeof OBSERVABILITY_ENVIRONMENTS)[number];

export interface IObservabilityEnvironmentVariables {
  VITE_APP_ENV?: string;
  VITE_SENTRY_DSN?: string;
}

export interface IObservabilityConfig {
  dsn?: string;
  enabled: boolean;
  environment: UObservabilityEnvironment;
  release: string;
  tracesSampleRate: number;
}

function normalizeEnvironment(value: string | undefined) {
  const environment = value?.trim().toLowerCase();

  return OBSERVABILITY_ENVIRONMENTS.find(
    (candidate) => candidate === environment
  );
}

function normalizeDsn(value: string | undefined) {
  const dsn = value?.trim();
  if (!dsn) return undefined;

  try {
    const parsedDsn = new URL(dsn);

    const isHttp =
      parsedDsn.protocol === 'https:' || parsedDsn.protocol === 'http:';

    const hasProjectId =
      parsedDsn.pathname.split('/').filter(Boolean).length > 0;

    return isHttp && parsedDsn.username && hasProjectId ? dsn : undefined;
  } catch {
    return undefined;
  }
}

function getTracesSampleRate(environment: UObservabilityEnvironment) {
  if (environment === 'development' || environment === 'staging') return 1;

  if (environment === 'production') return 0.1;

  return 0;
}

export function createObservabilityConfig(
  environmentVariables: IObservabilityEnvironmentVariables
): IObservabilityConfig {
  const configuredEnvironment = normalizeEnvironment(
    environmentVariables.VITE_APP_ENV
  );

  const environment = configuredEnvironment ?? 'local';
  const dsn = normalizeDsn(environmentVariables.VITE_SENTRY_DSN);
  const tracesSampleRate = getTracesSampleRate(environment);

  return {
    ...(dsn ? { dsn } : {}),
    enabled: Boolean(dsn),
    environment,
    release: APP_RELEASE,
    tracesSampleRate,
  };
}

export const observabilityConfig = createObservabilityConfig(
  import.meta.env as unknown as IObservabilityEnvironmentVariables
);
