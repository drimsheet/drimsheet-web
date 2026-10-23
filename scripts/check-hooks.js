import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const supportFile =
  /(?:^|[/\\])__(?:tests|stories)__(?:[/\\])|\.(?:test|spec|stories|d)\.[cm]?[jt]sx?$/;
const unknown = Symbol('unresolved');

function sourceFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = path.join(directory, entry.name);
    if (supportFile.test(name + (entry.isDirectory() ? path.sep : '')))
      return [];
    if (entry.isDirectory()) return sourceFiles(name);

    return /\.[jt]sx?$/.test(name) ? [name] : [];
  });
}

function unwrap(node) {
  while (
    node &&
    (ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isTypeAssertionExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isNonNullExpression(node))
  ) {
    node = node.expression;
  }
  return node;
}

/** Check production source, without loading or executing application modules. */
export function checkHooks(root = process.cwd()) {
  const files = sourceFiles(path.join(root, 'src'));
  const options = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.Preserve,
    allowJs: true,
    noLib: true,
    types: [],
    paths: { '@/*': [path.join(root, 'src/*')] },
  };
  const host = ts.createCompilerHost(options);
  // Only local symbols are needed; third-party declarations cannot define our services/keys.
  host.resolveModuleNames = (names, containingFile) =>
    names.map((name) =>
      name.startsWith('.') || name.startsWith('@/')
        ? ts.resolveModuleName(name, containingFile, options, host)
            .resolvedModule
        : undefined
    );
  const program = ts.createProgram(files, options, host);
  const checker = program.getTypeChecker();
  const errors = [];

  function report(node, message) {
    const source = node.getSourceFile();
    const { line, character } = source.getLineAndCharacterOfPosition(
      node.getStart()
    );
    errors.push(
      `${path.relative(root, source.fileName)}:${line + 1}:${character + 1} ${message}`
    );
  }

  function symbol(node) {
    let value = checker.getSymbolAtLocation(node);
    if (
      value?.valueDeclaration &&
      ts.isShorthandPropertyAssignment(value.valueDeclaration)
    ) {
      value = checker.getShorthandAssignmentValueSymbol(value.valueDeclaration);
    }
    if (value?.flags & ts.SymbolFlags.Alias)
      value = checker.getAliasedSymbol(value);
    return value;
  }

  function returnedExpression(fn) {
    if (!fn.body) return undefined;
    if (!ts.isBlock(fn.body)) return fn.body;
    const returns = fn.body.statements.filter(ts.isReturnStatement);
    return returns.length === 1 ? returns[0].expression : undefined;
  }

  function resolve(node, bindings = new Map(), seen = new Set()) {
    node = unwrap(node);
    if (!node || seen.has(node)) return undefined;
    seen = new Set(seen).add(node);
    if (ts.isIdentifier(node)) {
      const target = symbol(node);
      const argument = bindings.get(target);
      if (argument) return resolve(argument.node, argument.bindings, seen);
      const declaration = target?.valueDeclaration;
      if (declaration && ts.isVariableDeclaration(declaration)) {
        return resolve(declaration.initializer, bindings, seen);
      }
      if (declaration && ts.isFunctionDeclaration(declaration))
        return { node: declaration, bindings };
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText();
      if (
        callee === 'Object.freeze' ||
        ['queryOptions', 'infiniteQueryOptions'].includes(callee)
      ) {
        return resolve(node.arguments[0], bindings, seen);
      }
      const fn = resolve(node.expression, bindings, seen);
      if (
        fn &&
        (ts.isArrowFunction(fn.node) ||
          ts.isFunctionExpression(fn.node) ||
          ts.isFunctionDeclaration(fn.node))
      ) {
        const parameters = new Map(fn.bindings);
        fn.node.parameters.forEach((parameter, index) => {
          parameters.set(symbol(parameter.name), {
            node: node.arguments[index] ?? parameter.initializer,
            bindings: node.arguments[index] ? bindings : fn.bindings,
          });
        });
        return resolve(returnedExpression(fn.node), parameters, seen);
      }
      return undefined;
    }
    return { node, bindings };
  }

  function propertyName(node) {
    if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) return node.text;
    if (ts.isComputedPropertyName(node)) {
      const value = resolve(node.expression)?.node;
      if (value && ts.isStringLiteralLike(value)) return value.text;
    }
    return undefined;
  }

  function property(reference, name, seen = new Set()) {
    const value = resolve(reference.node, reference.bindings);
    if (
      !value ||
      !ts.isObjectLiteralExpression(value.node) ||
      seen.has(value.node)
    )
      return unknown;
    seen = new Set(seen).add(value.node);
    for (const member of [...value.node.properties].reverse()) {
      if (ts.isSpreadAssignment(member)) {
        const found = property(
          { node: member.expression, bindings: value.bindings },
          name,
          seen
        );
        if (found === unknown) {
          const type = checker.getTypeAtLocation(member.expression);
          if (
            type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown) ||
            type.getProperty(name)
          )
            return unknown;
        } else if (found) return found;
      } else if (propertyName(member.name) === name) {
        return {
          node: ts.isPropertyAssignment(member)
            ? member.initializer
            : ts.isShorthandPropertyAssignment(member)
              ? member.name
              : member,
          bindings: value.bindings,
        };
      }
    }
    return undefined;
  }

  function prefix(reference, seen = new Set()) {
    const value = resolve(reference.node, reference.bindings);
    if (
      !value ||
      !ts.isArrayLiteralExpression(value.node) ||
      seen.has(value.node)
    )
      return [unknown];
    seen = new Set(seen).add(value.node);
    const parts = [];
    for (const element of value.node.elements) {
      if (ts.isSpreadElement(element)) {
        parts.push(
          ...prefix(
            { node: element.expression, bindings: value.bindings },
            seen
          )
        );
      } else {
        const item = resolve(element, value.bindings)?.node;
        if (!item || !ts.isStringLiteralLike(item)) return [...parts, unknown];
        parts.push(item.text);
      }
      if (parts.includes(unknown) || parts.length >= 2)
        return parts.slice(0, 2);
    }
    return parts;
  }

  function serviceMethod(node) {
    node = unwrap(node);
    if (
      !node ||
      !(
        ts.isPropertyAccessExpression(node) ||
        ts.isElementAccessExpression(node)
      )
    )
      return undefined;
    const receiver = symbol(node.expression);
    const service = receiver?.getName() ?? node.expression.getText();
    const method = ts.isPropertyAccessExpression(node)
      ? node.name.text
      : resolve(node.argumentExpression)?.node;
    const methodName =
      typeof method === 'string'
        ? method
        : method && ts.isStringLiteralLike(method)
          ? method.text
          : undefined;
    if (!service.endsWith('Service') || !methodName) return undefined;
    return [service, methodName];
  }

  function serviceMethods(reference, seen = new Set()) {
    const direct = serviceMethod(reference.node);
    if (direct) return [direct];
    const value = resolve(reference.node, reference.bindings);
    if (!value || seen.has(value.node)) return [];
    seen = new Set(seen).add(value.node);
    const methods = [];
    function visit(node) {
      if (ts.isCallExpression(node)) {
        const method = serviceMethod(node.expression);
        if (method) {
          methods.push(method);
          return;
        }
        methods.push(
          ...serviceMethods(
            { node: node.expression, bindings: value.bindings },
            seen
          )
        );
      }
      ts.forEachChild(node, visit);
    }
    visit(value.node);
    return [
      ...new Map(methods.map((method) => [method.join('.'), method])).values(),
    ];
  }

  function validateQuery(node, required = false, bindings = new Map()) {
    const reference = { node, bindings };
    const fn = property(reference, 'queryFn');
    // Prefix-only cache operations (invalidate/cancel/remove/set) have no queryFn.
    if (!required && !fn) return;
    if (
      !required &&
      fn === unknown &&
      !node.properties.some(
        (member) =>
          member.name &&
          ['queryFn', 'queryKey'].includes(propertyName(member.name))
      )
    )
      return;
    const key = property(reference, 'queryKey');
    const actual = key && key !== unknown ? prefix(key) : [];
    const methods = fn && fn !== unknown ? serviceMethods(fn) : [];
    if (
      methods.length !== 1 ||
      actual.length !== 2 ||
      actual.includes(unknown)
    ) {
      report(
        node,
        'query-key: Use a statically resolvable [serviceName, methodName, ...arguments] key and one service method in queryFn.'
      );
    } else if (actual.some((part, index) => part !== methods[0][index])) {
      report(
        key.node,
        `query-key: Expected [${methods[0].map((part) => JSON.stringify(part)).join(', ')}, ...arguments]; received ${JSON.stringify(actual)}.`
      );
    }
  }

  function validateOptions(reference, origin) {
    const value = resolve(reference.node, reference.bindings);
    if (value && ts.isObjectLiteralExpression(value.node)) {
      validateQuery(value.node, true, value.bindings);
    } else {
      report(
        origin,
        'query-key: Query options must be statically resolvable to verify their service/method key.'
      );
    }
  }

  function validateQueries(reference, origin, seen = new Set()) {
    const value = resolve(reference.node, reference.bindings);
    if (
      value &&
      ts.isArrayLiteralExpression(value.node) &&
      !seen.has(value.node)
    ) {
      seen = new Set(seen).add(value.node);
      for (const element of value.node.elements) {
        if (ts.isSpreadElement(element))
          validateQueries(
            { node: element.expression, bindings: value.bindings },
            origin,
            seen
          );
        else
          validateOptions({ node: element, bindings: value.bindings }, origin);
      }
      return;
    }
    const node = unwrap(reference.node);
    if (
      node &&
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'map'
    ) {
      const callback = resolve(node.arguments[0], reference.bindings);
      if (callback) {
        validateOptions(
          {
            node: returnedExpression(callback.node),
            bindings: callback.bindings,
          },
          origin
        );
        return;
      }
    }
    report(
      origin,
      'query-key: Queries must be a resolvable array or map of query options.'
    );
  }

  for (const name of files) {
    const source = program.getSourceFile(name);
    const hooks = [];
    function visit(node) {
      if (
        (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) &&
        node.body &&
        node.name &&
        /^use[A-Z0-9]/.test(propertyName(node.name) ?? '')
      )
        hooks.push(node);
      if (
        ts.isPropertyAssignment(node) &&
        /^use[A-Z0-9]/.test(propertyName(node.name) ?? '')
      ) {
        const value = unwrap(node.initializer);
        if (ts.isArrowFunction(value) || ts.isFunctionExpression(value))
          hooks.push(node);
      }
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        /^use[A-Z0-9]/.test(node.name.text) &&
        node.initializer
      ) {
        const value = unwrap(node.initializer);
        if (
          ts.isArrowFunction(value) ||
          ts.isFunctionExpression(value) ||
          checker.getTypeAtLocation(node.name).getCallSignatures().length
        )
          hooks.push(node);
      }
      if (ts.isObjectLiteralExpression(node)) validateQuery(node);
      if (ts.isCallExpression(node)) {
        const callee = node.expression;
        const declaration = ts.isIdentifier(callee)
          ? checker.getSymbolAtLocation(callee)?.declarations?.[0]
          : undefined;
        const name =
          declaration && ts.isImportSpecifier(declaration)
            ? (declaration.propertyName ?? declaration.name).text
            : ts.isPropertyAccessExpression(callee)
              ? callee.name.text
              : callee.getText();
        if (
          [
            'useQuery',
            'useInfiniteQuery',
            'useSuspenseQuery',
            'useSuspenseInfiniteQuery',
            'fetchQuery',
            'prefetchQuery',
            'ensureQueryData',
            'fetchInfiniteQuery',
            'prefetchInfiniteQuery',
            'ensureInfiniteQueryData',
          ].includes(name)
        ) {
          validateOptions(
            { node: node.arguments[0], bindings: new Map() },
            node
          );
        }
        if (['useQueries', 'useSuspenseQueries'].includes(name)) {
          const queries = property(
            { node: node.arguments[0], bindings: new Map() },
            'queries'
          );
          if (queries && queries !== unknown) validateQueries(queries, node);
          else
            report(
              node,
              'query-key: Queries must be statically resolvable to verify their service/method keys.'
            );
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    for (const hook of hooks.slice(1))
      report(
        hook,
        `one-hook-per-file: Move ${propertyName(hook.name)} to its own file; this file also defines ${propertyName(hooks[0].name)}.`
      );
  }
  return [...new Set(errors)];
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const errors = checkHooks();
  if (errors.length) {
    console.error(`Hook checks failed:\n${errors.join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log('Hook checks passed.');
  }
}
