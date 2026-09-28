import fs from 'fs';
import os from 'os';
import path from 'path';

import { afterEach, describe, expect, it } from 'vitest';

import { checkStructure } from './check-structure.js';

const fixtureRoots = [];

function createFixture({
  helperSource,
  helperTest = true,
  indexSource = "export { Example } from './example';\n",
  legacyHelper = false,
  misnamedHelper = false,
} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'structure-check-'));
  const componentPath = path.join(
    root,
    'src',
    'feature',
    'components',
    'example'
  );
  fixtureRoots.push(root);
  fs.mkdirSync(componentPath, { recursive: true });
  fs.writeFileSync(path.join(componentPath, 'index.ts'), indexSource);

  if (helperSource !== undefined) {
    fs.writeFileSync(path.join(componentPath, 'helper.ts'), helperSource);
  }

  if (helperTest) {
    const testsPath = path.join(componentPath, '__tests__');
    fs.mkdirSync(testsPath, { recursive: true });
    fs.writeFileSync(
      path.join(testsPath, 'helper.test.ts'),
      "import exampleHelpers from '@/feature/components/example/helper';\nvoid exampleHelpers;\n"
    );
  }

  if (legacyHelper) {
    const legacyPath = path.join(componentPath, 'helpers');
    fs.mkdirSync(legacyPath);
    fs.writeFileSync(
      path.join(legacyPath, 'get-example-value.helper.ts'),
      'export default function getExampleValue() {}\n'
    );
  }

  if (misnamedHelper) {
    fs.writeFileSync(
      path.join(componentPath, 'get-example-value.helper.ts'),
      'export default function getExampleValue() {}\n'
    );
  }

  return root;
}

afterEach(() => {
  for (const root of fixtureRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

function createPageFixture(files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'page-structure-'));
  fixtureRoots.push(root);
  const sources = {
    'src/feature/pages/example/example.page.tsx':
      'export function ExamplePage() { return null; }',
    'src/feature/pages/example/index.ts':
      "export { ExamplePage } from './example.page';",
    ...files,
  };
  for (const [name, content] of Object.entries(sources)) {
    if (content === null) continue;
    const filePath = path.join(root, name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }
  return root;
}

describe('checkStructure page owners', () => {
  it('accepts a page with private parts, mirrored support, hooks, and helpers', () => {
    const root = createPageFixture({
      'src/feature/pages/example/example.page.tsx':
        "import { Details } from './parts/details'; export function ExamplePage() { return <Details />; }",
      'src/feature/pages/example/parts/details.tsx':
        "import type { DetailsProps } from '../types'; export function Details(_props: DetailsProps) { return null; }",
      'src/feature/pages/example/types.ts': 'export interface DetailsProps {}',
      'src/feature/pages/example/__stories__/parts/details.stories.tsx':
        "import { Details } from '@/feature/pages/example/parts/details'; export default { component: Details };",
      'src/feature/pages/example/__tests__/parts/details.test.tsx':
        "import { Details } from '@/feature/pages/example/parts/details'; void Details;",
      'src/feature/pages/example/hooks/use-example.ts':
        'export function useExample() {}',
      'src/feature/pages/example/hooks/__tests__/use-example.test.ts':
        "import { useExample } from '../use-example'; void useExample;",
      'src/feature/pages/example/helper.ts':
        'const exampleHelpers = Object.freeze({}); export default exampleHelpers;',
      'src/feature/pages/example/__tests__/helper.test.ts':
        "import helpers from '../helper'; void helpers;",
      'src/feature/routes/example.tsx':
        "import { ExamplePage } from '@/feature/pages/example'; void ExamplePage;",
      'playwright/pages/example.ts': 'export class ExamplePage {}',
    });
    expect(checkStructure(root)).toEqual([]);
  });

  it('rejects flat pages and requires a matching entry and barrel', () => {
    const root = createPageFixture({
      'src/feature/pages/flat.tsx': 'export function FlatPage() {}',
      'src/feature/pages/example/example.page.tsx': null,
      'src/feature/pages/example/index.ts': null,
      'src/feature/pages/example/wrong.page.tsx':
        'export function ExamplePage() {}',
    });
    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Move flat page'),
        expect.stringContaining('Add matching page entry'),
        expect.stringContaining('Add page public entry point'),
        expect.stringContaining('Use matching page entry'),
      ])
    );
  });

  it.each([
    "export * from './example.page';",
    "export { Details } from './parts/details';",
    "export type { DetailsProps } from './types';",
    "import { Details } from './parts/details'; export { Details as ExamplePage };",
    "export { ExamplePage, helper } from './example.page';",
    "export { ExamplePage } from './example.page'; export { default as helper } from './helper';",
  ])('rejects a page barrel that exposes support code: %s', (indexSource) => {
    const root = createPageFixture({
      'src/feature/pages/example/index.ts': indexSource,
    });
    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Export only the page component'),
      ])
    );
  });

  it('rejects private barrels, misplaced UI, and logic in parts', () => {
    const root = createPageFixture({
      'src/feature/pages/example/parts/index.ts': 'export {};',
      'src/feature/pages/example/hooks/index.ts': 'export {};',
      'src/feature/pages/example/error.tsx': 'export function ErrorView() {}',
      'src/feature/pages/example/parts/use-example.ts':
        'export function useExample() {}',
    });
    const errors = checkStructure(root);
    expect(
      errors.filter((error) => error.includes('Remove private page barrel'))
    ).toHaveLength(2);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Move private page UI into parts'),
        expect.stringContaining('Keep page parts for UI'),
      ])
    );
  });

  it('rejects misplaced and incorrectly mirrored support artifacts', () => {
    const root = createPageFixture({
      'src/feature/pages/example/parts/details.tsx': 'export {};',
      'src/feature/pages/example/parts/__tests__/details.test.tsx':
        'export {};',
      'src/feature/pages/example/parts/details.stories.tsx':
        'export default {};',
      'src/feature/pages/example/__stories__/details.stories.tsx':
        'export default {};',
      'src/feature/pages/example/__tests__/details.test.tsx': 'export {};',
    });
    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Place page test'),
        expect.stringContaining('Place page story'),
        expect.stringContaining('Mirror page support artifact'),
      ])
    );
  });

  it('applies the consolidated helper contract to pages', () => {
    const root = createPageFixture({
      'src/feature/pages/example/helper.ts': 'export const value = true;',
      'src/feature/pages/example/helpers/value.helper.ts':
        'export const value = true;',
    });
    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Replace page helpers directory'),
        expect.stringContaining('Rename page helper'),
        expect.stringContaining('Add consolidated page helper test'),
        expect.stringContaining('Expose exactly one default helper object'),
      ])
    );
  });

  it.each([
    'export default function exampleHelpers() {}',
    'const exampleHelpers = {}; export default exampleHelpers;',
    'const wrongHelpers = Object.freeze({}); export default wrongHelpers;',
  ])(
    'rejects a page helper without its named frozen object: %s',
    (helperSource) => {
      const root = createPageFixture({
        'src/feature/pages/example/helper.ts': helperSource,
        'src/feature/pages/example/__tests__/helper.test.ts': 'export {};',
      });
      expect(checkStructure(root)).toEqual([
        expect.stringContaining('Export a frozen <pageName>Helpers object'),
      ]);
    }
  );

  it.each([
    "import { Details } from '@/feature/pages/example/parts/details';",
    "import type { Props } from '../pages/example/types';",
    "export { default as helpers } from '../pages/example/helper.ts';",
    "export * from '@/feature/pages/example/hooks/use-example';",
    "const page = import('../pages/example/example.page');",
    "type Props = import('@/feature/pages/example/types').Props;",
    "const helpers = require('@/feature/pages/example/helper');",
    'const part = import(`@/feature/pages/example/parts/details`);',
  ])('rejects external references to private page modules: %s', (source) => {
    const root = createPageFixture({
      'src/feature/routes/example.tsx': source,
    });
    expect(checkStructure(root)).toEqual([
      expect.stringContaining('Keep page implementations private'),
    ]);
  });

  it('rejects imports from another page even with a shared directory prefix', () => {
    const root = createPageFixture({
      'src/feature/pages/example-two/example-two.page.tsx':
        "import { Details } from '../example/parts/details'; export function ExampleTwoPage() { return <Details />; }",
      'src/feature/pages/example-two/index.ts':
        "export { ExampleTwoPage } from './example-two.page';",
    });
    expect(checkStructure(root)).toEqual([
      expect.stringContaining('Keep page implementations private'),
    ]);
  });

  it.each(['@/feature/pages/example', '../../pages/example/index.ts'])(
    'prevents feature components from importing public pages: %s',
    (specifier) => {
      const root = createPageFixture({
        'src/feature/components/example/index.ts':
          "export { Example } from './example';",
        'src/feature/components/example/example.tsx': `import { ExamplePage } from '${specifier}'; export const Example = ExamplePage;`,
      });
      expect(checkStructure(root)).toEqual([
        expect.stringContaining('Components must not import pages'),
      ]);
    }
  );
});

describe('checkStructure component helpers', () => {
  const validHelperSource = `
function getValue() {
  return 'value';
}

const exampleHelpers = Object.freeze({ getValue });

export default exampleHelpers;
`;

  it('accepts one consolidated helper module and matching test', () => {
    const root = createFixture({ helperSource: validHelperSource });

    expect(checkStructure(root)).toEqual([]);
  });

  it('rejects a component helpers directory', () => {
    const root = createFixture({
      helperSource: validHelperSource,
      legacyHelper: true,
    });

    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Replace component helpers directory'),
      ])
    );
  });

  it('rejects an operation-named helper module', () => {
    const root = createFixture({
      helperSource: validHelperSource,
      misnamedHelper: true,
    });

    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Rename component helper'),
      ])
    );
  });

  it('requires one matching helper test', () => {
    const root = createFixture({
      helperSource: validHelperSource,
      helperTest: false,
    });

    expect(checkStructure(root)).toEqual([
      expect.stringContaining('Add consolidated component helper test'),
    ]);
  });

  it('rejects named exports from the helper module', () => {
    const root = createFixture({
      helperSource: `${validHelperSource}\nexport const extra = true;\n`,
    });

    expect(checkStructure(root)).toEqual([
      expect.stringContaining('Expose exactly one default helper object'),
    ]);
  });

  it('rejects helper references from the component barrel', () => {
    const root = createFixture({
      helperSource: validHelperSource,
      indexSource: "export { default as exampleHelpers } from './helper';\n",
    });

    expect(checkStructure(root)).toEqual([
      expect.stringContaining('Keep component helpers and parts private'),
    ]);
  });
});

describe('checkStructure component skeletons', () => {
  it('accepts owner-local skeleton names and semantic variants', () => {
    const root = createFixture({ helperTest: false });
    const componentPath = path.join(
      root,
      'src',
      'feature',
      'components',
      'example'
    );
    fs.mkdirSync(path.join(componentPath, '__tests__'), { recursive: true });
    fs.mkdirSync(path.join(componentPath, '__stories__'), { recursive: true });
    fs.writeFileSync(path.join(componentPath, 'skeleton.tsx'), 'export {};\n');
    fs.writeFileSync(
      path.join(componentPath, 'table-skeleton.tsx'),
      'export {};\n'
    );
    fs.writeFileSync(
      path.join(componentPath, '__tests__', 'skeleton.test.tsx'),
      'export {};\n'
    );
    fs.writeFileSync(
      path.join(componentPath, '__stories__', 'skeleton.stories.tsx'),
      'export default {};\n'
    );

    expect(checkStructure(root)).toEqual([]);
  });

  it('rejects owner-prefixed skeleton names', () => {
    const root = createFixture({ helperTest: false });
    const componentPath = path.join(
      root,
      'src',
      'feature',
      'components',
      'example'
    );
    fs.mkdirSync(path.join(componentPath, '__tests__'), { recursive: true });
    fs.mkdirSync(path.join(componentPath, '__stories__'), { recursive: true });
    fs.writeFileSync(
      path.join(componentPath, 'example-skeleton.tsx'),
      'export {};\n'
    );
    fs.writeFileSync(
      path.join(componentPath, '__tests__', 'example-skeleton.test.tsx'),
      'export {};\n'
    );
    fs.writeFileSync(
      path.join(componentPath, '__stories__', 'example-skeleton.stories.tsx'),
      'export default {};\n'
    );

    expect(checkStructure(root)).toEqual([
      expect.stringContaining('skeleton.tsx'),
      expect.stringContaining('skeleton.test.tsx'),
      expect.stringContaining('skeleton.stories.tsx'),
    ]);
  });
});

describe('checkStructure support directories', () => {
  it('accepts support directories for hooks and lib responsibilities', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'structure-check-'));
    const hooksPath = path.join(root, 'src', 'feature', 'hooks');
    const mappersPath = path.join(root, 'src', 'feature', 'lib', 'mappers');
    fixtureRoots.push(root);
    fs.mkdirSync(path.join(hooksPath, '__tests__'), { recursive: true });
    fs.mkdirSync(path.join(mappersPath, '__tests__'), { recursive: true });
    fs.writeFileSync(path.join(hooksPath, 'use-example.ts'), 'export {};\n');
    fs.writeFileSync(
      path.join(hooksPath, '__tests__', 'use-example.test.ts'),
      'export {};\n'
    );
    fs.writeFileSync(
      path.join(mappersPath, 'example.mapper.ts'),
      'export {};\n'
    );
    fs.writeFileSync(
      path.join(mappersPath, '__tests__', 'example.mapper.test.ts'),
      'export {};\n'
    );

    expect(checkStructure(root)).toEqual([]);
  });

  it('accepts tests and stories in owner-level support directories', () => {
    const root = createFixture({ helperTest: false });
    const componentPath = path.join(
      root,
      'src',
      'feature',
      'components',
      'example'
    );
    fs.mkdirSync(path.join(componentPath, '__tests__', 'parts'), {
      recursive: true,
    });
    fs.mkdirSync(path.join(componentPath, '__stories__', 'parts'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(componentPath, '__tests__', 'parts', 'detail.test.tsx'),
      'export {};\n'
    );
    fs.writeFileSync(
      path.join(componentPath, '__stories__', 'parts', 'detail.stories.tsx'),
      'export default {};\n'
    );

    expect(checkStructure(root)).toEqual([]);
  });

  it('rejects legacy colocated tests and stories', () => {
    const root = createFixture({ helperTest: false });
    const componentPath = path.join(
      root,
      'src',
      'feature',
      'components',
      'example'
    );
    fs.writeFileSync(
      path.join(componentPath, 'example.test.tsx'),
      'export {};\n'
    );
    fs.writeFileSync(
      path.join(componentPath, 'example.stories.tsx'),
      'export default {};\n'
    );

    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("owner's __tests__ directory"),
        expect.stringContaining("owner's __stories__ directory"),
      ])
    );
  });

  it('rejects support artifacts inside production parts', () => {
    const root = createFixture({ helperTest: false });
    const partsPath = path.join(
      root,
      'src',
      'feature',
      'components',
      'example',
      'parts'
    );
    fs.mkdirSync(partsPath, { recursive: true });
    fs.writeFileSync(path.join(partsPath, 'detail.test.tsx'), 'export {};\n');

    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("owner's __tests__ directory"),
      ])
    );
  });

  it('rejects support-directory barrels', () => {
    const root = createFixture({ helperTest: false });
    const testsPath = path.join(
      root,
      'src',
      'feature',
      'components',
      'example',
      '__tests__'
    );
    fs.mkdirSync(testsPath, { recursive: true });
    fs.writeFileSync(path.join(testsPath, 'index.ts'), 'export {};\n');

    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Remove support-directory barrel'),
      ])
    );
  });

  it('rejects empty support directories', () => {
    const root = createFixture({ helperTest: false });
    const storiesPath = path.join(
      root,
      'src',
      'feature',
      'components',
      'example',
      '__stories__'
    );
    fs.mkdirSync(storiesPath, { recursive: true });

    expect(checkStructure(root)).toEqual([
      expect.stringContaining('Remove empty support directory'),
    ]);
  });

  it('rejects stories outside component owners', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'structure-check-'));
    const storiesPath = path.join(
      root,
      'src',
      'feature',
      'hooks',
      '__stories__'
    );
    fixtureRoots.push(root);
    fs.mkdirSync(storiesPath, { recursive: true });
    fs.writeFileSync(
      path.join(storiesPath, 'use-example.stories.tsx'),
      'export default {};\n'
    );

    expect(checkStructure(root)).toEqual([
      expect.stringContaining('Place Storybook files under a component'),
    ]);
  });
});

function createDialogFixture(files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dialog-structure-'));
  fixtureRoots.push(root);
  const sources = {
    'src/feature/dialogs/example/example.dialog.tsx':
      'export function ExampleDialog() { return null; }',
    'src/feature/dialogs/example/index.ts':
      "export { ExampleDialog } from './example.dialog';",
    ...files,
  };
  for (const [name, content] of Object.entries(sources)) {
    if (content === null) continue;
    const filePath = path.join(root, name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }
  return root;
}

describe('checkStructure dialog owners', () => {
  it('accepts a dialog with private parts, mirrored support, hooks, and helpers', () => {
    const root = createDialogFixture({
      'src/feature/dialogs/example/example.dialog.tsx':
        "import { Details } from './parts/details'; export function ExampleDialog() { return <Details />; }",
      'src/feature/dialogs/example/parts/details.tsx':
        "import type { DetailsProps } from '../types'; export function Details(_props: DetailsProps) { return null; }",
      'src/feature/dialogs/example/types.ts':
        'export interface DetailsProps {}',
      'src/feature/dialogs/example/__stories__/parts/details.stories.tsx':
        "import { Details } from '@/feature/dialogs/example/parts/details'; export default { component: Details };",
      'src/feature/dialogs/example/__tests__/parts/details.test.tsx':
        "import { Details } from '@/feature/dialogs/example/parts/details'; void Details;",
      'src/feature/dialogs/example/hooks/use-example.ts':
        'export function useExample() {}',
      'src/feature/dialogs/example/hooks/__tests__/use-example.test.ts':
        "import { useExample } from '../use-example'; void useExample;",
      'src/feature/dialogs/example/helper.ts':
        'const exampleHelpers = Object.freeze({}); export default exampleHelpers;',
      'src/feature/dialogs/example/__tests__/helper.test.ts':
        "import helpers from '../helper'; void helpers;",
      'src/feature/routes/example.tsx':
        "import { ExampleDialog } from '@/feature/dialogs/example'; void ExampleDialog;",
      'playwright/dialogs/example.ts': 'export class ExampleDialog {}',
    });
    expect(checkStructure(root)).toEqual([]);
  });

  it('rejects flat dialogs and requires a matching entry and barrel', () => {
    const root = createDialogFixture({
      'src/feature/dialogs/flat.tsx': 'export function FlatDialog() {}',
      'src/feature/dialogs/example/example.dialog.tsx': null,
      'src/feature/dialogs/example/index.ts': null,
      'src/feature/dialogs/example/wrong.dialog.tsx':
        'export function ExampleDialog() {}',
    });
    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Move flat dialog'),
        expect.stringContaining('Add matching dialog entry'),
        expect.stringContaining('Add dialog public entry point'),
        expect.stringContaining('Use matching dialog entry'),
      ])
    );
  });

  it.each([
    "export * from './example.dialog';",
    "export { Details } from './parts/details';",
    "export type { DetailsProps } from './types';",
    "import { Details } from './parts/details'; export { Details as ExampleDialog };",
    "export { ExampleDialog, helper } from './example.dialog';",
    "export { ExampleDialog } from './example.dialog'; export { default as helper } from './helper';",
  ])('rejects a dialog barrel that exposes support code: %s', (indexSource) => {
    const root = createDialogFixture({
      'src/feature/dialogs/example/index.ts': indexSource,
    });
    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Export only the dialog component'),
      ])
    );
  });

  it('rejects private barrels, misplaced UI, and logic in parts', () => {
    const root = createDialogFixture({
      'src/feature/dialogs/example/parts/index.ts': 'export {};',
      'src/feature/dialogs/example/hooks/index.ts': 'export {};',
      'src/feature/dialogs/example/error.tsx': 'export function ErrorView() {}',
      'src/feature/dialogs/example/parts/use-example.ts':
        'export function useExample() {}',
    });
    const errors = checkStructure(root);
    expect(
      errors.filter((error) => error.includes('Remove private dialog barrel'))
    ).toHaveLength(2);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Move private dialog UI into parts'),
        expect.stringContaining('Keep dialog parts for UI'),
      ])
    );
  });

  it('rejects misplaced and incorrectly mirrored support artifacts', () => {
    const root = createDialogFixture({
      'src/feature/dialogs/example/parts/details.tsx': 'export {};',
      'src/feature/dialogs/example/parts/__tests__/details.test.tsx':
        'export {};',
      'src/feature/dialogs/example/parts/details.stories.tsx':
        'export default {};',
      'src/feature/dialogs/example/__stories__/details.stories.tsx':
        'export default {};',
      'src/feature/dialogs/example/__tests__/details.test.tsx': 'export {};',
    });
    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Place dialog test'),
        expect.stringContaining('Place dialog story'),
        expect.stringContaining('Mirror dialog support artifact'),
      ])
    );
  });

  it('applies the consolidated helper contract to dialogs', () => {
    const root = createDialogFixture({
      'src/feature/dialogs/example/helper.ts': 'export const value = true;',
      'src/feature/dialogs/example/helpers/value.helper.ts':
        'export const value = true;',
    });
    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Replace dialog helpers directory'),
        expect.stringContaining('Rename dialog helper'),
        expect.stringContaining('Add consolidated dialog helper test'),
        expect.stringContaining('Expose exactly one default helper object'),
      ])
    );
  });

  it.each([
    'export default function exampleHelpers() {}',
    'const exampleHelpers = {}; export default exampleHelpers;',
    'const wrongHelpers = Object.freeze({}); export default wrongHelpers;',
  ])(
    'rejects a dialog helper without its named frozen object: %s',
    (helperSource) => {
      const root = createDialogFixture({
        'src/feature/dialogs/example/helper.ts': helperSource,
        'src/feature/dialogs/example/__tests__/helper.test.ts': 'export {};',
      });
      expect(checkStructure(root)).toEqual([
        expect.stringContaining('Export a frozen <dialogName>Helpers object'),
      ]);
    }
  );

  it.each([
    "import { Details } from '@/feature/dialogs/example/parts/details';",
    "import type { Props } from '../dialogs/example/types';",
    "export { default as helpers } from '../dialogs/example/helper.ts';",
    "export * from '@/feature/dialogs/example/hooks/use-example';",
    "const dialog = import('../dialogs/example/example.dialog');",
    "type Props = import('@/feature/dialogs/example/types').Props;",
    "const helpers = require('@/feature/dialogs/example/helper');",
    'const part = import(`@/feature/dialogs/example/parts/details`);',
  ])('rejects external references to private dialog modules: %s', (source) => {
    const root = createDialogFixture({
      'src/feature/routes/example.tsx': source,
    });
    expect(checkStructure(root)).toEqual([
      expect.stringContaining('Keep dialog implementations private'),
    ]);
  });

  it('rejects imports from another dialog even with a shared directory prefix', () => {
    const root = createDialogFixture({
      'src/feature/dialogs/example-two/example-two.dialog.tsx':
        "import { Details } from '../example/parts/details'; export function ExampleTwoDialog() { return <Details />; }",
      'src/feature/dialogs/example-two/index.ts':
        "export { ExampleTwoDialog } from './example-two.dialog';",
    });
    expect(checkStructure(root)).toEqual([
      expect.stringContaining('Keep dialog implementations private'),
    ]);
  });

  it.each(['@/feature/dialogs/example', '../../dialogs/example/index.ts'])(
    'prevents feature components from importing public dialogs: %s',
    (specifier) => {
      const root = createDialogFixture({
        'src/feature/components/example/index.ts':
          "export { Example } from './example';",
        'src/feature/components/example/example.tsx': `import { ExampleDialog } from '${specifier}'; export const Example = ExampleDialog;`,
      });
      expect(checkStructure(root)).toEqual([
        expect.stringContaining('Components must not import dialogs'),
      ]);
    }
  );
});

describe('dialog public contracts', () => {
  it.each(['./example.dialog', './types'])(
    'preserves public props from %s',
    (source) => {
      const root = createDialogFixture({
        'src/feature/dialogs/example/index.ts': `export { ExampleDialog } from './example.dialog'; export type { ExampleDialogProps } from '${source}';`,
        'src/feature/dialogs/example/types.ts':
          'export interface ExampleDialogProps {}',
        'src/feature/components/launcher/index.ts':
          "export { Launcher } from './launcher.container';",
        'src/feature/components/launcher/launcher.container.tsx':
          "import { ExampleDialog } from '@/feature/dialogs/example'; void ExampleDialog;",
      });
      expect(checkStructure(root)).toEqual([]);
    }
  );
  it('rejects an empty barrel without crashing', () => {
    const root = createDialogFixture({
      'src/feature/dialogs/example/index.ts': '',
    });
    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Export only the dialog component'),
      ])
    );
  });
  it('rejects a private type disguised as public props', () => {
    const root = createDialogFixture({
      'src/feature/dialogs/example/index.ts':
        "export { ExampleDialog } from './example.dialog'; export type { InternalProps as ExampleDialogProps } from './types';",
    });
    expect(checkStructure(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Export only the dialog component'),
      ])
    );
  });
});
