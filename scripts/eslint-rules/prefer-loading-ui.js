const progressKey =
  /(?:^|[_.:])(?:loading|saving|deleting|archiving|submitting|processing|creating|updating|fetching|sending|verifying|checking|signing_in)(?:$|[_.:])/i;
const progressText =
  /^(?:(?:loading|saving|deleting|archiving|submitting|processing|creating|updating|fetching|sending|verifying|signing in|please wait)\b|checking(?:\s+(?:whether|deletion|eligibility)\b|\s*[.…]))/i;
const visibleProps =
  /^(?:children|placeholder|label|title|description|text|message|content|confirmationText|cancelText|emptyMessage|loadingText)$/;
const profileFile = '/src/user/pages/profile/parts/profile-preferences.tsx';
const buttonFile = '/src/shared/components/button/button.tsx';

function unwrap(node) {
  while (
    node &&
    [
      'JSXExpressionContainer',
      'TSAsExpression',
      'TSSatisfiesExpression',
      'TSNonNullExpression',
      'ChainExpression',
    ].includes(node.type)
  )
    node = node.expression;
  return node;
}

function attribute(element, name) {
  return element.openingElement.attributes.find(
    (entry) => entry.type === 'JSXAttribute' && entry.name.name === name
  )?.value;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Use loading buttons and component skeletons instead of manual loading UI',
    },
    schema: [],
    messages: {
      loadingText:
        'Use a component skeleton for loading content or the shared Button loading prop with a stable action label. Loading announcements belong in a screen-reader-only output.',
      buttonSpinner:
        'Do not insert a spinner into a button. Use the shared Button loading prop (or its forwarded dialog action prop).',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/');
    if (
      /(?:\/__(?:tests|stories)__\/|\.(?:test|spec|stories)\.[jt]sx?$)/.test(
        filename
      )
    )
      return {};

    function variable(node) {
      for (
        let scope = context.sourceCode.getScope(node);
        scope;
        scope = scope.upper
      ) {
        const found = scope.set.get(node.name);
        if (found) return found;
      }
    }

    function values(node, seen = new Set()) {
      node = unwrap(node);
      if (!node || seen.has(node)) return [];
      seen = new Set(seen).add(node);
      if (node.type === 'Literal' && typeof node.value === 'string')
        return [{ text: node.value }];
      if (node.type === 'JSXText') return [{ text: node.value }];
      if (node.type === 'TemplateLiteral')
        return [
          { text: node.quasis.map((part) => part.value.cooked).join('') },
          ...node.expressions.flatMap((expression) => values(expression, seen)),
        ];
      if (node.type === 'ConditionalExpression')
        return [
          ...values(node.consequent, seen),
          ...values(node.alternate, seen),
        ];
      if (node.type === 'LogicalExpression')
        return [
          ...(node.operator === '&&' ? [] : values(node.left, seen)),
          ...values(node.right, seen),
        ];
      if (node.type === 'BinaryExpression' && node.operator === '+')
        return [...values(node.left, seen), ...values(node.right, seen)];
      if (node.type === 'ArrayExpression')
        return node.elements.flatMap((entry) => values(entry, seen));
      if (node.type === 'Identifier') {
        const binding = variable(node);
        return (binding?.references ?? []).flatMap((reference) =>
          reference.writeExpr ? values(reference.writeExpr, seen) : []
        );
      }
      if (node.type === 'MemberExpression') {
        const key = node.computed ? node.property.value : node.property.name;
        const objects =
          node.object.type === 'Identifier'
            ? (variable(node.object)?.references ?? []).map((ref) =>
                unwrap(ref.writeExpr)
              )
            : [unwrap(node.object)];
        return objects.flatMap((object) =>
          object?.type === 'ObjectExpression'
            ? object.properties.flatMap((prop) =>
                (prop.key?.name ?? prop.key?.value) === key
                  ? values(prop.value, seen)
                  : []
              )
            : []
        );
      }
      if (node.type === 'CallExpression' && isTranslation(node.callee)) {
        return values(node.arguments[0], seen).map(({ text }) => ({
          text,
          key: true,
        }));
      }
      return [];
    }

    function isTranslation(node, seen = new Set()) {
      node = unwrap(node);
      if (!node || seen.has(node)) return false;
      seen.add(node);
      if (node.type === 'MemberExpression') return node.property.name === 't';
      if (node.type !== 'Identifier') return false;
      if (node.name === 't') return true;
      return variable(node)?.defs.some(
        ({ node: definition }) =>
          (definition.type === 'ImportSpecifier' &&
            definition.imported.name === 't') ||
          (definition.type === 'VariableDeclarator' &&
            ((definition.id.type === 'ObjectPattern' &&
              definition.id.properties.some(
                (prop) =>
                  prop.key?.name === 't' && prop.value?.name === node.name
              )) ||
              isTranslation(definition.init, seen)))
      );
    }

    // Resolve import aliases and local aliases without relying on their chosen name.
    function names(node, seen = new Set()) {
      node = unwrap(node);
      if (!node || seen.has(node)) return [];
      seen.add(node);
      if (['JSXMemberExpression', 'MemberExpression'].includes(node.type))
        return [node.property.name];
      if (!['JSXIdentifier', 'Identifier'].includes(node.type)) return [];
      const result = [node.name];
      for (const { node: definition } of variable(node)?.defs ?? []) {
        if (definition.type === 'ImportSpecifier')
          result.push(definition.imported.name);
        if (definition.type === 'VariableDeclarator')
          result.push(...names(definition.init, seen));
      }
      return result;
    }

    function isButton(element) {
      return (
        names(element.openingElement.name).some(
          (name) =>
            name === 'button' ||
            /Button$/.test(name) ||
            name === 'AlertDialogAction'
        ) ||
        values(attribute(element, 'role')).some(({ text }) => text === 'button')
      );
    }

    function insideButton(node) {
      for (let parent = node.parent; parent; parent = parent.parent)
        if (parent.type === 'JSXElement' && isButton(parent)) return true;
      return false;
    }

    function announcement(node) {
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (
          parent.type !== 'JSXElement' ||
          parent.openingElement.name.name !== 'output'
        )
          continue;
        const classes = values(attribute(parent, 'className'));
        return (
          classes.length === 1 &&
          classes[0].text.split(/\s+/).includes('sr-only') &&
          !/(?:^|\s)(?:\S+:)?(?:not-sr-only|hidden|invisible)(?:\s|$)/.test(
            classes[0].text
          )
        );
      }
      return false;
    }

    function autosave(node, value) {
      if (
        !filename.endsWith(profileFile) ||
        !value.key ||
        value.text !== 'profile_preferences_saving_text' ||
        insideButton(node)
      )
        return false;
      let output = false;
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (
          parent.type === 'JSXElement' &&
          parent.openingElement.name.name === 'output'
        )
          output = true;
        if (
          [
            'FunctionDeclaration',
            'FunctionExpression',
            'ArrowFunctionExpression',
          ].includes(parent.type)
        )
          return (
            output &&
            (parent.id?.name ?? parent.parent?.id?.name) ===
              'ProfilePreferences'
          );
      }
      return false;
    }

    function checkText(node, expression = node, translated = false) {
      if (announcement(node)) return;
      const manual = values(expression).some((value) => {
        if (autosave(node, value)) return false;
        return value.key || translated
          ? progressKey.test(value.text) &&
              !/(?:^|[_.:])(?:error|failed|failure)(?:$|[_.:])/i.test(
                value.text
              )
          : progressText.test(value.text.trim());
      });
      if (manual) context.report({ node, messageId: 'loadingText' });
    }

    function loaderLabel(node) {
      if (node.name.name !== 'label') return false;
      const name = node.parent.name;
      if (!names(name).includes('FullPageLoader')) return false;
      const binding = name.type === 'JSXMemberExpression' ? name.object : name;
      return variable(binding)?.defs.some(
        (definition) =>
          definition.type === 'ImportBinding' &&
          /^@\/shared\/components\/full-page-loader(?:\/full-page-loader)?$/.test(
            definition.parent.source.value
          )
      );
    }

    function spinner(node, seen = new Set()) {
      node = unwrap(node);
      if (!node || seen.has(node)) return false;
      seen = new Set(seen).add(node);
      if (node.type === 'Identifier')
        return variable(node)?.references.some(
          (ref) => ref.writeExpr && spinner(ref.writeExpr, seen)
        );
      if (node.type === 'JSXElement') {
        if (
          names(node.openingElement.name).some((name) =>
            /^(?:\w*Spinner(?:Icon)?|Loader(?:2|Circle|Pinwheel)?(?:Icon)?)$/.test(
              name
            )
          )
        )
          return true;
        const className = unwrap(attribute(node, 'className'));
        const classes =
          className?.type === 'CallExpression'
            ? className.arguments.flatMap((arg) => values(arg))
            : values(className);
        if (
          classes.some(({ text }) =>
            /(?:^|[\s:])animate-spin(?:\s|$)/.test(text)
          )
        )
          return true;
        return node.children.some((child) => spinner(child, seen));
      }
      if (node.type === 'JSXFragment')
        return node.children.some((child) => spinner(child, seen));
      if (node.type === 'ConditionalExpression')
        return spinner(node.consequent, seen) || spinner(node.alternate, seen);
      if (node.type === 'LogicalExpression')
        return (
          (node.operator !== '&&' && spinner(node.left, seen)) ||
          spinner(node.right, seen)
        );
      if (node.type === 'ArrayExpression')
        return node.elements.some((entry) => spinner(entry, seen));
      return false;
    }

    return {
      JSXText: checkText,
      JSXExpressionContainer(node) {
        if (node.parent.type !== 'JSXAttribute')
          checkText(node, node.expression);
      },
      JSXAttribute(node) {
        if (
          node.name.name === 'i18nKey' &&
          names(node.parent.name).includes('Trans')
        )
          checkText(node, node.value, true);
        if (visibleProps.test(node.name.name) && !loaderLabel(node))
          checkText(node, node.value);
      },
      JSXElement(node) {
        if (filename.endsWith(buttonFile) || !isButton(node)) return;
        if (
          node.children.some((child) => spinner(child)) ||
          node.openingElement.attributes.some(
            (prop) =>
              prop.type === 'JSXAttribute' &&
              /^(?:children|icon|startIcon|endIcon|prefix|suffix)$/.test(
                prop.name.name
              ) &&
              spinner(prop.value)
          )
        )
          context.report({
            node: node.openingElement,
            messageId: 'buttonSpinner',
          });
      },
    };
  },
};
