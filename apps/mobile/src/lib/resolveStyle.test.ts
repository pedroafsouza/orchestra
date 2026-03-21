import { describe, it, expect } from 'vitest';
import { resolveStyle } from './resolveStyle';
import type { ScreenComponent } from '@orchestra/shared';

function makeComponent(style?: ScreenComponent['style']): ScreenComponent {
  return { id: 'c1', type: 'text', props: {}, style };
}

describe('resolveStyle (React Native)', () => {
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

  it('merges breakpoint overrides on top of base', () => {
    const result = resolveStyle(
      makeComponent({
        base: { backgroundColor: '#fff', fontSize: 16 },
        phone: { fontSize: 14 },
      }),
      'phone',
    );
    expect(result.backgroundColor).toBe('#fff');
    expect(result.fontSize).toBe(14);
  });

  it('maps textColor to RN color property', () => {
    const result = resolveStyle(
      makeComponent({ base: { textColor: '#333' } }),
      'phone',
    );
    expect(result.color).toBe('#333');
  });

  it('expands padding into directional properties', () => {
    const result = resolveStyle(
      makeComponent({ base: { padding: { top: 10, right: 20, bottom: 30, left: 40 } } }),
      'phone',
    );
    expect(result.paddingTop).toBe(10);
    expect(result.paddingRight).toBe(20);
    expect(result.paddingBottom).toBe(30);
    expect(result.paddingLeft).toBe(40);
  });

  it('maps border properties for RN', () => {
    const result = resolveStyle(
      makeComponent({ base: { border: { width: 2, color: '#000', radius: 8 } } }),
      'phone',
    );
    expect(result.borderWidth).toBe(2);
    expect(result.borderColor).toBe('#000');
    expect(result.borderRadius).toBe(8);
  });

  it('converts shadow to RN shadow properties + elevation', () => {
    const result = resolveStyle(
      makeComponent({ base: { shadow: { offsetX: 1, offsetY: 3, blur: 6, color: 'rgba(0,0,0,0.5)' } } }),
      'phone',
    );
    expect(result.shadowColor).toBe('rgba(0,0,0,0.5)');
    expect(result.shadowOffset).toEqual({ width: 1, height: 3 });
    expect(result.shadowOpacity).toBe(1);
    expect(result.shadowRadius).toBe(6);
    expect(result.elevation).toBe(6);
  });

  it('uses default shadow values when partial', () => {
    const result = resolveStyle(
      makeComponent({ base: { shadow: {} } }),
      'phone',
    );
    expect(result.shadowColor).toBe('rgba(0,0,0,0.2)');
    expect(result.shadowOffset).toEqual({ width: 0, height: 2 });
    expect(result.shadowRadius).toBe(4);
    expect(result.elevation).toBe(4);
  });

  it('handles percentage width as string', () => {
    const result = resolveStyle(
      makeComponent({ base: { width: '100%' } }),
      'phone',
    );
    expect(result.width).toBe('100%');
  });

  it('handles numeric width', () => {
    const result = resolveStyle(
      makeComponent({ base: { width: 200 } }),
      'phone',
    );
    expect(result.width).toBe(200);
  });

  it('handles opacity of 0', () => {
    const result = resolveStyle(
      makeComponent({ base: { opacity: 0 } }),
      'phone',
    );
    expect(result.opacity).toBe(0);
  });
});
