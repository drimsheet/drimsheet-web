import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import ts from 'typescript';
import { getOrchestrationOwner } from './orchestration-ownership.js';

const obsoleteSharedDirs = ['config', 'context', 'services', 'ui', 'utils'];
const obsoleteSharedComponentDirs = ['ui', 'lib'];
const staleImportPatterns = [
  /@\/components\/ui(\/|['"])/,
  /@\/lib\/utils(\/|['"])/,
  /@\/hooks(\/|['"])/,
  /@\/shared\/components\/ui(\/|['"])/,
  /@\/shared\/components\/lib(\/|['"])/,
];

function walk(dir, visitor) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      visitor(fullPath, entry);
      walk(fullPath, visitor);
      continue;
    }

    visitor(fullPath, entry);
  }
}

function getModuleExportCounts(filePath) {
  const sourceFile = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  let defaultExportCount = 0;
  let namedExportCount = 0;

  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement)) {
      defaultExportCount += statement.isExportEquals ? 0 : 1;
      namedExportCount += statement.isExportEquals ? 1 : 0;
      continue;
    }

    if (ts.isExportDeclaration(statement)) {
      namedExportCount += 1;
      continue;
    }

    const modifiers = ts.canHaveModifiers(statement)
      ? ts.getModifiers(statement)
      : undefined;
    const isExported = modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
    );

    if (!isExported) {
      continue;
    }

    const isDefault = modifiers.some(
      (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
    );

    if (isDefault) {
      defaultExportCount += 1;
    } else {
      namedExportCount += 1;
    }
  }

  return { defaultExportCount, namedExportCount };
}

function indexReferencesPrivateModule(indexPath) {
  if (!fs.existsSync(indexPath)) {
    return false;
  }

  const sourceFile = ts.createSourceFile(
    indexPath,
    fs.readFileSync(indexPath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  return sourceFile.statements.some((statement) => {
    if (
      !ts.isImportDeclaration(statement) &&
      !ts.isExportDeclaration(statement)
    ) {
      return false;
    }

    return (
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      (statement.moduleSpecifier.text === './helper' ||
        statement.moduleSpecifier.text.startsWith('./parts/'))
    );
  });
}

function validateComponentHelpers(
  componentPath,
  relative,
  ownerKind = 'component'
) {
  const errors = [];
  const expectedHelperPath = path.join(componentPath, 'helper.ts');
  const expectedTestPath = path.join(
    componentPath,
    '__tests__',
    'helper.test.ts'
  );
  const legacyHelpersPath = path.join(componentPath, 'helpers');
  const helperFiles = [];

  if (fs.existsSync(legacyHelpersPath)) {
    errors.push(
      `Replace ${ownerKind} helpers directory with ${relative(expectedHelperPath)}: ${relative(legacyHelpersPath)}`
    );
  }

  walk(componentPath, (fullPath, entry) => {
    if (
      entry.isFile() &&
      (path.basename(fullPath) === 'helper.ts' ||
        path.basename(fullPath) === 'helper.test.ts' ||
        /\.helper(?:\.test)?\.ts$/.test(path.basename(fullPath)))
    ) {
      helperFiles.push(fullPath);
    }
  });

  for (const helperFile of helperFiles) {
    if (helperFile !== expectedHelperPath && helperFile !== expectedTestPath) {
      errors.push(
        `Rename ${ownerKind} helper to ${relative(expectedHelperPath)} or its matching test: ${relative(helperFile)}`
      );
    }
  }

  const helperExists = fs.existsSync(expectedHelperPath);
  const testExists = fs.existsSync(expectedTestPath);

  if (helperExists && !testExists) {
    errors.push(
      `Add consolidated ${ownerKind} helper test: ${relative(expectedTestPath)}`
    );
  }

  if (!helperExists && testExists) {
    errors.push(
      `Remove orphan ${ownerKind} helper test or add ${relative(expectedHelperPath)}: ${relative(expectedTestPath)}`
    );
  }

  if (helperExists) {
    const { defaultExportCount, namedExportCount } =
      getModuleExportCounts(expectedHelperPath);

    if (defaultExportCount !== 1 || namedExportCount !== 0) {
      errors.push(
        `Expose exactly one default helper object and no named exports: ${relative(expectedHelperPath)}`
      );
    }
  }

  const indexPath = path.join(componentPath, 'index.ts');
  if (indexReferencesPrivateModule(indexPath)) {
    errors.push(
      `Keep ${ownerKind} helpers and parts private; remove the index reference: ${relative(indexPath)}`
    );
  }

  return errors;
}

function validateComponentSkeletonNames(componentPath, relative) {
  const componentName = path.basename(componentPath);
  const candidates = [
    {
      expected: path.join(componentPath, 'skeleton.tsx'),
      legacy: [
        path.join(componentPath, `${componentName}-skeleton.tsx`),
        path.join(componentPath, `${componentName}.skeleton.tsx`),
      ],
    },
    {
      expected: path.join(componentPath, '__tests__', 'skeleton.test.tsx'),
      legacy: [
        path.join(
          componentPath,
          '__tests__',
          `${componentName}-skeleton.test.tsx`
        ),
        path.join(
          componentPath,
          '__tests__',
          `${componentName}.skeleton.test.tsx`
        ),
      ],
    },
    {
      expected: path.join(componentPath, '__stories__', 'skeleton.stories.tsx'),
      legacy: [
        path.join(
          componentPath,
          '__stories__',
          `${componentName}-skeleton.stories.tsx`
        ),
        path.join(
          componentPath,
          '__stories__',
          `${componentName}.skeleton.stories.tsx`
        ),
      ],
    },
  ];
  const errors = [];

  for (const candidate of candidates) {
    for (const legacyPath of candidate.legacy) {
      if (fs.existsSync(legacyPath)) {
        errors.push(
          `Use owner-local skeleton filename ${relative(candidate.expected)}: ${relative(legacyPath)}`
        );
      }
    }
  }

  return errors;
}

function readSource(filePath) {
  return ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
}

function hasFrozenOwnerHelper(ownerPath) {
  const source = readSource(path.join(ownerPath, 'helper.ts'));
  const helperName = `${path.basename(ownerPath).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}Helpers`;
  const defaultExport = source.statements.find(ts.isExportAssignment);
  if (
    !defaultExport ||
    !ts.isIdentifier(defaultExport.expression) ||
    defaultExport.expression.text !== helperName
  )
    return false;

  return source.statements.some((statement) => {
    if (!ts.isVariableStatement(statement)) return false;
    return statement.declarationList.declarations.some((declaration) => {
      const initializer = declaration.initializer;
      return (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === helperName &&
        initializer &&
        ts.isCallExpression(initializer) &&
        ts.isPropertyAccessExpression(initializer.expression) &&
        ts.isIdentifier(initializer.expression.expression) &&
        initializer.expression.expression.text === 'Object' &&
        initializer.expression.name.text === 'freeze' &&
        initializer.arguments.length === 1 &&
        ts.isObjectLiteralExpression(initializer.arguments[0])
      );
    });
  });
}

function validateOrchestrationOwner(ownerPath, relative) {
  const errors = [];
  const kind =
    path.basename(path.dirname(ownerPath)) === 'dialogs' ? 'dialog' : 'page';
  const suffix = kind === 'dialog' ? 'Dialog' : 'Page';
  const name = path.basename(ownerPath);
  const entryPath = path.join(ownerPath, `${name}.${kind}.tsx`);
  const indexPath = path.join(ownerPath, 'index.ts');
  if (!fs.existsSync(entryPath)) {
    errors.push(`Add matching ${kind} entry: ${relative(entryPath)}`);
  }
  if (!fs.existsSync(indexPath)) {
    errors.push(`Add ${kind} public entry point: ${relative(indexPath)}`);
  } else {
    const statements = readSource(indexPath).statements;
    const statement = statements[0];
    const publicPropsOnly =
      kind === 'dialog' &&
      statements
        .slice(1)
        .every(
          (item) =>
            ts.isExportDeclaration(item) &&
            item.isTypeOnly &&
            item.moduleSpecifier &&
            ts.isStringLiteral(item.moduleSpecifier) &&
            [`./${name}.dialog`, './types'].includes(
              item.moduleSpecifier.text
            ) &&
            item.exportClause &&
            ts.isNamedExports(item.exportClause) &&
            item.exportClause.elements.length === 1 &&
            item.exportClause.elements[0].name.text ===
              `${statement?.exportClause?.elements?.[0]?.name?.text}Props` &&
            !item.exportClause.elements[0].propertyName
        );
    // An explicit, single component export prevents the owner API leaking support code.
    if (
      (statements.length !== 1 && !publicPropsOnly) ||
      !statement ||
      !ts.isExportDeclaration(statement) ||
      statement.isTypeOnly ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== `./${name}.${kind}` ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause) ||
      statement.exportClause.elements.length !== 1 ||
      statement.exportClause.elements[0].isTypeOnly ||
      !statement.exportClause.elements[0].name.text.endsWith(suffix)
    ) {
      errors.push(
        `Export only the ${kind} component from ./${name}.${kind}: ${relative(indexPath)}`
      );
    }
  }

  errors.push(...validateComponentHelpers(ownerPath, relative, kind));
  if (
    fs.existsSync(path.join(ownerPath, 'helper.ts')) &&
    !hasFrozenOwnerHelper(ownerPath)
  ) {
    errors.push(
      `Export a frozen <${kind}Name>Helpers object as the ${kind} helper default: ${relative(path.join(ownerPath, 'helper.ts'))}`
    );
  }
  walk(ownerPath, (fullPath, entry) => {
    if (!entry.isFile()) return;
    const localPath = path.relative(ownerPath, fullPath);
    const segments = localPath.split(path.sep);
    const basename = path.basename(fullPath);
    const isSupport =
      segments.includes('__tests__') || segments.includes('__stories__');
    if (basename === 'index.ts' && fullPath !== indexPath && !isSupport) {
      errors.push(`Remove private ${kind} barrel: ${relative(fullPath)}`);
    }
    if (basename.endsWith(`.${kind}.tsx`) && fullPath !== entryPath) {
      errors.push(
        `Use matching ${kind} entry ${relative(entryPath)}: ${relative(fullPath)}`
      );
    }
    if (
      !isSupport &&
      basename.endsWith('.tsx') &&
      fullPath !== entryPath &&
      segments[0] !== 'parts'
    ) {
      errors.push(`Move private ${kind} UI into parts: ${relative(fullPath)}`);
    }
    if (
      !isSupport &&
      segments[0] === 'parts' &&
      /\.(?:ts|tsx)$/.test(basename) &&
      !basename.endsWith('.tsx')
    ) {
      errors.push(
        `Keep ${kind} parts for UI; move logic to hooks, helper.ts, or types.ts: ${relative(fullPath)}`
      );
    }
  });
  return errors;
}

function moduleReferences(sourceFile) {
  const references = [];
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier
    ) {
      if (ts.isStringLiteral(node.moduleSpecifier))
        references.push(node.moduleSpecifier.text);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      references.push(node.argument.literal.text);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteral(node.moduleReference.expression)
    ) {
      references.push(node.moduleReference.expression.text);
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === 'require')) &&
      node.arguments.length &&
      (ts.isStringLiteral(node.arguments[0]) ||
        ts.isNoSubstitutionTemplateLiteral(node.arguments[0]))
    ) {
      references.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return references;
}

function validateOrchestrationImports(srcRoot, filePath, relative) {
  const errors = [];
  const sourceOwner = getOrchestrationOwner(srcRoot, filePath);
  const sourceSegments = path.relative(srcRoot, filePath).split(path.sep);
  for (const specifier of moduleReferences(readSource(filePath))) {
    let target;
    if (specifier.startsWith('@/')) {
      target = path.resolve(srcRoot, specifier.slice(2));
    } else if (specifier.startsWith('.')) {
      target = path.resolve(path.dirname(filePath), specifier);
    } else {
      continue;
    }
    const targetOwner = getOrchestrationOwner(srcRoot, target);
    if (!targetOwner) continue;
    const kind =
      path.basename(path.dirname(targetOwner)) === 'dialogs'
        ? 'dialog'
        : 'page';

    if (
      sourceSegments[1] === 'components' &&
      (kind === 'page' || !filePath.endsWith('.container.tsx'))
    ) {
      errors.push(
        `Components must not import ${kind}s: ${relative(filePath)} -> ${specifier}`
      );
    }
    const targetRelative = path.relative(targetOwner, target);
    const isPublic =
      targetRelative === '' ||
      /^index(?:\.(?:ts|tsx|js|jsx))?$/.test(targetRelative);
    if (targetOwner !== sourceOwner && !isPublic) {
      errors.push(
        `Keep ${kind} implementations private: ${relative(filePath)} -> ${specifier}`
      );
    }
  }
  return errors;
}

function validateSupportArtifactPlacement(srcRoot, fullPath, entry, relative) {
  if (!entry.isFile()) {
    return [];
  }

  const errors = [];
  const basename = path.basename(fullPath);
  const sourceRelative = path.relative(srcRoot, fullPath);
  const segments = sourceRelative.split(path.sep);
  const isTest = /\.test\.(?:ts|tsx)$/.test(basename);
  const isStory = basename.endsWith('.stories.tsx');
  const testsIndex = segments.indexOf('__tests__');
  const storiesIndex = segments.indexOf('__stories__');

  if (isTest && testsIndex === -1) {
    errors.push(
      `Move test into its owner's __tests__ directory: ${relative(fullPath)}`
    );
  }

  if (isStory && storiesIndex === -1) {
    errors.push(
      `Move story into its component owner's __stories__ directory: ${relative(fullPath)}`
    );
  }

  if (basename === 'index.ts' && (testsIndex !== -1 || storiesIndex !== -1)) {
    errors.push(`Remove support-directory barrel: ${relative(fullPath)}`);
  }

  if (testsIndex !== -1 && /\.(?:ts|tsx)$/.test(basename) && !isTest) {
    errors.push(
      `Keep production modules out of __tests__: ${relative(fullPath)}`
    );
  }

  if (storiesIndex !== -1 && /\.(?:ts|tsx)$/.test(basename) && !isStory) {
    errors.push(
      `Keep production modules out of __stories__: ${relative(fullPath)}`
    );
  }

  const componentsIndex = segments.indexOf('components');
  const ownerPath = getOrchestrationOwner(srcRoot, fullPath);
  if (isStory && componentsIndex === -1 && !ownerPath) {
    errors.push(
      `Place Storybook files under a component owner's __stories__ directory: ${relative(fullPath)}`
    );
  }

  if (componentsIndex !== -1 && segments.length > componentsIndex + 2) {
    const ownerArtifactPath = segments.slice(componentsIndex + 2);

    if (isTest && ownerArtifactPath[0] !== '__tests__') {
      errors.push(
        `Place component test directly under the owner's __tests__ tree: ${relative(fullPath)}`
      );
    }

    if (isStory && ownerArtifactPath[0] !== '__stories__') {
      errors.push(
        `Place component story directly under the owner's __stories__ tree: ${relative(fullPath)}`
      );
    }
  }

  if (ownerPath) {
    const kind =
      path.basename(path.dirname(ownerPath)) === 'dialogs' ? 'dialog' : 'page';
    const ownerArtifactPath = path
      .relative(ownerPath, fullPath)
      .split(path.sep);
    const isHookTest =
      ownerArtifactPath[0] === 'hooks' && ownerArtifactPath[1] === '__tests__';
    if (isTest && ownerArtifactPath[0] !== '__tests__' && !isHookTest) {
      errors.push(
        `Place ${kind} test under __tests__ or hooks/__tests__: ${relative(fullPath)}`
      );
    }
    if (isStory && ownerArtifactPath[0] !== '__stories__') {
      errors.push(
        `Place ${kind} story under the owner's __stories__ tree: ${relative(fullPath)}`
      );
    }
    if (
      (isStory || isTest) &&
      ['__stories__', '__tests__'].includes(ownerArtifactPath[0])
    ) {
      const sourcePath = path
        .join(ownerPath, ...ownerArtifactPath.slice(1))
        .replace(/\.(?:test|stories)(?=\.(?:ts|tsx)$)/, '');
      if (!fs.existsSync(sourcePath)) {
        errors.push(
          `Mirror ${kind} support artifact to an existing source: ${relative(fullPath)}`
        );
      }
    }
  }

  return errors;
}

export function checkStructure(root = process.cwd()) {
  const srcRoot = path.join(root, 'src');
  const sharedRoot = path.join(srcRoot, 'shared');
  const errors = [];
  const relative = (filePath) => path.relative(root, filePath);

  for (const dir of obsoleteSharedDirs) {
    const fullPath = path.join(sharedRoot, dir);
    if (fs.existsSync(fullPath)) {
      errors.push(`Remove obsolete shared directory: ${relative(fullPath)}`);
    }
  }

  const sharedComponentsRoot = path.join(sharedRoot, 'components');
  if (fs.existsSync(sharedComponentsRoot)) {
    for (const dir of obsoleteSharedComponentDirs) {
      const fullPath = path.join(sharedComponentsRoot, dir);
      if (fs.existsSync(fullPath)) {
        errors.push(
          `Remove obsolete shadcn landing bucket: ${relative(fullPath)}`
        );
      }
    }

    for (const entry of fs.readdirSync(sharedComponentsRoot, {
      withFileTypes: true,
    })) {
      const fullPath = path.join(sharedComponentsRoot, entry.name);
      if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        errors.push(
          `Move flat shared component file into its own directory: ${relative(fullPath)}`
        );
      }
    }
  }

  walk(srcRoot, (fullPath, entry) => {
    if (
      !entry.isDirectory() ||
      path.basename(path.dirname(fullPath)) !== 'components'
    ) {
      return;
    }

    const name = path.basename(fullPath);
    if (name.startsWith('__')) {
      return;
    }

    const indexPath = path.join(fullPath, 'index.ts');
    if (!fs.existsSync(indexPath)) {
      errors.push(`Add component public entry point: ${relative(indexPath)}`);
    }

    errors.push(...validateComponentHelpers(fullPath, relative));
    errors.push(...validateComponentSkeletonNames(fullPath, relative));

    const partsIndexPath = path.join(fullPath, 'parts', 'index.ts');
    if (fs.existsSync(partsIndexPath)) {
      errors.push(`Remove private parts barrel: ${relative(partsIndexPath)}`);
    }
  });

  const featureRoots = fs.existsSync(srcRoot)
    ? fs
        .readdirSync(srcRoot, { withFileTypes: true })
        .filter(
          (entry) =>
            entry.isDirectory() &&
            entry.name !== 'shared' &&
            entry.name !== '_app' &&
            !entry.name.startsWith('.')
        )
        .map((entry) => entry.name)
    : [];

  walk(srcRoot, (fullPath, entry) => {
    errors.push(
      ...validateSupportArtifactPlacement(srcRoot, fullPath, entry, relative)
    );

    const segments = path.relative(srcRoot, fullPath).split(path.sep);
    if (['pages', 'dialogs'].includes(segments[1]) && segments.length === 3) {
      const kind = segments[1] === 'dialogs' ? 'dialog' : 'page';
      if (entry.isFile() && /\.(?:ts|tsx|js|jsx)$/.test(entry.name)) {
        errors.push(
          `Move flat ${kind} into ${kind}s/<${kind}>/<${kind}>.${kind}.tsx: ${relative(fullPath)}`
        );
      } else if (entry.isDirectory() && !entry.name.startsWith('__')) {
        errors.push(...validateOrchestrationOwner(fullPath, relative));
      }
    }
    if (entry.isFile() && /\.(?:ts|tsx|js|jsx)$/.test(entry.name)) {
      errors.push(...validateOrchestrationImports(srcRoot, fullPath, relative));
    }

    if (
      entry.isDirectory() &&
      (path.basename(fullPath) === '__tests__' ||
        path.basename(fullPath) === '__stories__') &&
      fs.readdirSync(fullPath).length === 0
    ) {
      errors.push(`Remove empty support directory: ${relative(fullPath)}`);
    }

    if (entry.isFile() && path.basename(path.dirname(fullPath)) === 'lib') {
      errors.push(
        `Move file into a responsibility directory under lib: ${relative(fullPath)}`
      );
    }
  });

  walk(sharedRoot, (fullPath, entry) => {
    if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) {
      return;
    }

    const source = fs.readFileSync(fullPath, 'utf8');

    for (const pattern of staleImportPatterns) {
      if (pattern.test(source)) {
        errors.push(
          `Rewrite stale shadcn landing import in ${relative(fullPath)}`
        );
        break;
      }
    }

    for (const feature of featureRoots) {
      const featureImport = new RegExp(`@/${feature}(/|['"])`);
      if (featureImport.test(source)) {
        errors.push(
          `Remove shared-to-feature import from ${relative(fullPath)} to src/${feature}`
        );
        break;
      }
    }
  });

  return errors;
}

function run() {
  const errors = checkStructure();

  if (errors.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Structure check failed:');
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('\x1b[32m%s\x1b[0m', 'Shared structure check passed.');
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  run();
}
