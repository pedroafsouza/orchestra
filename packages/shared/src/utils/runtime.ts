import type { ScreenComponent } from '../schemas/screen';

/**
 * Replace {{key}} placeholders in a template string with values from an entry object.
 *
 * @example
 * interpolate('Hello {{name}}!', { name: 'Alice' }) // 'Hello Alice!'
 * interpolate('{{missing}}', {})                     // ''
 */
export function interpolate(
  template: string,
  entry: Record<string, any> | undefined,
): string {
  if (!entry) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = entry[key];
    return val !== undefined && val !== null ? String(val) : '';
  });
}

/**
 * Resolve a component prop value — if a datasource field mapping exists for the
 * given prop key and an entry row is provided, return the mapped field value.
 * Otherwise fall back to the component's static props.
 *
 * @example
 * // With mapping: fieldMappings = { content: 'title' }
 * resolveProp('content', component, { title: 'Hello' }) // 'Hello'
 *
 * // Without mapping: falls back to component.props.content
 * resolveProp('content', component, undefined)           // component.props.content
 */
export function resolveProp(
  propKey: string,
  component: ScreenComponent,
  entry: Record<string, any> | undefined,
): any {
  if (entry && component.datasource?.fieldMappings?.[propKey]) {
    const field = component.datasource.fieldMappings[propKey];
    return entry[field];
  }
  return component.props[propKey];
}
