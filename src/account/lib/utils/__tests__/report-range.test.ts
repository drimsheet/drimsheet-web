import reportRangeUtils from '@/account/lib/utils/report-range';
import { describe, expect, it } from 'vitest';

describe('reportRangeUtils', () => {
  it('keeps chart bucket counts readable for arbitrary ranges, including a single day', () => {
    expect(
      reportRangeUtils.bucketDays({
        from: '2026-01-01',
        to: '2026-01-01',
      })
    ).toBe(1);
    expect(
      reportRangeUtils.bucketDays({
        from: '2026-10-01',
        to: '2026-10-31',
      })
    ).toBe(3);
    expect(
      reportRangeUtils.bucketDays({
        from: '2026-01-01',
        to: '2026-12-31',
      })
    ).toBe(31);
  });
});
