function containsStatus(node) {
  if (!node) return false;

  switch (node.type) {
    case 'Literal':
      return node.value === 'status';
    case 'TemplateLiteral':
      return (
        node.expressions.length === 0 &&
        node.quasis[0].value.cooked === 'status'
      );
    case 'JSXExpressionContainer':
    case 'TSAsExpression':
    case 'TSTypeAssertion':
    case 'TSSatisfiesExpression':
    case 'TSNonNullExpression':
      return containsStatus(node.expression);
    case 'ConditionalExpression':
      return containsStatus(node.consequent) || containsStatus(node.alternate);
    case 'LogicalExpression':
      return (
        (node.operator !== '&&' && containsStatus(node.left)) ||
        containsStatus(node.right)
      );
    default:
      return false;
  }
}

function isLucideIcon(name, scope) {
  const namespace = name.type === 'JSXMemberExpression';
  const identifier = namespace ? name.object : name;
  if (identifier.type !== 'JSXIdentifier') return false;
  if (!namespace && !/^[A-Z]/.test(identifier.name)) return false;

  // Resolve the binding so local components cannot bypass the rule by using
  // an icon's name, including shadowing an imported icon.
  for (let current = scope; current; current = current.upper) {
    const variable = current.set.get(identifier.name);
    if (!variable) continue;

    return variable.defs.some(
      (definition) =>
        definition.type === 'ImportBinding' &&
        definition.parent.source.value === 'lucide-react' &&
        definition.node.type ===
          (namespace ? 'ImportNamespaceSpecifier' : 'ImportSpecifier')
    );
  }

  return false;
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer native output elements for status announcements',
    },
    schema: [],
    messages: {
      preferOutput:
        'Use native <output> instead of role="status". For structural or skeleton containers, keep the layout and put the announcement in a screen-reader-only <output>. Remove redundant role="status" from <output>.',
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name !== 'role' || !containsStatus(node.value)) return;

        const name = node.parent.name;
        if (name.type === 'JSXIdentifier' && name.name === 'svg') return;
        if (isLucideIcon(name, context.sourceCode.getScope(node))) return;

        // No automatic fix: replacing a structural wrapper with output could
        // introduce invalid HTML or change layout and announcement behavior.
        context.report({ node, messageId: 'preferOutput' });
      },
    };
  },
};
