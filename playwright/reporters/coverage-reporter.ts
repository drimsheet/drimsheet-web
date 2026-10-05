import type { FullResult, Reporter } from '@playwright/test/reporter';
import coverage from 'istanbul-lib-coverage';
import report from 'istanbul-lib-report';
import reports from 'istanbul-reports';
import { readFile, readdir, rm } from 'node:fs/promises';
import type { Profiler } from 'node:inspector';
import path from 'node:path';
import v8ToIstanbul from 'v8-to-istanbul';

const { createCoverageMap } = coverage;
const { createContext } = report;

interface CoverageReporterOptions {
  inputDir: string;
  outputDir: string;
}

interface V8CoverageEntry {
  functions: Profiler.FunctionCoverage[];
  source?: string;
  url: string;
}

const coverageFileName = 'v8-coverage.json';

async function findCoverageFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return findCoverageFiles(entryPath);
      }

      return entry.name === coverageFileName ? [entryPath] : [];
    })
  );

  return files.flat();
}

function getSourcePath(url: string): string {
  const sourceUrl = new URL(url);
  const sourcePath = decodeURIComponent(sourceUrl.pathname);

  return path.resolve(process.cwd(), `.${sourcePath}`);
}

export default class CoverageReporter implements Reporter {
  private readonly inputDir: string;
  private readonly outputDir: string;
  private testRuns = 0;

  constructor(options: CoverageReporterOptions) {
    this.inputDir = path.resolve(process.cwd(), options.inputDir);
    this.outputDir = path.resolve(process.cwd(), options.outputDir);
  }

  printsToStdio() {
    return false;
  }

  onTestEnd() {
    this.testRuns += 1;
  }

  async onEnd(
    result: FullResult
  ): Promise<{ status?: FullResult['status'] } | void> {
    if (!this.testRuns) {
      return { status: result.status };
    }

    try {
      const coverageFiles = await findCoverageFiles(this.inputDir);

      if (!coverageFiles.length) {
        throw new Error('No Playwright V8 coverage files were produced.');
      }

      const coverageMap = createCoverageMap({});

      for (const coverageFile of coverageFiles) {
        const entries = JSON.parse(
          await readFile(coverageFile, 'utf8')
        ) as V8CoverageEntry[];

        for (const entry of entries) {
          if (!entry.source) continue;

          const converter = v8ToIstanbul(getSourcePath(entry.url), 0, {
            source: entry.source,
          });

          await converter.load();
          converter.applyCoverage(entry.functions);
          coverageMap.merge(converter.toIstanbul());
          converter.destroy();
        }
      }

      if (!coverageMap.files().length) {
        throw new Error('No application source coverage was collected.');
      }

      await rm(this.outputDir, { recursive: true, force: true });

      const context = createContext({
        coverageMap,
        dir: this.outputDir,
      });

      reports.create('html').execute(context);
      reports.create('json').execute(context);
      reports.create('lcovonly').execute(context);
      reports.create('text-summary').execute(context);
    } catch (error) {
      console.error('Failed to generate Playwright coverage:', error);

      return { status: 'failed' };
    }

    return { status: result.status };
  }
}
