import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkSkeletons } from './check-skeletons.js';

const roots = [];
const component = 'src/feature/components/panel';
const part = 'src/feature/pages/details/parts/summary.tsx';
const primitive = "import { Skeleton } from '@/shared/components/skeleton';";
const inline = `${primitive}
export function Summary() { return <section />; }
export function SummarySkeleton() { return <Skeleton />; }`;

function fixture(extra = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skeleton-check-'));
  roots.push(root);
  const files = {
    'src/shared/components/skeleton/skeleton.tsx':
      'function Skeleton() { return <div />; } export { Skeleton };',
    'src/shared/components/skeleton/index.ts':
      "export { Skeleton } from './skeleton';",
    [`${component}/panel.tsx`]:
      'export function Panel() { return <section />; }',
    [`${component}/skeleton.tsx`]: `${primitive}
      export function PanelSkeleton() { return <Skeleton />; }`,
    [`${component}/index.ts`]:
      "export { Panel } from './panel'; export { PanelSkeleton } from './skeleton';",
    ...extra,
  };
  for (const [file, text] of Object.entries(files)) {
    if (text === null) {
      continue;
    }
    const name = path.join(root, file);
    fs.mkdirSync(path.dirname(name), { recursive: true });
    fs.writeFileSync(name, text);
  }
  return root;
}

function expectRule(extra, rule) {
  expect(checkSkeletons(fixture(extra))).toEqual(
    expect.arrayContaining([
      expect.stringMatching(new RegExp(`src[/\\\\].+:\\d+:\\d+ ${rule}:`)),
    ])
  );
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe('skeleton ownership', () => {
  it('accepts public skeletons, inline parts, local composition and barrel consumers', () => {
    expect(
      checkSkeletons(
        fixture({
          [part]: inline,
          'src/feature/pages/details/details.page.tsx': `
        import { SummarySkeleton } from './parts/summary';
        import { PanelSkeleton as Placeholder } from '@/feature/components/panel';
        export function DetailsPage() { return <><SummarySkeleton /><Placeholder /></>; }`,
          [`${component}/panel.container.tsx`]:
            "import { PanelSkeleton } from './skeleton'; export const PanelContainer = () => <PanelSkeleton />;",
          [`${component}/parts/row.tsx`]: `${primitive} export const Row = () => <div/>; const RowSkeleton = () => <Skeleton/>; export {RowSkeleton};`,
          [`${component}/__stories__/fixture.tsx`]: `${primitive} export const Example = () => <Skeleton />;`,
          'src/feature/pages/details/__tests__/fixture.tsx': `${primitive} function GenericSkeleton() { return <Skeleton/>; }`,
          'src/feature/example.stories.tsx': `${primitive} export const Loading = () => <Skeleton/>;`,
          'src/feature/example.test.tsx': `${primitive} const Loading = () => <Skeleton/>;`,
          'src/feature/example.d.ts':
            'export declare function NotAComponentSkeleton(): void;',
        })
      )
    ).toEqual([]);
  });

  it.each([
    'export const PanelSkeleton = () => <Skeleton />;',
    'const PanelSkeleton = function () { return <Skeleton />; }; export { PanelSkeleton };',
    'export const PanelSkeleton = memo(() => <Skeleton />);',
    'export const PanelSkeleton = forwardRef((props, ref) => <Skeleton />);',
    'export class PanelSkeleton extends React.Component { render() { return <Skeleton />; } }',
    'export function PanelSkeleton() { return [1, 2].map(n => <Skeleton key={n} />); }',
  ])('accepts component declaration forms: %s', (source) => {
    expect(
      checkSkeletons(
        fixture({ [`${component}/skeleton.tsx`]: primitive + source })
      )
    ).toEqual([]);
  });

  it.each([
    [`${component}/panel.tsx`, null],
    [`${component}/panel.tsx`, 'export interface Panel {}'],
    [`${component}/panel.tsx`, 'export const Panel = 123;'],
    [`${component}/panel.tsx`, 'function Panel() { return <section />; }'],
  ])(
    'requires a runtime component in the same directory (%#)',
    (file, text) => {
      expectRule({ [file]: text }, 'skeleton-component');
    }
  );

  it('does not borrow a component from another owner or a container', () => {
    expectRule(
      {
        [`${component}/panel.tsx`]: null,
        [`${component}/panel.container.tsx`]:
          'export function Panel() { return <section/>; }',
        'src/other/components/panel/panel.tsx':
          'export function Panel() { return <section/>; }',
      },
      'skeleton-component'
    );
  });

  it.each(['panel.tsx', 'panel-skeleton.tsx', 'skeleton.jsx', 'skeleton.ts'])(
    'rejects the wrong root filename %s',
    (filename) => {
      expectRule(
        {
          [`${component}/skeleton.tsx`]: null,
          [`${component}/${filename}`]: `${primitive} export function PanelSkeleton() { return <Skeleton/>; }`,
        },
        'skeleton-file'
      );
    }
  );

  it.each(['pages', 'dialogs', 'hooks'])(
    'rejects a %s directory as a standalone skeleton owner',
    (kind) => {
      expectRule(
        {
          [`src/feature/${kind}/details/skeleton.tsx`]: `${primitive} export function DetailsSkeleton() { return <Skeleton/>; }`,
        },
        'skeleton-owner'
      );
    }
  );

  it.each(['skeleton.tsx', 'summary-skeleton.tsx', 'summary.skeleton.tsx'])(
    'rejects a separate private part skeleton file %s',
    (filename) => {
      expectRule(
        {
          [part]: 'export function Summary() { return <section/>; }',
          [`src/feature/pages/details/parts/${filename}`]: `${primitive} export function SummarySkeleton() { return <Skeleton/>; }`,
        },
        'skeleton-part-file'
      );
    }
  );

  it('requires the exact component in the same part file', () => {
    expectRule(
      {
        [part]: `${primitive} export function SomethingElse() { return <div/>; } export function SummarySkeleton() { return <Skeleton/>; }`,
      },
      'skeleton-component'
    );
  });

  it('rejects nested component skeleton definitions', () => {
    expectRule(
      {
        [part]: `${primitive} export function Summary() { function SummarySkeleton() { return <Skeleton/>; } return <SummarySkeleton/>; }`,
      },
      'skeleton-owner'
    );
  });

  it('rejects an empty or anonymous skeleton module', () => {
    expectRule(
      { [`${component}/skeleton.tsx`]: 'export {};' },
      'skeleton-component'
    );
    expectRule(
      {
        [`${component}/skeleton.tsx`]: `${primitive} export default () => <Skeleton/>;`,
      },
      'skeleton-component'
    );
  });
});

describe('skeleton exports and boundaries', () => {
  it.each([
    '',
    "export * from './skeleton';",
    "export type { PanelSkeleton } from './skeleton';",
    "export { type PanelSkeleton } from './skeleton';",
    "export { PanelSkeleton as Loading } from './skeleton';",
    "import { PanelSkeleton } from './skeleton'; export { PanelSkeleton };",
    "export { PanelSkeleton } from './other';",
  ])(
    'requires an explicit runtime re-export from the owning barrel (%#)',
    (barrel) => {
      expectRule({ [`${component}/index.ts`]: barrel }, 'skeleton-barrel');
    }
  );

  it.each([
    'function PanelSkeleton() { return <Skeleton/>; }',
    'export default function PanelSkeleton() { return <Skeleton/>; }',
    'function PanelSkeleton() { return <Skeleton/>; } export type {PanelSkeleton};',
    'function PanelSkeleton() { return <Skeleton/>; } export {PanelSkeleton as Loading};',
    'const Loading = () => null; export { Loading as PanelSkeleton };',
  ])(
    'requires the declared skeleton to be a named value export (%#)',
    (source) => {
      expectRule(
        { [`${component}/skeleton.tsx`]: primitive + source },
        'skeleton-export'
      );
    }
  );

  it.each([
    "export { SummarySkeleton } from './parts/summary';",
    "export * from './parts/summary';",
    "export * as SummaryUI from './parts/summary';",
    "import { SummarySkeleton as Loading } from './parts/summary'; export { Loading };",
    "export type { SummarySkeleton } from './parts/summary';",
  ])('rejects private skeleton re-exports (%#)', (barrel) => {
    expectRule(
      { [part]: inline, 'src/feature/pages/details/index.ts': barrel },
      'skeleton-private'
    );
  });

  it('rejects a private barrel and an indirect namespace leak', () => {
    expectRule(
      {
        [part]: inline,
        'src/feature/pages/details/parts/index.ts':
          "export * from './summary';",
        'src/feature/pages/details/index.ts': "export * as UI from './parts';",
      },
      'skeleton-private'
    );
  });

  it.each([
    "import { PanelSkeleton as Loading } from '@/feature/components/panel/skeleton';",
    "import * as UI from '../../components/panel/skeleton';",
    "const UI = import('@/feature/components/panel/skeleton');",
    "const UI = require('@/feature/components/panel/skeleton');",
  ])('rejects external deep imports (%#)', (source) => {
    expectRule(
      { 'src/feature/pages/other/other.page.tsx': source },
      'skeleton-import'
    );
  });

  it('rejects cross-owner private imports', () => {
    expectRule(
      {
        [part]: inline,
        'src/feature/pages/other/other.page.tsx':
          "import * as UI from '../details/parts/summary';",
      },
      'skeleton-private'
    );
  });
});

describe('bare skeleton primitives', () => {
  it.each([
    `${primitive} export const Page = () => <Skeleton/>;`,
    "import { Skeleton as Placeholder } from '@/shared/components/skeleton'; export const Page = () => <Placeholder/>;",
    "import * as UI from '@/shared/components/skeleton'; export const Page = () => <UI.Skeleton/>;",
    `${primitive} export function Page() { return [1,2].map(n => <Skeleton key={n}/>); }`,
    `${primitive} const Placeholder = Skeleton; export const Page = () => <Placeholder/>;`,
    `${primitive} export const Page = () => React.createElement(Skeleton);`,
    `${primitive} export const Page = () => createElement(Skeleton);`,
  ])(
    'rejects primitives in orchestration even through aliases (%#)',
    (source) => {
      expectRule(
        { 'src/feature/pages/details/details.page.tsx': source },
        'skeleton-primitive'
      );
    }
  );

  it('rejects primitives in loaded presentation components and parts', () => {
    expectRule(
      { [part]: `${primitive} export const Summary = () => <Skeleton/>;` },
      'skeleton-primitive'
    );
    expectRule(
      {
        [`${component}/panel.tsx`]: `${primitive} export const Panel = () => <Skeleton/>;`,
      },
      'skeleton-primitive'
    );
  });

  it('resolves primitive re-exports while ignoring unrelated component names and text', () => {
    expectRule(
      {
        'src/shared/components/bridge/index.ts':
          "export { Skeleton as Placeholder } from '../skeleton';",
        [part]:
          "import {Placeholder} from '@/shared/components/bridge'; export const Summary = () => <Placeholder/>;",
      },
      'skeleton-primitive'
    );
    expect(
      checkSkeletons(
        fixture({
          [part]:
            'const Placeholder = () => <div/>; export const Summary = () => <Placeholder/>; // Skeleton',
        })
      )
    ).toEqual([]);
  });
});

describe('skeleton loading announcements', () => {
  const skeleton = (jsx) => `${primitive}
    export function PanelSkeleton() { return ${jsx}; }`;

  it.each([
    '<section aria-busy="true"><output className="sr-only" aria-label={label}>{label}</output><Skeleton /></section>',
    '<dl><div><dt>{label}</dt><dd><output className={"sr-only"}>{label}</output><Skeleton /></dd></div></dl>',
    '<div><output className={`sr-only`}><span>{label}</span></output><Skeleton /></div>',
    '<section><Skeleton /></section>',
  ])('accepts separate announcements and decorative skeletons (%#)', (jsx) => {
    expect(
      checkSkeletons(
        fixture({
          [`${component}/skeleton.tsx`]: skeleton(jsx),
        })
      )
    ).toEqual([]);
  });

  it.each([
    '<div role="status"><Skeleton /></div>',
    '<Card role={"status"}><Skeleton /></Card>',
    '<section role={pending ? "status" : undefined}><Skeleton /></section>',
    '<div aria-live="polite"><Skeleton /></div>',
    '<span aria-live={urgent ? "assertive" : "off"}>{label}</span>',
    '<output>{label}</output>',
    '<output className="text-sm">{label}</output>',
    '<output className="almost-sr-only">{label}</output>',
    '<output className={pending ? "sr-only" : "block"}>{label}</output>',
    '<output className="sr-only md:not-sr-only">{label}</output>',
    '<output className="sr-only hidden">{label}</output>',
    '<output className="sr-only" aria-hidden="true">{label}</output>',
    '<output className="sr-only" hidden>{label}</output>',
    '<output className="sr-only" role="status">{label}</output>',
    '<output className="sr-only" {...props}>{label}</output>',
    '<output className="sr-only"><Skeleton /></output>',
    '<output className="sr-only"><div>{label}</div></output>',
    '<output className="sr-only">{pending && <section>{label}</section>}</output>',
    '<output className="sr-only"><Card>{label}</Card></output>',
  ])('rejects visible, structural or non-native announcements (%#)', (jsx) => {
    expectRule(
      { [`${component}/skeleton.tsx`]: skeleton(jsx) },
      'skeleton-announcement'
    );
  });

  it('checks inline part skeletons without constraining loaded feedback', () => {
    expectRule(
      {
        [part]: `${primitive}
        export function Summary() { return <output>{saved}</output>; }
        export const SummarySkeleton = () => <output>{loading}</output>;`,
      },
      'skeleton-announcement'
    );
    expect(
      checkSkeletons(
        fixture({
          [part]: `${inline}
        export const SaveFeedback = () => <output className="text-xs">{saved}</output>;`,
        })
      )
    ).toEqual([]);
  });

  it.each([
    '<div role="status"><Placeholder /></div>',
    '<output className="flex"><Placeholder /></output>',
    '<section><output>{label}</output><Placeholder /></section>',
    '<div aria-live="polite">{pending && <Placeholder />}</div>',
  ])('checks announcements around composed, aliased skeletons (%#)', (jsx) => {
    expectRule(
      {
        'src/feature/pages/details/details.page.tsx': `
        import { PanelSkeleton as Placeholder } from '@/feature/components/panel';
        export const DetailsPage = () => pending ? ${jsx} : <output>{saved}</output>;`,
      },
      'skeleton-announcement'
    );
  });

  it('resolves namespace imports and local aliases in loading branches', () => {
    expectRule(
      {
        'src/feature/pages/details/details.page.tsx': `
        import * as UI from '@/feature/components/panel';
        const Placeholder = UI.PanelSkeleton;
        export const DetailsPage = () => <div><output>{label}</output><Placeholder /></div>;`,
      },
      'skeleton-announcement'
    );
  });

  it('keeps loaded and unrelated feedback outside the loading branch unaffected', () => {
    expect(
      checkSkeletons(
        fixture({
          'src/feature/pages/details/details.page.tsx': `
        import { PanelSkeleton } from '@/feature/components/panel';
        export const DetailsPage = () => <section>
          <output className="text-xs">{saved}</output>
          <div aria-live="polite">{searchResults}</div>
          {pending ? <div><output className="sr-only">{label}</output><PanelSkeleton /></div> : <output>{result}</output>}
        </section>;`,
        })
      )
    ).toEqual([]);
  });
});

it.each([false, true])(
  'CLI exits nonzero only for violations (invalid=%s)',
  (invalid) => {
    const root = fixture(invalid ? { [`${component}/index.ts`]: '' } : {});
    const result = spawnSync(
      process.execPath,
      [path.resolve('scripts/check-skeletons.js')],
      { cwd: root, encoding: 'utf8' }
    );
    expect(result.status).toBe(invalid ? 1 : 0);
    expect(result.stdout + result.stderr).toContain(
      invalid ? 'skeleton-barrel:' : 'Skeleton checks passed.'
    );
  }
);
