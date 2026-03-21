import { describe, it, expect } from 'vitest';
import { interpolate, resolveProp } from './runtime';
import type { ScreenComponent } from '../schemas/screen';

// ─── interpolate ────────────────────────────────────────────────────────────

describe('interpolate', () => {
  it('replaces a single placeholder', () => {
    expect(interpolate('Hello {{name}}', { name: 'Alice' })).toBe('Hello Alice');
  });

  it('replaces multiple placeholders', () => {
    expect(interpolate('{{a}} and {{b}}', { a: '1', b: '2' })).toBe('1 and 2');
  });

  it('replaces missing keys with empty string', () => {
    expect(interpolate('{{missing}}', {})).toBe('');
  });

  it('converts numeric values to string', () => {
    expect(interpolate('Price: {{amount}}', { amount: 99 })).toBe('Price: 99');
  });

  it('converts boolean values to string', () => {
    expect(interpolate('{{flag}}', { flag: true })).toBe('true');
  });

  it('replaces null/undefined values with empty string', () => {
    expect(interpolate('{{a}} {{b}}', { a: null, b: undefined })).toBe(' ');
  });

  it('returns template unchanged when entry is undefined', () => {
    expect(interpolate('Hello {{name}}', undefined)).toBe('Hello {{name}}');
  });

  it('returns template unchanged when no placeholders exist', () => {
    expect(interpolate('plain text', { name: 'Alice' })).toBe('plain text');
  });

  it('handles empty template', () => {
    expect(interpolate('', { name: 'Alice' })).toBe('');
  });

  it('handles repeated placeholders', () => {
    expect(interpolate('{{x}} + {{x}}', { x: '1' })).toBe('1 + 1');
  });
});

// ─── resolveProp ────────────────────────────────────────────────────────────

describe('resolveProp', () => {
  const makeComponent = (
    props: Record<string, any>,
    fieldMappings?: Record<string, string>,
  ): ScreenComponent => ({
    id: 'test',
    type: 'text',
    props,
    datasource: fieldMappings
      ? { datasourceId: 'ds1', fieldMappings }
      : undefined,
  });

  it('returns mapped field value from entry when mapping exists', () => {
    const comp = makeComponent({ content: 'fallback' }, { content: 'title' });
    expect(resolveProp('content', comp, { title: 'Mapped Title' })).toBe('Mapped Title');
  });

  it('falls back to component props when no entry', () => {
    const comp = makeComponent({ content: 'static' }, { content: 'title' });
    expect(resolveProp('content', comp, undefined)).toBe('static');
  });

  it('falls back to component props when no mapping for key', () => {
    const comp = makeComponent({ label: 'Button' }, { content: 'title' });
    expect(resolveProp('label', comp, { title: 'x' })).toBe('Button');
  });

  it('falls back to component props when no datasource at all', () => {
    const comp = makeComponent({ content: 'static' });
    expect(resolveProp('content', comp, { content: 'entry' })).toBe('static');
  });

  it('returns undefined when prop does not exist and no mapping', () => {
    const comp = makeComponent({});
    expect(resolveProp('missing', comp, undefined)).toBeUndefined();
  });
});
