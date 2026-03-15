/**
 * Resolves mustache-style {{context.key}} templates against a context object.
 * Supports nested paths like {{context.user.name}}.
 */
export function resolveTemplate(
  template: string,
  context: Record<string, any>
): string {
  return template.replace(/\{\{(\s*[\w.]+\s*)\}\}/g, (_match, path: string) => {
    const keys = path.trim().split('.');
    let value: any = context;
    for (const key of keys) {
      if (value == null) return '';
      value = value[key];
    }
    return value != null ? String(value) : '';
  });
}

/**
 * Recursively resolves all string values in an object tree.
 */
export function resolveProps(
  props: Record<string, any>,
  context: Record<string, any>
): Record<string, any> {
  const resolved: Record<string, any> = {};
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      resolved[key] = resolveTemplate(value, context);
    } else if (Array.isArray(value)) {
      resolved[key] = value.map((item) =>
        typeof item === 'string'
          ? resolveTemplate(item, context)
          : typeof item === 'object' && item !== null
            ? resolveProps(item, context)
            : item
      );
    } else if (typeof value === 'object' && value !== null) {
      resolved[key] = resolveProps(value, context);
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}
