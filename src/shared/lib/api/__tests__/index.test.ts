import { configureDrimsheetApi, drimsheetApi } from '@/shared/lib/api';
import { isValidUUID } from '@/shared/lib/utils/uuid';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';

describe('drimsheetApi request correlation', () => {
  afterEach(() => {
    configureDrimsheetApi({});
  });

  it('generates a distinct valid correlation ID for every Core request', async () => {
    const requests: InternalAxiosRequestConfig[] = [];

    const adapter: AxiosAdapter = async (config) => {
      requests.push(config);

      return {
        config,
        data: {},
        headers: {},
        status: 200,
        statusText: 'OK',
      };
    };

    await drimsheetApi.instance.get('/first', {
      adapter,
      headers: { 'x-correlation-id': 'caller-controlled-value' },
    });
    await drimsheetApi.instance.get('/second', { adapter });

    const correlationIds = requests.map(
      (request) => request.headers['x-correlation-id']
    );

    expect(correlationIds).toHaveLength(2);
    expect(correlationIds.every(isValidUUID)).toBe(true);
    expect(correlationIds[0]).not.toBe(correlationIds[1]);
    expect(correlationIds).not.toContain('caller-controlled-value');
  });
});
