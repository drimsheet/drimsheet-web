import { ESLint, Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import preferNativeStatus from './eslint-rules/prefer-native-status.js';

const ruleId = 'local/prefer-native-status';
const linter = new Linter();

function lint(code) {
  return linter.verify(code, {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      local: { rules: { 'prefer-native-status': preferNativeStatus } },
    },
    rules: { [ruleId]: 'error' },
  });
}

describe('prefer native status', () => {
  it.each([
    '<div role="status">Saved</div>',
    "<span role={'status'} />",
    '<p role={`status`} />',
    '<output role="status">Saved</output>',
    '<section role="status"><div /></section>',
    '<PageSection role="status" />',
    '<Card role="status" />',
    '<Field role="status" />',
    '<Layout.Section role="status" />',
    '<div role={loading ? "status" : undefined} />',
    '<div role={loading && "status"} />',
    '<div role={role ?? "status"} />',
    '<div role={"status" as const} />',
    '<div role={"status" satisfies string} />',
    'const Loader2Icon = () => null; <Loader2Icon role="status" />',
    'import { Loader2Icon } from "./custom"; <Loader2Icon role="status" />',
    'import { Loader2Icon as div } from "lucide-react"; <div role="status" />',
    'import { Loader2Icon } from "lucide-react"; function View(Loader2Icon) { return <Loader2Icon role="status" />; }',
  ])('rejects unnecessary status roles: %s', (code) => {
    expect(lint(code)).toEqual([
      expect.objectContaining({
        ruleId,
        severity: 2,
        messageId: 'preferOutput',
      }),
    ]);
    expect(lint(code)[0]).not.toHaveProperty('fix');
  });

  it.each([
    '<output>Saved</output>',
    '<div aria-busy="true"><output className="sr-only">Loading</output></div>',
    '<div role="alert" />',
    '<div role={role} />',
    '<div role />',
    '<div data-role="status" />',
    '<div role={"status" && "alert"} />',
    '<svg role="status" aria-label="Loading" />',
    'import { Loader2Icon } from "lucide-react"; <Loader2Icon role="status" />',
    'import { Loader2Icon as Loading } from "lucide-react"; <Loading role={"status"} />',
    'import * as Icons from "lucide-react"; <Icons.Loader2Icon role="status" />',
  ])('allows native output, other roles, and SVG indicators: %s', (code) => {
    expect(lint(code)).toEqual([]);
  });

  it.each(['tsx', 'jsx'])(
    'enforces the rule through the repository ESLint config for %s',
    async (extension) => {
      const eslint = new ESLint();
      const [result] = await eslint.lintText(
        'export default function View() { return <div role="status" />; }',
        { filePath: `src/status-lint-fixture.${extension}` }
      );

      expect(result.messages).toContainEqual(
        expect.objectContaining({ ruleId, severity: 2 })
      );
    }
  );
});
