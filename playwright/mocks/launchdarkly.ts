import {
  featureFlagKeys,
  type UFeatureFlagKey,
} from '@/shared/hooks/use-feature-flag';
import type { Page } from '@playwright/test';

export type TLaunchDarklyFlagValues = Record<UFeatureFlagKey, boolean>;

export const defaultLaunchDarklyFlagValues: TLaunchDarklyFlagValues = {
  [featureFlagKeys.accessAlpha1]: true,
};

function makeFlagEvaluationResponse(flagValues: TLaunchDarklyFlagValues) {
  return Object.fromEntries(
    Object.entries(flagValues).map(([flagKey, value]) => [
      flagKey,
      {
        version: 1,
        variation: value ? 0 : 1,
        value,
        trackEvents: false,
      },
    ])
  );
}

export async function registerLaunchDarklyRoutes(
  page: Page,
  flagValues: TLaunchDarklyFlagValues
) {
  await page.route('https://clientsdk.launchdarkly.com/**', async (route) => {
    const url = route.request().url();

    if (url.includes('/sdk/goals/')) {
      await route.fulfill({ json: [] });

      return;
    }

    await route.fulfill({
      json: makeFlagEvaluationResponse(flagValues),
    });
  });

  await page.route('https://events.launchdarkly.com/**', async (route) => {
    await route.fulfill({ status: 202 });
  });

  await page.route('https://stream.launchdarkly.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: 'event: ping\ndata: {}\n\n',
    });
  });
}
