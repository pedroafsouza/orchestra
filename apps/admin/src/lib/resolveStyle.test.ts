import { describe, it, expect } from 'vitest';
import { resolveStyle } from './resolveStyle';
import type { ScreenComponent } from '@orchestra/shared';

function makeComponent(style?: ScreenComponent['style']): ScreenComponent {
  return { id: 'c1', type: 'text', props: {}, style };
}

describe('resolveStyle', () => {
  it('returns empty object for component with no styles', () => {
    const result = resolveStyle(makeComponent(), 'phone');
    expect(result).toEqual({});
  });

  it('applies base styles', () => {
    const result = resolveStyle(
      makeComponent({ base: { backgroundColor: '#fff', fontSize: 16 } }),
      'phone',
    );
    expect(result.backgroundColor).toBe('#fff');
    expect(result.fontSize).toBe(16);
  });

  it('merges breakpoint-specific overrides on top of base', () => {
    const result = resolveStyle(
      makeComponent({
        base: { backgroundColor: '#fff', fontSize: 16 },
        phone: { fontSize: 14 },
      }),
      'phone',
    );
    expect(result.backgroundColor).toBe('#fff'); // from base
    expect(result.fontSize).toBe(14); // overridden by phone
  });

  it('maps textColor to CSS color', () => {
    const result = resolveStyle(
      makeComponent({ base: { textColor: '#333' } }),
      'phone',
    );
    expect(result.color).toBe('#333');
  });

  it('expands padding into 4 directional properties', () => {
    const result = resolveStyle(
      makeComponent({ base: { padding: { top: 10, right: 20, bottom: 30, left: 40 } } }),
      'phone',
    );
    expect(result.paddingTop).toBe(10);
    expect(result.paddingRight).toBe(20);
    expect(result.paddingBottom).toBe(30);
    expect(result.paddingLeft).toBe(40);
  });

  it('expands margin into 4 directional properties', () => {
    const result = resolveStyle(
      makeComponent({ base: { margin: { top: 5, right: 10, bottom: 15, left: 20 } } }),
      'phone',
    );
    expect(result.marginTop).toBe(5);
    expect(result.marginRight).toBe(10);
    expect(result.marginBottom).toBe(15);
    expect(result.marginLeft).toBe(20);
  });

  it('maps border properties', () => {
    const result = resolveStyle(
      makeComponent({ base: { border: { width: 2, color: '#000', radius: 8 } } }),
      'phone',
    );
    expect(result.borderWidth).toBe(2);
    expect(result.borderColor).toBe('#000');
    expect(result.borderStyle).toBe('solid');
    expect(result.borderRadius).toBe(8);
  });

  it('generates boxShadow CSS string', () => {
    const result = resolveStyle(
      makeComponent({ base: { shadow: { offsetX: 1, offsetY: 3, blur: 6, color: 'rgba(0,0,0,0.5)' } } }),
      'phone',
    );
    expect(result.boxShadow).toBe('1px 3px 6px rgba(0,0,0,0.5)');
  });

  it('uses default shadow values when partial', () => {
    const result = resolveStyle(
      makeComponent({ base: { shadow: {} } }),
      'phone',
    );
    expect(result.boxShadow).toBe('0px 2px 4px rgba(0,0,0,0.2)');
  });

  it('handles opacity of 0', () => {
    const result = resolveStyle(
      makeComponent({ base: { opacity: 0 } }),
      'phone',
    );
    expect(result.opacity).toBe(0);
  });

  it('handles width, height, minHeight', () => {
    const result = resolveStyle(
      makeComponent({ base: { width: '100%', height: 200, minHeight: 50 } }),
      'phone',
    );
    expect(result.width).toBe('100%');
    expect(result.height).toBe(200);
    expect(result.minHeight).toBe(50);
  });

  it('handles alignSelf and fontWeight', () => {
    const result = resolveStyle(
      makeComponent({ base: { alignSelf: 'center', fontWeight: '700' } }),
      'phone',
    );
    expect(result.alignSelf).toBe('center');
    expect(result.fontWeight).toBe('700');
  });

  it('uses tablet breakpoint when specified', () => {
    const result = resolveStyle(
      makeComponent({
        base: { fontSize: 14 },
        tablet: { fontSize: 18 },
        phone: { fontSize: 12 },
      }),
      'tablet',
    );
    expect(result.fontSize).toBe(18);
  });
});
