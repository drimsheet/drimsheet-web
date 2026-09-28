import fs from 'fs';
import os from 'os';
import path from 'path';

import { afterEach, describe, expect, it } from 'vitest';

import { findMissingStories } from './check-stories.js';

const fixtureRoots = [];

function createComponentFixture(name = 'example') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stories-check-'));
  const srcPath = path.join(root, 'src');
  const componentPath = path.join(srcPath, 'feature', 'components', name);
  fixtureRoots.push(root);
  fs.mkdirSync(componentPath, { recursive: true });

  return { componentPath, srcPath };
}

afterEach(() => {
  for (const root of fixtureRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe('findMissingStories', () => {
  it('accepts a root component story in __stories__', () => {
    const { componentPath, srcPath } = createComponentFixture();
    fs.writeFileSync(path.join(componentPath, 'example.tsx'), 'export {};\n');
    fs.mkdirSync(path.join(componentPath, '__stories__'));
    fs.writeFileSync(
      path.join(componentPath, '__stories__', 'example.stories.tsx'),
      'export default {};\n'
    );

    expect(findMissingStories(srcPath)).toEqual([]);
  });

  it('accepts a private part story in the mirrored support path', () => {
    const { componentPath, srcPath } = createComponentFixture();
    fs.mkdirSync(path.join(componentPath, 'parts'));
    fs.mkdirSync(path.join(componentPath, '__stories__', 'parts'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(componentPath, 'parts', 'detail.tsx'),
      'export {};\n'
    );
    fs.writeFileSync(
      path.join(componentPath, '__stories__', 'parts', 'detail.stories.tsx'),
      'export default {};\n'
    );

    expect(findMissingStories(srcPath)).toEqual([]);
  });

  it('accepts one aggregate story for the shared icon set', () => {
    const { componentPath, srcPath } = createComponentFixture('icons');
    fs.writeFileSync(path.join(componentPath, 'google.tsx'), 'export {};\n');
    fs.mkdirSync(path.join(componentPath, '__stories__'));
    fs.writeFileSync(
      path.join(componentPath, '__stories__', 'icons.stories.tsx'),
      'export default {};\n'
    );

    expect(findMissingStories(srcPath)).toEqual([]);
  });

  it('reports a component with no canonical story', () => {
    const { componentPath, srcPath } = createComponentFixture();
    const sourcePath = path.join(componentPath, 'example.tsx');
    fs.writeFileSync(sourcePath, 'export {};\n');

    expect(findMissingStories(srcPath)).toEqual([sourcePath]);
  });

  it('does not accept a legacy file-adjacent story', () => {
    const { componentPath, srcPath } = createComponentFixture();
    const sourcePath = path.join(componentPath, 'example.tsx');
    fs.writeFileSync(sourcePath, 'export {};\n');
    fs.writeFileSync(
      path.join(componentPath, 'example.stories.tsx'),
      'export default {};\n'
    );

    expect(findMissingStories(srcPath)).toEqual([sourcePath]);
  });
});

describe('findMissingStories page owners', () => {
  function createPageFixture(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'page-stories-'));
    fixtureRoots.push(root);
    const srcPath = path.join(root, 'src');
    const pagePath = path.join(srcPath, 'feature', 'pages', 'example');
    for (const [name, content] of Object.entries(files)) {
      const filePath = path.join(pagePath, name);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
    }
    return { srcPath, pagePath };
  }

  it('exempts page entries, containers, hooks, and tests', () => {
    const { srcPath } = createPageFixture({
      'example.page.tsx': 'export function ExamplePage() {}',
      'parts/table.container.tsx': 'export function TableContainer() {}',
      'hooks/use-example.ts': 'export function useExample() {}',
      '__tests__/parts/table.container.test.tsx': 'export {};',
    });
    expect(findMissingStories(srcPath)).toEqual([]);
  });

  it.each(['error', 'skeleton', 'details'])(
    'requires a mirrored story for the %s part',
    (name) => {
      const { srcPath, pagePath } = createPageFixture({
        [`parts/${name}.tsx`]: 'export {};',
        [`parts/${name}.stories.tsx`]: 'export default {};',
        [`__stories__/${name}.stories.tsx`]: 'export default {};',
      });
      expect(findMissingStories(srcPath)).toEqual([
        path.join(pagePath, 'parts', `${name}.tsx`),
      ]);
      fs.mkdirSync(path.join(pagePath, '__stories__', 'parts'));
      fs.writeFileSync(
        path.join(pagePath, '__stories__', 'parts', `${name}.stories.tsx`),
        'export default {};'
      );
      expect(findMissingStories(srcPath)).toEqual([]);
    }
  );

  it('does not treat Playwright pages as application UI owners', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'playwright-pages-'));
    fixtureRoots.push(root);
    fs.mkdirSync(path.join(root, 'playwright', 'pages'), { recursive: true });
    fs.writeFileSync(
      path.join(root, 'playwright', 'pages', 'example.ts'),
      'export class ExamplePage {}'
    );
    expect(findMissingStories(path.join(root, 'src'))).toEqual([]);
  });
});

describe('findMissingStories dialog owners', () => {
  function createDialogFixture(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dialog-stories-'));
    fixtureRoots.push(root);
    const srcPath = path.join(root, 'src');
    const dialogPath = path.join(srcPath, 'feature', 'dialogs', 'example');
    for (const [name, content] of Object.entries(files)) {
      const filePath = path.join(dialogPath, name);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
    }
    return { srcPath, dialogPath };
  }

  it('exempts dialog entries, containers, hooks, and tests', () => {
    const { srcPath } = createDialogFixture({
      'example.dialog.tsx': 'export function ExampleDialog() {}',
      'parts/table.container.tsx': 'export function TableContainer() {}',
      'hooks/use-example.ts': 'export function useExample() {}',
      '__tests__/parts/table.container.test.tsx': 'export {};',
    });
    expect(findMissingStories(srcPath)).toEqual([]);
  });

  it.each(['error', 'skeleton', 'details'])(
    'requires a mirrored story for the %s part',
    (name) => {
      const { srcPath, dialogPath } = createDialogFixture({
        [`parts/${name}.tsx`]: 'export {};',
        [`parts/${name}.stories.tsx`]: 'export default {};',
        [`__stories__/${name}.stories.tsx`]: 'export default {};',
      });
      expect(findMissingStories(srcPath)).toEqual([
        path.join(dialogPath, 'parts', `${name}.tsx`),
      ]);
      fs.mkdirSync(path.join(dialogPath, '__stories__', 'parts'));
      fs.writeFileSync(
        path.join(dialogPath, '__stories__', 'parts', `${name}.stories.tsx`),
        'export default {};'
      );
      expect(findMissingStories(srcPath)).toEqual([]);
    }
  );

  it('does not treat Playwright dialogs as application UI owners', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'playwright-dialogs-'));
    fixtureRoots.push(root);
    fs.mkdirSync(path.join(root, 'playwright', 'dialogs'), { recursive: true });
    fs.writeFileSync(
      path.join(root, 'playwright', 'dialogs', 'example.ts'),
      'export class ExampleDialog {}'
    );
    expect(findMissingStories(path.join(root, 'src'))).toEqual([]);
  });
});
