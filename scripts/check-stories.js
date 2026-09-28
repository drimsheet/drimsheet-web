import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getOrchestrationOwner } from './orchestration-ownership.js';

function walk(dir, visitor) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, visitor);
      continue;
    }

    visitor(fullPath, entry);
  }
}

function getComponentOwner(filePath) {
  const segments = filePath.split(path.sep);
  const componentsIndex = segments.lastIndexOf('components');

  if (componentsIndex === -1 || componentsIndex + 1 >= segments.length) {
    return undefined;
  }

  return segments.slice(0, componentsIndex + 2).join(path.sep);
}

function isUiSource(filePath) {
  const basename = path.basename(filePath);
  const segments = filePath.split(path.sep);

  return (
    basename.endsWith('.tsx') &&
    basename !== 'index.tsx' &&
    !basename.endsWith('.stories.tsx') &&
    !basename.endsWith('.test.tsx') &&
    !basename.endsWith('.container.tsx') &&
    !segments.includes('__tests__') &&
    !segments.includes('__stories__')
  );
}

function getCanonicalStoryPath(filePath, componentOwner) {
  const sourceRelative = path.relative(componentOwner, filePath);
  const relativeDirectory = path.dirname(sourceRelative);
  const basename = path.basename(filePath, '.tsx');
  const storyDirectory =
    relativeDirectory === '.'
      ? path.join(componentOwner, '__stories__')
      : path.join(componentOwner, '__stories__', relativeDirectory);

  return path.join(storyDirectory, `${basename}.stories.tsx`);
}

export function findMissingStories(dir) {
  const missing = [];

  walk(dir, (filePath, entry) => {
    if (!entry.isFile() || !isUiSource(filePath)) {
      return;
    }

    const ownerPath = getOrchestrationOwner(dir, filePath);
    // Page and dialog entries orchestrate UI; only presentation parts need stories.
    if (
      ownerPath &&
      path.relative(ownerPath, filePath).split(path.sep)[0] !== 'parts'
    ) {
      return;
    }
    const componentOwner = ownerPath ?? getComponentOwner(filePath);
    if (!componentOwner) {
      return;
    }

    const aggregateIconsStory = path.join(
      componentOwner,
      '__stories__',
      'icons.stories.tsx'
    );
    if (
      !ownerPath &&
      path.basename(componentOwner) === 'icons' &&
      fs.existsSync(aggregateIconsStory)
    ) {
      return;
    }

    const storyPath = getCanonicalStoryPath(filePath, componentOwner);
    if (!fs.existsSync(storyPath)) {
      missing.push(filePath);
    }
  });

  return missing;
}

function run() {
  const srcPath = path.join(process.cwd(), 'src');
  const missing = findMissingStories(srcPath);

  if (missing.length > 0) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      'Error: Missing Storybook documentation for the following components:'
    );
    missing.forEach((file) => {
      const relPath = path.relative(process.cwd(), file);
      console.error(`  - ${relPath}`);
    });
    console.error(
      '\x1b[33m%s\x1b[0m',
      "Please create each story in its component, page, or dialog owner's __stories__ directory before pushing."
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    '\x1b[32m%s\x1b[0m',
    '✅ All UI components have corresponding Storybook documentation.'
  );
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  run();
}
