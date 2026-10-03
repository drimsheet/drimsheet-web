import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { afterEach, describe, expect, it } from 'vitest';

const scriptPath = path.resolve('scripts/sync-error-keys.js');
const fixtureRoots = [];

function runSync(sourceKeys, translations, { fetchFails = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-error-keys-'));
  fixtureRoots.push(root);
  const translationPath = path.join(
    root,
    'src/shared/i18n/locales/en/api-errors.json'
  );
  fs.mkdirSync(path.dirname(translationPath), { recursive: true });
  const originalContent = JSON.stringify(translations, null, 2) + '\n';
  fs.writeFileSync(translationPath, originalContent);

  const fetchStub = `globalThis.fetch = async () => ({
    ok: ${!fetchFails},
    status: ${fetchFails ? 503 : 200},
    statusText: 'Test response',
    json: async () => (${JSON.stringify(sourceKeys)})
  });`;
  const result = spawnSync(
    process.execPath,
    [
      '--import',
      `data:text/javascript,${encodeURIComponent(fetchStub)}`,
      scriptPath,
    ],
    {
      cwd: root,
      encoding: 'utf-8',
      timeout: 10000,
      env: { ...process.env, GITHUB_TOKEN: '' },
    }
  );

  const content = fs.readFileSync(translationPath, 'utf-8');
  return {
    ...result,
    content,
    originalContent,
    translations: JSON.parse(content),
  };
}

afterEach(() => {
  for (const root of fixtureRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe('sync:errors', () => {
  it('removes obsolete keys without adding keys and preserves active translations', () => {
    const result = runSync(['active_error'], {
      active_error: 'Existing translation.',
      removed_error: '',
    });

    expect(result.status).toBe(0);
    expect(result.translations).toEqual({
      active_error: 'Existing translation.',
    });
    expect(result.stdout).toContain('Removed 1 obsolete error key(s)');
    expect(result.stdout).not.toContain('Added');
  });

  it('saves additions and removals before failing for missing translations', () => {
    const result = runSync(['active_error', 'new_error'], {
      active_error: 'Existing translation.',
      removed_error: 'Obsolete translation.',
    });

    expect(result.status).toBe(1);
    expect(result.translations).toEqual({
      active_error: 'Existing translation.',
      new_error: '',
    });
    expect(result.stdout).toContain('Added 1 new error key(s)');
    expect(result.stdout).toContain('Removed 1 obsolete error key(s)');
    expect(result.stderr).toContain('  - new_error');
    expect(result.stderr).not.toContain('removed_error');
  });

  it('removes every translation when the source has no keys', () => {
    const result = runSync([], { removed_error: 'Obsolete translation.' });

    expect(result.status).toBe(0);
    expect(result.translations).toEqual({});
  });

  it('leaves an already synchronized file unchanged', () => {
    const result = runSync(['active_error'], {
      active_error: 'Existing translation.',
    });

    expect(result.status).toBe(0);
    expect(result.content).toBe(result.originalContent);
    expect(result.stdout).not.toContain('Removed');
    expect(result.stdout).not.toContain('Added');
  });

  it.each([
    { sourceKeys: { invalid: true }, fetchFails: false },
    { sourceKeys: [], fetchFails: true },
  ])(
    'preserves translations when the source cannot be read: %j',
    (scenario) => {
      const result = runSync(
        scenario.sourceKeys,
        { active_error: 'Existing translation.' },
        { fetchFails: scenario.fetchFails }
      );

      expect(result.status).toBe(1);
      expect(result.content).toBe(result.originalContent);
    }
  );
});
