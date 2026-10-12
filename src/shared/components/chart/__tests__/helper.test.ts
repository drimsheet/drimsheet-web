import chartHelpers from '@/shared/components/chart/helper';
import { describe, expect, it } from 'vitest';

describe('chartHelpers', () => {
  const config = { moneyIn: { label: 'Money in', color: 'var(--chart-1)' } };
  it('resolves both nested and direct Recharts series labels', () => {
    expect(
      chartHelpers.getPayloadConfig(config, { dataKey: 'moneyIn' }, 'dataKey')
    ).toBe(config.moneyIn);
    expect(
      chartHelpers.getPayloadConfig(
        config,
        { payload: { name: 'moneyIn' } },
        'name'
      )
    ).toBe(config.moneyIn);
    expect(chartHelpers.getPayloadConfig(config, {}, 'moneyIn')).toBe(
      config.moneyIn
    );
    expect(
      chartHelpers.getPayloadConfig(config, null, 'moneyIn')
    ).toBeUndefined();
  });
  it('scopes chart colors and supports theme-specific series', () => {
    const css = chartHelpers.createStyles('example', {
      ...config,
      moneyOut: { theme: { light: 'gray', dark: 'silver' } },
    });

    expect(css).toContain('[data-chart="example"]');
    expect(css).toContain('--color-moneyIn: var(--chart-1)');
    expect(css).toContain('--color-moneyOut: gray');
    expect(css).toContain('.dark [data-chart="example"]');
    expect(css).toContain('--color-moneyOut: silver');
  });
});
