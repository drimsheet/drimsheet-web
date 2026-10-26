import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const supportFile =
  /(?:^|[/\\])__(?:tests|stories)__(?:[/\\])|\.(?:test|spec|stories|d)\.[cm]?[jt]sx?$/;
const skeletonName = /^(?:[A-Z]\w*)?Skeleton$/;

function sourceFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (supportFile.test(file + (entry.isDirectory() ? path.sep : ''))) {
      return [];
    }
    if (entry.isDirectory()) {
      return sourceFiles(file);
    }
    return /\.[jt]sx?$/.test(file) ? [file] : [];
  });
}

function ownerOf(srcRoot, file) {
  const segments = path.relative(srcRoot, file).split(path.sep);
  if (!['components', 'pages', 'dialogs'].includes(segments[1])) {
    return undefined;
  }
  if (segments.length < 4) {
    return undefined;
  }
  return {
    directory: path.join(srcRoot, ...segments.slice(0, 3)),
    kind: segments[1],
    part: segments[3] === 'parts',
  };
}

function runtimeDeclaration(node) {
  return (
    (ts.isFunctionDeclaration(node) && node.body) ||
    (ts.isVariableDeclaration(node) && node.initializer) ||
    ts.isClassDeclaration(node)
  );
}

function componentDeclaration(node) {
  if (!ts.isVariableDeclaration(node)) {
    return true;
  }
  let value = node.initializer;
  while (
    value &&
    (ts.isParenthesizedExpression(value) ||
      ts.isAsExpression(value) ||
      ts.isSatisfiesExpression(value))
  ) {
    value = value.expression;
  }
  return (
    value &&
    (ts.isArrowFunction(value) ||
      ts.isFunctionExpression(value) ||
      ts.isCallExpression(value))
  );
}

function topLevelDeclaration(node) {
  if (ts.isVariableDeclaration(node)) {
    return (
      ts.isVariableStatement(node.parent.parent) &&
      ts.isSourceFile(node.parent.parent.parent)
    );
  }
  return ts.isSourceFile(node.parent);
}

function literalText(node) {
  if (!node) {
    return undefined;
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (
    ts.isJsxExpression(node) ||
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node)
  ) {
    return literalText(node.expression);
  }
  return undefined;
}

function containsLiteral(node, values) {
  if (!node) {
    return false;
  }
  if (values.includes(literalText(node))) {
    return true;
  }
  return ts.forEachChild(node, (child) => containsLiteral(child, values));
}

// Announcements may contain inline text markup, but never visual placeholders,
// component layouts, or block elements (output only accepts phrasing content).
const announcementTags = new Set([
  'span',
  'b',
  'i',
  'em',
  'strong',
  'small',
  'abbr',
  'br',
  'wbr',
]);

/** Static ownership/API/accessibility checks; visual matching still needs UI review. */
export function checkSkeletons(root = process.cwd()) {
  root = path.resolve(root);
  const srcRoot = path.join(root, 'src');
  const files = sourceFiles(srcRoot);
  const options = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.Preserve,
    allowJs: true,
    noLib: true,
    types: [],
    paths: { '@/*': [path.join(srcRoot, '*')] },
  };
  const host = ts.createCompilerHost(options);
  // Resolve local aliases/barrels without loading third-party declarations.
  host.resolveModuleNames = (names, containingFile) =>
    names.map((name) =>
      name.startsWith('.') || name.startsWith('@/')
        ? ts.resolveModuleName(name, containingFile, options, host)
            .resolvedModule
        : undefined
    );
  const program = ts.createProgram(files, options, host);
  const checker = program.getTypeChecker();
  const sources = files.map((file) => program.getSourceFile(file));
  const primitivePath = path.join(
    srcRoot,
    'shared/components/skeleton/skeleton.tsx'
  );
  const errors = [];
  const skeletons = new Map();
  const declarations = new Map();

  function report(node, rule, message) {
    const source = node.getSourceFile();
    const { line, character } = source.getLineAndCharacterOfPosition(
      node.getStart()
    );
    errors.push(
      `${path.relative(root, source.fileName)}:${line + 1}:${character + 1} ${rule}: ${message}`
    );
  }

  function resolveSymbol(symbol) {
    return symbol?.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol;
  }

  function symbolAt(node) {
    return resolveSymbol(checker.getSymbolAtLocation(node));
  }

  function exportsOf(source) {
    const module = checker.getSymbolAtLocation(source);
    return module ? checker.getExportsOfModule(module) : [];
  }

  function namedExport(source, name, symbol) {
    return exportsOf(source).some(
      (entry) =>
        entry.name === name &&
        resolveSymbol(entry) === symbol &&
        // Type-only exports must not satisfy a runtime component contract.
        !entry.declarations?.some(
          (node) =>
            ts.isExportSpecifier(node) &&
            (node.isTypeOnly || node.parent.parent.isTypeOnly)
        )
    );
  }

  function isPrimitive(symbol, seen = new Set()) {
    if (!symbol || seen.has(symbol)) {
      return false;
    }
    seen.add(symbol);
    if (
      symbol?.name === 'Skeleton' &&
      symbol.declarations?.some(
        (node) => path.resolve(node.getSourceFile().fileName) === primitivePath
      )
    ) {
      return true;
    }
    const declaration = symbol.valueDeclaration;
    if (!declaration || !ts.isVariableDeclaration(declaration)) {
      return false;
    }
    const value = declaration.initializer;
    return value &&
      (ts.isIdentifier(value) || ts.isPropertyAccessExpression(value))
      ? isPrimitive(symbolAt(value), seen)
      : false;
  }

  for (const source of sources) {
    const local = [];
    function visit(node) {
      if (runtimeDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
        local.push(node);
        if (
          skeletonName.test(node.name.text) &&
          source.fileName !== primitivePath
        ) {
          const symbol = symbolAt(node.name);
          skeletons.set(symbol, {
            node,
            source,
            owner: ownerOf(srcRoot, source.fileName),
          });
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    declarations.set(source, local);
  }

  for (const [symbol, { node, source, owner }] of skeletons) {
    const name = node.name.text;
    const componentName = name.slice(0, -'Skeleton'.length);
    if (
      !topLevelDeclaration(node) ||
      !componentDeclaration(node) ||
      !owner ||
      (!owner.part &&
        (owner.kind !== 'components' ||
          path.dirname(source.fileName) !== owner.directory)) ||
      /\.(?:container|page|dialog)\.[jt]sx?$/.test(source.fileName)
    ) {
      report(
        node,
        'skeleton-owner',
        `${name} must belong to a presentation component directory or its private part.`
      );
    }
    const candidates = owner?.part
      ? [source]
      : sources.filter(
          (candidate) =>
            candidate !== source &&
            path.dirname(candidate.fileName) ===
              path.dirname(source.fileName) &&
            !/\.(?:container|page|dialog)\.[jt]sx?$/.test(candidate.fileName)
        );
    const component = candidates.some((candidate) =>
      declarations
        .get(candidate)
        .some(
          (declaration) =>
            topLevelDeclaration(declaration) &&
            componentDeclaration(declaration) &&
            declaration.name.text === componentName &&
            namedExport(candidate, componentName, symbolAt(declaration.name))
        )
    );
    if (!component) {
      report(
        node,
        'skeleton-component',
        `${name} requires an exported ${componentName || 'named component'} ${owner?.part ? 'in the same file' : 'in the same component directory'}.`
      );
    }
    if (!namedExport(source, name, symbol)) {
      report(
        node,
        'skeleton-export',
        `Export ${name} by its own name; a default, renamed, or type-only export is insufficient.`
      );
    }
    if (!owner?.part && path.basename(source.fileName) !== 'state.tsx') {
      report(
        node,
        'skeleton-file',
        `Move ${name} to its component's state.tsx.`
      );
    }
    if (owner?.part) {
      continue;
    }

    const barrel = program.getSourceFile(
      path.join(path.dirname(source.fileName), 'index.ts')
    );
    const explicit = barrel?.statements.some((statement) => {
      if (
        !ts.isExportDeclaration(statement) ||
        statement.isTypeOnly ||
        !statement.moduleSpecifier ||
        !statement.exportClause ||
        !ts.isNamedExports(statement.exportClause)
      ) {
        return false;
      }
      const target = symbolAt(statement.moduleSpecifier);
      if (!target?.declarations?.includes(source)) {
        return false;
      }
      return statement.exportClause.elements.some(
        (entry) =>
          !entry.isTypeOnly &&
          entry.name.text === name &&
          symbolAt(entry.name) === symbol
      );
    });
    if (!explicit) {
      report(
        node,
        'skeleton-barrel',
        `Explicitly re-export ${name} from ./state in this component's index.ts.`
      );
    }
  }

  // Resolve exported symbols too: importing a private part and then re-exporting
  // it (or exporting a namespace) must not evade the ownership boundary.
  function containsPrivateSkeleton(symbol, seen = new Set()) {
    symbol = resolveSymbol(symbol);
    if (!symbol || seen.has(symbol)) {
      return false;
    }
    seen.add(symbol);
    if (skeletons.get(symbol)?.owner?.part) {
      return true;
    }
    return symbol.flags & ts.SymbolFlags.Module
      ? checker
          .getExportsOfModule(symbol)
          .some((entry) => containsPrivateSkeleton(entry, seen))
      : false;
  }

  function isSkeleton(symbol, seen = new Set()) {
    if (!symbol || seen.has(symbol)) {
      return false;
    }
    if (skeletons.has(symbol) || isPrimitive(symbol)) {
      return true;
    }
    seen.add(symbol);
    const declaration = symbol.valueDeclaration;
    return declaration &&
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer
      ? isSkeleton(symbolAt(declaration.initializer), seen)
      : false;
  }

  const skeletonUsage = [new Map(), new Map()];
  function containsSkeleton(node, crossBranches = false) {
    if (
      !crossBranches &&
      (ts.isFunctionLike(node) ||
        ts.isConditionalExpression(node) ||
        ts.isBinaryExpression(node))
    ) {
      return false;
    }
    const cache = skeletonUsage[Number(crossBranches)];
    if (cache.has(node)) {
      return cache.get(node);
    }
    const found = Boolean(
      ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        isSkeleton(symbolAt(node.tagName))) ||
      ts.forEachChild(node, (child) => containsSkeleton(child, crossBranches))
    );
    cache.set(node, found);
    return found;
  }

  function checkAnnouncement(node, localSkeletons) {
    const attributes = node.attributes.properties;
    const attribute = (name) =>
      attributes.find(
        (entry) => ts.isJsxAttribute(entry) && entry.name.getText() === name
      );
    const output = node.tagName.getText() === 'output';
    const status = containsLiteral(attribute('role')?.initializer, ['status']);
    const live = containsLiteral(attribute('aria-live')?.initializer, [
      'polite',
      'assertive',
    ]);
    if (!output && !status && !live) {
      return;
    }

    let parent = node;
    let insideSkeleton = containsSkeleton(
      ts.isJsxOpeningElement(node) ? node.parent : node,
      true
    );
    while (parent) {
      if (localSkeletons.some((entry) => entry.node === parent)) {
        insideSkeleton = true;
        break;
      }
      parent = parent.parent;
    }
    // Also cover announcements around composed skeletons in loading branches.
    // Do not cross a function or conditional boundary into unrelated feedback.
    parent = node;
    while (!insideSkeleton && parent) {
      if (
        ts.isFunctionLike(parent) ||
        ts.isConditionalExpression(parent) ||
        ts.isBinaryExpression(parent)
      ) {
        break;
      }
      if (
        (ts.isJsxElement(parent) || ts.isJsxFragment(parent)) &&
        containsSkeleton(parent)
      ) {
        insideSkeleton = true;
      }
      parent = parent.parent;
    }
    if (!insideSkeleton) {
      return;
    }

    const classes =
      literalText(attribute('className')?.initializer)?.split(/\s+/) ?? [];
    const hidden = ['hidden', 'aria-hidden'].some((name) => {
      const prop = attribute(name);
      if (!prop) {
        return false;
      }
      const value = prop.initializer;
      return (
        literalText(value) !== 'false' &&
        !(
          value &&
          ts.isJsxExpression(value) &&
          value.expression?.kind === ts.SyntaxKind.FalseKeyword
        )
      );
    });
    if (
      !output ||
      status ||
      hidden ||
      !classes.includes('sr-only') ||
      classes.some((name) =>
        /(?:^|:)!?(?:not-sr-only|hidden|invisible)!?$/.test(name)
      ) ||
      attributes.some(ts.isJsxSpreadAttribute)
    ) {
      report(
        node,
        'skeleton-announcement',
        'Keep the layout container and use a native <output className="sr-only"> for its loading announcement; use an explicit static className without spreads, visibility overrides, or hidden/aria-hidden attributes.'
      );
    }
    if (!output || !ts.isJsxOpeningElement(node)) {
      return;
    }
    function checkContent(child) {
      if (
        (ts.isJsxOpeningElement(child) || ts.isJsxSelfClosingElement(child)) &&
        !announcementTags.has(child.tagName.getText())
      ) {
        report(
          child,
          'skeleton-announcement',
          'Keep visual placeholders and layout components outside the screen-reader-only output; it may contain only announcement text and inline text markup.'
        );
      }
      ts.forEachChild(child, checkContent);
    }
    node.parent.children.forEach(checkContent);
  }

  for (const source of sources) {
    const owner = ownerOf(srcRoot, source.fileName);
    const localSkeletons = [...skeletons.values()].filter(
      (entry) => entry.source === source
    );
    const filename = path.basename(source.fileName);
    if (
      (/(?:^|[.-])skeleton(?:[.-]|$)/i.test(filename) ||
        (owner?.part && filename === 'state.tsx')) &&
      source.fileName !== primitivePath
    ) {
      if (owner?.part) {
        report(
          source,
          'skeleton-part-file',
          'Define private part skeletons in the represented component file; separate skeleton files are forbidden.'
        );
      } else if (localSkeletons.length === 0) {
        report(
          source,
          'skeleton-component',
          'A skeleton module must define a named component skeleton.'
        );
      }
    }
    if (owner?.part && /^index\.[jt]sx?$/.test(filename)) {
      report(
        source,
        'skeleton-private',
        'Do not create a barrel inside parts/.'
      );
    }

    for (const exported of exportsOf(source)) {
      const target = resolveSymbol(exported);
      const skeleton = skeletons.get(target);
      if (
        skeletonName.test(exported.name) &&
        !skeleton &&
        !isPrimitive(target) &&
        target?.flags & ts.SymbolFlags.Value
      ) {
        report(
          source,
          'skeleton-export',
          `Define ${exported.name} as a named skeleton component instead of renaming another value.`
        );
      }
      if (
        skeleton?.source === source &&
        exported.name !== skeleton.node.name.text
      ) {
        report(
          exported.declarations?.[0] ?? source,
          'skeleton-export',
          `Do not rename ${skeleton.node.name.text} in its exports.`
        );
      }
      if (containsPrivateSkeleton(exported) && skeleton?.source !== source) {
        report(
          source,
          'skeleton-private',
          'Do not re-export a private part skeleton, directly or through another module.'
        );
      }
    }

    function checkReference(node, targetFile) {
      const targetOwner = ownerOf(srcRoot, targetFile);
      const targetSource = program.getSourceFile(targetFile);
      if (!targetSource) {
        return;
      }
      const hasSkeleton = [...skeletons.values()].some(
        (entry) => entry.source === targetSource
      );
      if (!hasSkeleton) {
        return;
      }
      if (targetOwner?.part && owner?.directory !== targetOwner.directory) {
        report(
          node,
          'skeleton-private',
          'Only files inside the part owner may import its skeleton.'
        );
      } else if (
        !targetOwner?.part &&
        owner?.directory !== targetOwner?.directory &&
        path.basename(targetFile) !== 'index.ts'
      ) {
        report(
          node,
          'skeleton-import',
          'Import public skeletons through the owning component barrel.'
        );
      }
    }

    function visit(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        checkAnnouncement(node, localSkeletons);
      }
      // Check imports, re-exports, dynamic imports and require() module paths.
      let moduleSpecifier;
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        moduleSpecifier = node.moduleSpecifier;
      }
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) &&
            node.expression.text === 'require'))
      ) {
        moduleSpecifier = node.arguments[0];
      }
      if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
        const resolved = ts.resolveModuleName(
          moduleSpecifier.text,
          source.fileName,
          options,
          host
        ).resolvedModule;
        if (resolved) {
          checkReference(moduleSpecifier, resolved.resolvedFileName);
        }
      }
      const jsxPrimitive =
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        isPrimitive(symbolAt(node.tagName));
      const createElementPrimitive =
        ts.isCallExpression(node) &&
        node.arguments[0] &&
        ((ts.isIdentifier(node.expression) &&
          node.expression.text === 'createElement') ||
          (ts.isPropertyAccessExpression(node.expression) &&
            node.expression.name.text === 'createElement')) &&
        isPrimitive(symbolAt(node.arguments[0]));
      if (jsxPrimitive || createElementPrimitive) {
        let parent = node.parent;
        while (
          parent &&
          !localSkeletons.some((entry) => entry.node === parent)
        ) {
          parent = parent.parent;
        }
        if (!parent) {
          report(
            node,
            'skeleton-primitive',
            'Use a named component skeleton; bare Skeleton primitives belong only inside component skeleton definitions.'
          );
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  return [...new Set(errors)];
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const errors = checkSkeletons();
  if (errors.length) {
    console.error(`Skeleton checks failed:\n${errors.join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log('Skeleton checks passed.');
  }
}
