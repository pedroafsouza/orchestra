import { describe, it, expect } from 'vitest';
import { resolveTemplate, resolveProps } from './template';

describe('resolveTemplate', () => {
  it('replaces simple placeholders', () => {
    expect(resolveTemplate('Hello {{name}}', { name: 'Alice' })).toBe('Hello Alice');
  });

  it('replaces multiple placeholders', () => {
    expect(resolveTemplate('{{first}} {{last}}', { first: 'John', last: 'Doe' })).toBe('John Doe');
  });

  it('resolves nested paths', () => {
    expect(resolveTemplate('{{user.name}}', { user: { name: 'Bob' } })).toBe('Bob');
  });

  it('resolves deeply nested paths', () => {
    const ctx = { a: { b: { c: 'deep' } } };
    expect(resolveTemplate('{{a.b.c}}', ctx)).toBe('deep');
  });

  it('returns empty string for missing paths', () => {
    expect(resolveTemplate('{{missing}}', {})).toBe('');
  });

  it('returns empty string for null values', () => {
    expect(resolveTemplate('{{val}}', { val: null })).toBe('');
  });

  it('returns empty string for undefined values', () => {
    expect(resolveTemplate('{{val}}', { val: undefined })).toBe('');
  });

  it('converts numbers to strings', () => {
    expect(resolveTemplate('Age: {{age}}', { age: 25 })).toBe('Age: 25');
  });

  it('converts booleans to strings', () => {
    expect(resolveTemplate('{{flag}}', { flag: true })).toBe('true');
  });

  it('handles whitespace in placeholders', () => {
    expect(resolveTemplate('{{ name }}', { name: 'Alice' })).toBe('Alice');
  });

  it('returns string unchanged when no placeholders', () => {
    expect(resolveTemplate('no variables', {})).toBe('no variables');
  });

  it('handles broken path on null parent', () => {
    expect(resolveTemplate('{{a.b.c}}', { a: null })).toBe('');
  });
});

describe('resolveProps', () => {
  it('resolves string values', () => {
    const result = resolveProps({ greeting: 'Hello {{name}}' }, { name: 'World' });
    expect(result.greeting).toBe('Hello World');
  });

  it('preserves non-string primitives', () => {
    const result = resolveProps({ count: 42, active: true }, {});
    expect(result.count).toBe(42);
    expect(result.active).toBe(true);
  });

  it('resolves nested objects', () => {
    const result = resolveProps(
      { style: { label: '{{title}}' } },
      { title: 'Test' },
    );
    expect(result.style.label).toBe('Test');
  });

  it('resolves arrays of strings', () => {
    const result = resolveProps(
      { items: ['{{a}}', '{{b}}'] },
      { a: 'x', b: 'y' },
    );
    expect(result.items).toEqual(['x', 'y']);
  });

  it('resolves arrays of objects', () => {
    const result = resolveProps(
      { items: [{ name: '{{val}}' }] },
      { val: 'resolved' },
    );
    expect(result.items[0].name).toBe('resolved');
  });

  it('preserves non-string array items', () => {
    const result = resolveProps({ items: [1, true, null] }, {});
    expect(result.items).toEqual([1, true, null]);
  });

  it('does not mutate the original props', () => {
    const original = { label: '{{name}}' };
    resolveProps(original, { name: 'New' });
    expect(original.label).toBe('{{name}}');
  });
});
