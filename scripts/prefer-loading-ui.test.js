import { ESLint, Linter } from 'eslint';
import fs from 'node:fs';
import path from 'node:path';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import preferLoadingUi from './eslint-rules/prefer-loading-ui.js';

const ruleId = 'local/prefer-loading-ui';
const linter = new Linter();
const profileFile = 'src/user/pages/profile/parts/profile-preferences.tsx';
const buttonFile = 'src/shared/components/button/button.tsx';

function lint(code, filename = 'src/feature/components/example/example.tsx') {
  return linter.verify(
    code,
    [
      {
        files: ['**/*.{jsx,tsx}'],
        languageOptions: {
          parser: tseslint.parser,
          parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: { local: { rules: { 'prefer-loading-ui': preferLoadingUi } } },
        rules: { [ruleId]: 'error' },
      },
    ],
    { filename: path.resolve(filename) }
  );
}

function expectViolation(code, messageId, filename) {
  expect(lint(code, filename)).toContainEqual(
    expect.objectContaining({
      ruleId,
      severity: 2,
      messageId,
    })
  );
}

describe('manual loading text', () => {
  it.each([
    '<p>Loading...</p>',
    '<div>Checking deletion eligibility</div>',
    '<Button>{pending ? "Saving…" : "Save"}</Button>',
    '<Button loading={pending}>{pending && "Deleting..."}</Button>',
    '<p>{`Loading ${name}`}</p>',
    '<p>{"Please wait" as const}</p>',
    '<p>{t("details_loading_text")}</p>',
    '<p>{t(pending ? "loading_text" : "ready")}</p>',
    '<Input placeholder={t("loading_banks")} />',
    '<ConfirmationDialog confirmationText={busy ? t("archiving_label") : t("archive_label")} />',
    '<View description={t("checking_deletion_eligibility_text")} />',
    '<View children="Loading…" />',
    '<Trans i18nKey="loading_text" />',
    'import {Trans as Translation} from "react-i18next"; <Translation i18nKey="loading_text" />',
    'const labels = {pending: t("loading_text")}; <p>{labels.pending}</p>',
    'const labels = {pending: "Saving..."}; <Button>{labels["pending"]}</Button>',
    'const text = t("loading_text"); const alias = text; <p>{alias}</p>',
    'let status = "Ready"; if (pending) status = t("saving_text"); <output>{status}</output>',
    'const {t: translate} = useTranslation(); const message = translate("loading_text"); <p>{message}</p>',
    'import {t as translate} from "i18next"; <p>{translate("saving_label")}</p>',
    '<p>{i18n.t("shared:loading_application_status")}</p>',
    '<output className="sr-only md:not-sr-only">Loading...</output>',
    '<span className="sr-only">Loading...</span>',
    'const status = ["Loading..."]; <p>{status}</p>',
  ])('rejects manual copy at its rendered use (%#)', (code) => {
    expectViolation(code, 'loadingText');
  });

  it.each([
    '<Button loading={pending}>Save</Button>',
    '<AlertDialogAction loading={pending} disabled={!valid}>Delete</AlertDialogAction>',
    '<ConfirmationDialog loading={pending} confirmationText={t("archive_label")} />',
    '<PanelSkeleton />',
    '<output className="sr-only">Loading…</output>',
    'const text = t("loading_text"); <output className="sr-only"><span>{text}</span></output>',
    '<PanelSkeleton aria-label={t("loading_text")} aria-busy />',
    '<div data-testid="loading_text" />',
    '<p>{t("loading_error_text")}</p>',
    '<p>Error loading account</p>',
    '<p>Checking account</p>',
    '<p>Learn about loading data</p>',
    '<output>Saved</output>',
    'const text = t("loading_text"); const normal = "Ready"; function View(text) {return <p>{text}</p>}; <p>{normal}</p>',
    'const unused = t("loading_text"); <p>{loaded ? "Account" : "No account"}</p>',
    'const a = b; const b = a; <p>{a}</p>',
    'import { FullPageLoader as Loader } from "@/shared/components/full-page-loader"; <Loader label={t("loading_application_status")} />',
    'import * as UI from "@/shared/components/full-page-loader"; <UI.FullPageLoader label={t("loading_application_status")} />',
  ])(
    'allows stable labels, announcements, errors and unrelated copy (%#)',
    (code) => {
      expect(lint(code)).toEqual([]);
    }
  );

  it('does not exempt an unrelated component named FullPageLoader', () => {
    expectViolation(
      'const FullPageLoader = () => null; <FullPageLoader label={t("loading_text")} />',
      'loadingText'
    );
  });
});

describe('manual button spinners', () => {
  it.each([
    '<Button><Spinner />Save</Button>',
    '<Button><LoadingSpinner /></Button>',
    '<button>{pending && <Loader2 className="animate-spin" />}Save</button>',
    '<AlertDialogAction><span><LoaderCircle /></span>Delete</AlertDialogAction>',
    'import {Button as Action} from "@/shared/components/button"; import {Loader2 as Busy} from "lucide-react"; <Action><Busy /></Action>',
    'import * as UI from "@/shared/components/button"; import * as Icons from "lucide-react"; <UI.Button><Icons.LoaderCircle /></UI.Button>',
    'import {Spinner as Busy} from "@/shared/components/spinner"; const Icon = Busy; <Button><Icon /></Button>',
    '<div role="button"><Spinner /></div>',
    '<Button><span className="size-4 animate-spin rounded-full border-2" /></Button>',
    '<Button><RefreshCw className={pending ? "animate-spin" : ""} /></Button>',
    '<Button><RefreshCw className={cn("size-4", pending && "animate-spin")} /></Button>',
    'const icon = <Loader2 />; <Button>{icon}</Button>',
    '<Button icon={<Spinner />} />',
    '<Button children={<Spinner />} />',
    '<Button><>{pending ? <Spinner /> : <Check />}</></Button>',
    '<Button>{[<Spinner key="busy" />]}</Button>',
  ])(
    'rejects hand-inserted spinners through aliases and wrappers (%#)',
    (code) => {
      expectViolation(code, 'buttonSpinner');
    }
  );

  it.each([
    '<Button loading={pending}><Save />Save</Button>',
    '<Button><RefreshCw />Refresh</Button>',
    '<Spinner />',
    '<Sonner icons={{loading: <Loader2 className="animate-spin" />}} />',
  ])('allows stable icons and standalone primitives (%#)', (code) => {
    expect(lint(code)).toEqual([]);
  });

  it('allows the real shared Button implementation only at its exact path', () => {
    expect(lint(fs.readFileSync(buttonFile, 'utf8'), buttonFile)).toEqual([]);
    expectViolation(
      '<button><Loader2 /></button>',
      'buttonSpinner',
      'src/feature/components/button/button.tsx'
    );
  });
});

describe('profile preferences autosave exception', () => {
  const autosave = `export function ProfilePreferences() {
    let save_status = t('profile_preferences_auto_save_text');
    if (isSaving) save_status = t('profile_preferences_saving_text');
    else if (isSaved) save_status = t('profile_preferences_saved_text');
    return <output className="text-xs">{save_status}</output>;
  }`;

  it('preserves the existing component and autosave assignment pattern', () => {
    expect(lint(autosave, profileFile)).toEqual([]);
    expect(lint(fs.readFileSync(profileFile, 'utf8'), profileFile)).toEqual([]);
  });

  it('does not exempt the whole file, other components or button content', () => {
    expectViolation(autosave, 'loadingText');
    expectViolation(
      autosave.replace('ProfilePreferences()', 'OtherPreferences()'),
      'loadingText',
      profileFile
    );
    expectViolation(
      autosave.replace('profile_preferences_saving_text', 'loading_text'),
      'loadingText',
      profileFile
    );
    expectViolation(
      autosave
        .replace('<output className="text-xs">', '<Button>')
        .replace('</output>', '</Button>'),
      'loadingText',
      profileFile
    );
    expectViolation(
      '<Button><Spinner /></Button>',
      'buttonSpinner',
      profileFile
    );
  });
});

it.each(['tsx', 'jsx'])(
  'repository config enforces loading checks in production %s',
  async (extension) => {
    const eslint = new ESLint();
    const [result] = await eslint.lintText(
      'export default function View() {return <button><Spinner />Saving...</button>}',
      {
        filePath: `src/loading-rule-fixture.${extension}`,
      }
    );
    expect(
      result.messages
        .filter((message) => message.ruleId === ruleId)
        .map((message) => message.messageId)
        .sort()
    ).toEqual(['buttonSpinner', 'loadingText']);
  }
);

it.each([
  'src/feature/__tests__/example.test.tsx',
  'src/feature/__stories__/example.stories.tsx',
])('excludes support fixtures at %s', (filename) => {
  expect(lint('<button><Spinner />Saving...</button>', filename)).toEqual([]);
});
