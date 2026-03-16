import { describe, it, expect } from 'vitest';
import {
  DatasourceFieldType,
  ScreenComponentType,
  ScreenComponentSchema,
  COMPONENT_DEFAULTS,
  ComponentStyleSchema,
} from './screen';

describe('DatasourceFieldType', () => {
  it('accepts all valid field types', () => {
    const types = ['text', 'number', 'image_url', 'boolean', 'date', 'rich_text', 'url', 'geolocation'];
    for (const t of types) {
      expect(DatasourceFieldType.parse(t)).toBe(t);
    }
  });

  it('rejects invalid field types', () => {
    expect(() => DatasourceFieldType.parse('color')).toThrow();
    expect(() => DatasourceFieldType.parse('')).toThrow();
  });
});

describe('ScreenComponentType', () => {
  it('accepts all 23 component types', () => {
    const types = [
      'text', 'button', 'image', 'combobox', 'gallery', 'container',
      'horizontal_scroll', 'carousel', 'hero', 'spacer', 'divider',
      'input', 'video', 'icon', 'card', 'avatar', 'badge', 'list',
      'checkbox', 'rating_stars', 'price_tag', 'map_view', 'chip',
    ];
    for (const t of types) {
      expect(ScreenComponentType.parse(t)).toBe(t);
    }
  });
});

describe('COMPONENT_DEFAULTS', () => {
  it('has defaults for every component type', () => {
    const types = ScreenComponentType.options;
    for (const t of types) {
      expect(COMPONENT_DEFAULTS[t]).toBeDefined();
      expect(COMPONENT_DEFAULTS[t].label).toBeTruthy();
      expect(COMPONENT_DEFAULTS[t].icon).toBeTruthy();
      expect(COMPONENT_DEFAULTS[t].props).toBeDefined();
    }
  });

  it('map_view includes markers array in props', () => {
    expect(COMPONENT_DEFAULTS.map_view.props.markers).toEqual([]);
  });
});

describe('ScreenComponentSchema', () => {
  it('validates a minimal component', () => {
    const result = ScreenComponentSchema.safeParse({
      id: 'c1',
      type: 'text',
      props: { content: 'Hello' },
    });
    expect(result.success).toBe(true);
  });

  it('validates component with children', () => {
    const result = ScreenComponentSchema.safeParse({
      id: 'c1',
      type: 'container',
      props: { direction: 'vertical' },
      children: [
        { id: 'c2', type: 'text', props: { content: 'Nested' } },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('validates component with datasource binding', () => {
    const result = ScreenComponentSchema.safeParse({
      id: 'c1',
      type: 'list',
      props: {},
      datasource: {
        datasourceId: 'ds_1',
        fieldMappings: { content: 'title' },
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid component type', () => {
    const result = ScreenComponentSchema.safeParse({
      id: 'c1',
      type: 'unknown_widget',
      props: {},
    });
    expect(result.success).toBe(false);
  });
});

describe('ComponentStyleSchema', () => {
  it('validates opacity within range', () => {
    expect(ComponentStyleSchema.safeParse({ opacity: 0.5 }).success).toBe(true);
    expect(ComponentStyleSchema.safeParse({ opacity: 0 }).success).toBe(true);
    expect(ComponentStyleSchema.safeParse({ opacity: 1 }).success).toBe(true);
  });

  it('rejects opacity out of range', () => {
    expect(ComponentStyleSchema.safeParse({ opacity: 1.5 }).success).toBe(false);
    expect(ComponentStyleSchema.safeParse({ opacity: -0.1 }).success).toBe(false);
  });

  it('accepts dimension as number or string', () => {
    expect(ComponentStyleSchema.safeParse({ width: 100 }).success).toBe(true);
    expect(ComponentStyleSchema.safeParse({ width: '100%' }).success).toBe(true);
  });
});
