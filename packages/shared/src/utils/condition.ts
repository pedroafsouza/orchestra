/**
 * Safe condition evaluator for Decision nodes.
 * Evaluates simple conditions like "context.user_age > 18" without eval().
 * Supports: >, <, >=, <=, ==, !=, &&, ||
 */

type ContextValue = string | number | boolean | null | undefined;

function resolveValue(
  path: string,
  context: Record<string, any>
): ContextValue {
  const trimmed = path.trim();

  // String literal
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }

  // Number literal
  if (!isNaN(Number(trimmed)) && trimmed !== '') {
    return Number(trimmed);
  }

  // Boolean literals
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (trimmed === 'undefined') return undefined;

  // Context path
  const keys = trimmed.split('.');
  let value: any = context;
  for (const key of keys) {
    if (value == null) return undefined;
    value = value[key];
  }
  return value;
}

function evaluateComparison(
  left: ContextValue,
  operator: string,
  right: ContextValue
): boolean {
  switch (operator) {
    case '==':
      return left == right;
    case '!=':
      return left != right;
    case '>':
      return Number(left) > Number(right);
    case '<':
      return Number(left) < Number(right);
    case '>=':
      return Number(left) >= Number(right);
    case '<=':
      return Number(left) <= Number(right);
    default:
      return false;
  }
}

export function evaluateCondition(
  condition: string,
  context: Record<string, any>
): boolean {
  const trimmed = condition.trim();

  // Handle OR (lowest precedence)
  if (trimmed.includes('||')) {
    return trimmed
      .split('||')
      .some((part) => evaluateCondition(part, context));
  }

  // Handle AND
  if (trimmed.includes('&&')) {
    return trimmed
      .split('&&')
      .every((part) => evaluateCondition(part, context));
  }

  // Single comparison
  const match = trimmed.match(
    /^(.+?)\s*(>=|<=|!=|==|>|<)\s*(.+)$/
  );
  if (match) {
    const left = resolveValue(match[1], context);
    const right = resolveValue(match[3], context);
    return evaluateComparison(left, match[2], right);
  }

  // Truthy check (e.g., just "context.isAdmin")
  return !!resolveValue(trimmed, context);
}
