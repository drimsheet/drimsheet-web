import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnv, type PluginOption } from 'vite';
import { configDefaults, defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageMetadata = createRequire(import.meta.url)('./package.json') as {
  name: string;
  version: string;
};

const appRelease = `${packageMetadata.name}@${packageMetadata.version}`;

function requireBuildValue(
  environment: Record<string, string | undefined>,
  name: string
) {
  const value = environment[name]?.trim();
  if (!value) {
    throw new Error(
      `Sentry-enabled builds require the build-only ${name} value.`
    );
  }

  return value;
}

export default defineConfig(({ command, mode }) => {
  const environment = loadEnv(mode, __dirname, ['VITE_', 'SENTRY_']);

  const sentryBuildEnabled =
    command === 'build' && Boolean(environment.VITE_SENTRY_DSN?.trim());

  const plugins: PluginOption[] = [react(), tailwindcss()];

  if (sentryBuildEnabled) {
    const authToken = requireBuildValue(environment, 'SENTRY_AUTH_TOKEN');
    const org = requireBuildValue(environment, 'SENTRY_ORG');
    const project = requireBuildValue(environment, 'SENTRY_PROJECT');

    plugins.push(
      sentryVitePlugin({
        authToken,
        org,
        project,
        release: {
          inject: true,
          name: appRelease,
        },
        sourcemaps: {
          filesToDeleteAfterUpload: ['./dist/**/*.map'],
        },
        telemetry: false,
      })
    );
  }

  return {
    plugins,
    define: {
      __APP_RELEASE__: JSON.stringify(appRelease),
    },
    build: {
      sourcemap: sentryBuildEnabled ? 'hidden' : false,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './setup-test.ts',
      exclude: [...configDefaults.exclude, 'playwright/**'],
      maxWorkers: '50%',
    },
  };
});
