import path from 'path';

// Only application pages and dialogs are owners; Playwright page objects are not.
export function getOrchestrationOwner(srcRoot, filePath) {
  const segments = path.relative(srcRoot, filePath).split(path.sep);
  if (
    segments.length < 3 ||
    segments[0] === '..' ||
    !['pages', 'dialogs'].includes(segments[1]) ||
    segments[2].startsWith('__') ||
    /\.(?:ts|tsx|js|jsx)$/.test(segments[2])
  ) {
    return undefined;
  }

  return path.join(srcRoot, ...segments.slice(0, 3));
}
