import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkHooks } from './check-hooks.js';

const roots = [];

function fixture(source, extra = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hook-check-'));
  roots.push(root);
  const files = {
    'src/account/hooks/use-accounts.ts': source,
    'src/account/lib/services/account.service.ts':
      'export const accountService = { getAccounts() {}, getSummary() {} };',
    ...extra,
  };
  for (const [file, text] of Object.entries(files)) {
    const name = path.join(root, file);
    fs.mkdirSync(path.dirname(name), { recursive: true });
    fs.writeFileSync(name, text);
  }
  return root;
}

const imports = `
import { accountService } from '@/account/lib/services/account.service';
import { useQuery, useInfiniteQuery, useQueries } from '@tanstack/react-query';
`;

function query(key, fn = '() => accountService.getAccounts()') {
  return `${imports}\nexport function useAccounts() {
    return useQuery({ queryKey: ${key}, queryFn: ${fn} });
  }`;
}

afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, { recursive: true, force: true });
});

describe('one hook per file', () => {
  it.each([
    ['export function useOne() {}', 0],
    ['export function useOne() {} function useTwo() {}', 1],
  ])('enforces the rules through the CLI (%#)', (source, status) => {
    const result = spawnSync(
      process.execPath,
      [path.resolve('scripts/check-hooks.js')],
      {
        cwd: fixture(source),
        encoding: 'utf8',
      }
    );
    expect(result.status).toBe(status);
    expect(result.stdout + result.stderr).toContain(
      status ? 'one-hook-per-file:' : 'Hook checks passed.'
    );
  });

  it.each([
    'export function useFirst() {} function useSecond() {}',
    'const useFirst = () => {}; export const useSecond = function () {};',
    'export default function useFirst() { function usePrivate() {} }',
    'function useFirst() {} const useSecond = useFirst;',
    'export const hooks = { useFirst() {}, useSecond: () => {} };',
  ])('rejects multiple hook definitions: %s', (source) => {
    expect(checkHooks(fixture(source))).toEqual([
      expect.stringMatching(
        /src[/\\]account[/\\]hooks[/\\]use-accounts.ts:\d+:\d+ one-hook-per-file:/
      ),
    ]);
  });

  it('ignores calls, key constants, overload signatures, and test/story fixtures', () => {
    const root = fixture(
      `
      import { useState } from 'react';
      const useAccountsQueryKey = ['accountService', 'getAccounts'];
      export function useAccounts(id: string): unknown;
      export function useAccounts(id: number): unknown;
      export function useAccounts(id: unknown) { return useState(id); }
    `,
      {
        'src/account/hooks/__tests__/fixture.ts':
          'function useOne() {} function useTwo() {}',
        'src/account/hooks/use-fixture.test.tsx':
          'function useOne() {} function useTwo() {}',
        'src/account/components/__stories__/fixture.tsx':
          'function useOne() {} function useTwo() {}',
      }
    );
    expect(checkHooks(root)).toEqual([]);
  });

  it('checks component-local and private page hooks as well as feature hooks', () => {
    const root = fixture('', {
      'src/account/pages/details/hooks/use-details.ts':
        'function useOne() {} function useTwo() {}',
      'src/shared/components/example/use-example.tsx':
        'function useOne() {} function useTwo() {}',
    });
    expect(checkHooks(root)).toHaveLength(2);
  });
});

describe('service/method query keys', () => {
  it.each([
    "['accountService', 'dashboard', 'accounts', query]",
    "['wrongService', 'getAccounts']",
    "['accountService', 'getSummary']",
    "['accountService']",
    "['accountService', runtimeMethod]",
    "[...unknownPrefix, 'accountService', 'getAccounts']",
  ])('rejects a wrong or unverifiable prefix: %s', (key) => {
    const errors = checkHooks(fixture(query(key)));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('query-key:');
  });

  it.each([
    "['accountService', 'getAccounts', query]",
    "['accountService', 'getAccounts', id, query, 'all-pages'] as const",
    "['accountService', 'getAccounts', query, 'infinite']",
    "['accountService', 'getAccounts', id, 'update'] satisfies readonly unknown[]",
    "['accountService', 'getAccounts', ...(scope ? [scope] : [])]",
  ])('accepts arguments and cache discriminators: %s', (key) => {
    expect(checkHooks(fixture(query(key)))).toEqual([]);
  });

  it('resolves imported/re-exported keys, factory parameters, spread prefixes, and service aliases', () => {
    const root = fixture(
      `
      import { accountService as ledger } from '@/account/lib/services/account.service';
      import { key } from '../lib/configs';
      import { useQuery as useRead } from '@tanstack/react-query';
      export const useAccounts = () => useRead({
        queryKey: [...key('getAccounts'), id, 'update'],
        queryFn: ledger['getAccounts'],
      });
    `,
      {
        'src/account/lib/configs/index.ts': "export { key } from './keys';",
        'src/account/lib/configs/keys.ts': `
        const prefix = Object.freeze(['accountService'] as const);
        export const key = (method: string) => [...prefix, method] as const;
      `,
      }
    );
    expect(checkHooks(root)).toEqual([]);
  });

  it('rejects a wrong prefix concealed in an imported constant', () => {
    const root = fixture(
      `${imports}
      import { key } from '../lib/configs/keys';
      export const useAccounts = () => useQuery({ queryKey: key, queryFn: accountService.getAccounts });
    `,
      {
        'src/account/lib/configs/keys.ts':
          "export const key = ['accountService', 'accounts'] as const;",
      }
    );
    expect(checkHooks(root)).toEqual([
      expect.stringContaining('Expected ["accountService", "getAccounts"'),
    ]);
  });

  it('checks spread query options and overridden keys', () => {
    const root = fixture(
      `${imports}
      import { options } from '../lib/configs/options';
      export const useAccounts = () => useQuery({ ...options, queryKey: ['accountService', 'summary'] });
    `,
      {
        'src/account/lib/configs/options.ts': `${imports}
        export const options = { queryKey: ['accountService', 'getAccounts'], queryFn: accountService.getAccounts };
      `,
      }
    );
    expect(checkHooks(root)).toEqual([
      expect.stringContaining('Expected ["accountService", "getAccounts"'),
    ]);
  });

  it('accepts imported option factories and shorthand query functions', () => {
    const root = fixture(
      `${imports}
      import { options } from '../lib/configs/options';
      export const useAccounts = () => useQuery(options(id));
    `,
      {
        'src/account/lib/configs/options.ts': `${imports}
        const queryFn = () => accountService.getAccounts();
        export const options = (id: string) => ({ queryKey: ['accountService', 'getAccounts', id], queryFn });
      `,
      }
    );
    expect(checkHooks(root)).toEqual([]);
  });

  it('checks each useQueries entry and infinite query callbacks', () => {
    const root = fixture(
      `${imports}
      export function useAccounts() {
        return useQueries({ queries: statuses.map(status => ({
          queryKey: ['accountService', 'transactionUsage', status],
          queryFn: () => accountService.getAccounts(status),
        })) });
      }
    `,
      {
        'src/account/hooks/use-infinite.ts': `${imports}
        export const useInfiniteAccounts = () => useInfiniteQuery({
          queryKey: ['accountService', 'getAccounts', filter, 'infinite'],
          queryFn: ({ pageParam, signal }) => accountService.getAccounts(filter, pageParam, signal),
        });
      `,
      }
    );
    expect(checkHooks(root)).toEqual([
      expect.stringContaining('Expected ["accountService", "getAccounts"'),
    ]);
  });

  it('allows prefix-only invalidation, cancellation, removal, and cache updates', () => {
    expect(
      checkHooks(
        fixture(`
      function refresh(client, options) {
        client.invalidateQueries({ queryKey: ['accountService'] });
        client.cancelQueries({ queryKey: ['accountService'] });
        client.removeQueries({ queryKey: ['accountService'] });
        client.setQueryData(['accountService', 'getAccounts'], { ...options });
      }
    `)
      )
    ).toEqual([]);
  });

  it.each([
    `${imports} useQuery(loadUnknownOptions());`,
    `${imports} useQueries({ queries: loadUnknownOptions() });`,
    `${imports} useQueries({ queries: [loadUnknownOptions()] });`,
    `${imports} useQueries({ queries: items.map(() => loadUnknownOptions()) });`,
    `${imports} useQuery({ queryKey: ['accountService', 'getAccounts'], queryFn: unknownFetcher });`,
    `${imports} useQuery({ queryKey: ['accountService', 'getAccounts'] });`,
    `${imports} useQuery({ queryKey: ['accountService', 'getAccounts'], queryFn: () => { accountService.getAccounts(); return accountService.getSummary(); } });`,
    `${imports} const key = () => key(); useQuery({ queryKey: key(), queryFn: accountService.getAccounts });`,
  ])('fails closed for unverifiable query options/functions', (source) => {
    expect(checkHooks(fixture(source))).toEqual([
      expect.stringContaining('query-key:'),
    ]);
  });

  it('checks imperative query fetches too', () => {
    expect(
      checkHooks(
        fixture(`${imports}
      client.fetchQuery({ queryKey: ['accountService', 'lookup'], queryFn: accountService.getAccounts });
    `)
      )
    ).toEqual([
      expect.stringContaining('Expected ["accountService", "getAccounts"'),
    ]);
  });

  it('reports each mismatched use of a parameterized options factory', () => {
    const root = fixture(`${imports}
      function options(method: string) {
        return { queryKey: ['accountService', method], queryFn: accountService.getAccounts };
      }
      useQuery(options('getAccounts'));
      useQuery(options('getSummary'));
    `);
    expect(checkHooks(root)).toContainEqual(
      expect.stringContaining('received ["accountService","getSummary"]')
    );
  });
});
