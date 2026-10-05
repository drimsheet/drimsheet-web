import {
  defaultLaunchDarklyFlagValues,
  registerLaunchDarklyRoutes,
  type TLaunchDarklyFlagValues,
} from '@integration/mocks/launchdarkly';
import { test as base, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const applicationSourcePathPrefix = '/src/';

interface IFeatureFlagFixtures {
  launchDarklyFlagValues: TLaunchDarklyFlagValues;
}

export const test = base.extend<IFeatureFlagFixtures>({
  launchDarklyFlagValues: [defaultLaunchDarklyFlagValues, { option: true }],
  page: async (
    { browserName, launchDarklyFlagValues, page },
    use,
    testInfo
  ) => {
    await registerLaunchDarklyRoutes(page, launchDarklyFlagValues);

    const collectCoverage = testInfo.config.metadata.collectCoverage === true;

    if (!collectCoverage) {
      await use(page);

      return;
    }

    if (browserName !== 'chromium') {
      throw new Error('Playwright code coverage requires Chromium.');
    }

    await page.coverage.startJSCoverage({
      reportAnonymousScripts: false,
      resetOnNavigation: false,
    });

    await use(page);

    const coverage = await page.coverage.stopJSCoverage();

    const applicationCoverage = coverage.filter(({ url }) => {
      try {
        const sourcePath = new URL(url).pathname;

        return (
          sourcePath.startsWith(applicationSourcePathPrefix) &&
          /\.(?:ts|tsx)$/.test(sourcePath) &&
          !sourcePath.endsWith('.d.ts')
        );
      } catch {
        return false;
      }
    });

    const outputPath = testInfo.outputPath('v8-coverage.json');

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, JSON.stringify(applicationCoverage), 'utf8');
  },
});

export { expect };
