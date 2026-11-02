import reportingIntervalMapper from '@/reporting/lib/mappers/reporting-interval.mapper';
import type { IReportingInterval } from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const interval: IReportingInterval = {
  id: 'reporting-interval',
  accountingEntityId: 'entity',
  fiscalYearId: 'year',
  createdBy: 'user',
  createdAt: '2024-02-01T00:00:00.000Z',
  updatedAt: '2024-02-01T00:00:00.000Z',
  unit: 'month',
  count: 2,
  currentPeriodOrdinal: 0,
  startDate: '2024-02-01T00:00:00.000Z',
  endDate: '2024-04-01T00:00:00.000Z',
  nextPeriodStartDate: '2024-03-01T00:00:00.000Z',
  periods: [
    {
      id: 'february',
      intervalId: 'reporting-interval',
      accountingEntityId: 'entity',
      createdBy: 'user',
      createdAt: '2024-02-01T00:00:00.000Z',
      updatedAt: '2024-02-01T00:00:00.000Z',
      ordinal: 0,
      name: 'February',
      startDate: '2024-02-01T00:00:00.000Z',
      endDate: '2024-03-01T00:00:00.000Z',
    },
    {
      id: 'march',
      intervalId: 'reporting-interval',
      accountingEntityId: 'entity',
      createdBy: 'user',
      createdAt: '2024-02-01T00:00:00.000Z',
      updatedAt: '2024-02-01T00:00:00.000Z',
      ordinal: 9,
      name: 'March',
      startDate: '2024-03-01T00:00:00.000Z',
      endDate: '2024-04-01T00:00:00.000Z',
    },
  ],
};

describe('reportingIntervalMapper', () => {
  it('maps only shared interval fields with inclusive local dates and preserves period order and ordinal zero', () => {
    const original = structuredClone(interval);
    expect(reportingIntervalMapper.toInterval(interval)).toEqual({
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2024, 2, 31),
      currentPeriodOrdinal: 0,
      periods: [
        {
          ordinal: 0,
          name: 'February',
          startDate: new Date(2024, 1, 1),
          endDate: new Date(2024, 1, 29),
        },
        {
          ordinal: 9,
          name: 'March',
          startDate: new Date(2024, 2, 1),
          endDate: new Date(2024, 2, 31),
        },
      ],
    });
    expect(interval).toEqual(original);
  });

  it.each([
    {
      name: 'year rollover',
      start: '2025-12-01T00:00:00.000Z',
      end: '2026-01-01T00:00:00.000Z',
      startDate: new Date(2025, 11, 1),
      endDate: new Date(2025, 11, 31),
    },
    {
      name: 'leap-day single-day range',
      start: '2024-02-29T00:00:00.000Z',
      end: '2024-03-01T00:00:00.000Z',
      startDate: new Date(2024, 1, 29),
      endDate: new Date(2024, 1, 29),
    },
    {
      name: 'daylight saving transition',
      start: '2026-03-08T00:00:00.000Z',
      end: '2026-03-09T00:00:00.000Z',
      startDate: new Date(2026, 2, 8),
      endDate: new Date(2026, 2, 8),
    },
    {
      name: 'non-midnight exclusive end',
      start: '2026-04-01T00:00:00.000Z',
      end: '2026-04-01T12:00:00.000Z',
      startDate: new Date(2026, 3, 1),
      endDate: new Date(2026, 3, 1),
    },
    {
      name: 'offset timestamps normalized to UTC days',
      start: '2026-02-28T22:00:00.000-02:00',
      end: '2026-04-01T01:00:00.000+01:00',
      startDate: new Date(2026, 2, 1),
      endDate: new Date(2026, 2, 31),
    },
  ])(
    'maps $name for both the interval and its periods',
    ({ start, end, startDate, endDate }) => {
      expect(
        reportingIntervalMapper.toInterval({
          ...interval,
          count: 1,
          startDate: start,
          endDate: end,
          periods: [{ ...interval.periods[0], startDate: start, endDate: end }],
        })
      ).toEqual({
        startDate,
        endDate,
        currentPeriodOrdinal: 0,
        periods: [{ ordinal: 0, name: 'February', startDate, endDate }],
      });
    }
  );

  it('preserves an unavailable current ordinal and empty periods for the shared selector fallback', () => {
    expect(
      reportingIntervalMapper.toInterval({
        ...interval,
        periods: [],
        currentPeriodOrdinal: 99,
      })
    ).toEqual({
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2024, 2, 31),
      currentPeriodOrdinal: 99,
      periods: [],
    });
  });
});
