import type { ScreenComponent, Breakpoint, ComponentStyle } from '@orchestra/shared';

/**
 * Merges base + breakpoint-specific styles into a React CSSProperties object.
 * Shared by ComponentPreview (screen builder) and PreviewRuntime (live preview).
 */
export function resolveStyle(
  component: ScreenComponent,
  breakpoint: Breakpoint,
): React.CSSProperties {
  const base = component.style?.base || {};
  const bpStyle = component.style?.[breakpoint] || {};
  const merged: ComponentStyle = { ...base, ...bpStyle };

  const css: React.CSSProperties = {};

  if (merged.backgroundColor) css.backgroundColor = merged.backgroundColor;
  if (merged.textColor) css.color = merged.textColor;
  if (merged.fontSize) css.fontSize = merged.fontSize;
  if (merged.fontWeight) css.fontWeight = merged.fontWeight as any;
  if (merged.textAlign) css.textAlign = merged.textAlign;
  if (merged.opacity !== undefined) css.opacity = merged.opacity;
  if (merged.width) css.width = merged.width;
  if (merged.height) css.height = merged.height;
  if (merged.minHeight) css.minHeight = merged.minHeight;
  if (merged.alignSelf) css.alignSelf = merged.alignSelf;

  if (merged.padding) {
    css.paddingTop = merged.padding.top;
    css.paddingRight = merged.padding.right;
    css.paddingBottom = merged.padding.bottom;
    css.paddingLeft = merged.padding.left;
  }
  if (merged.margin) {
    css.marginTop = merged.margin.top;
    css.marginRight = merged.margin.right;
    css.marginBottom = merged.margin.bottom;
    css.marginLeft = merged.margin.left;
  }
  if (merged.border) {
    if (merged.border.width) css.borderWidth = merged.border.width;
    if (merged.border.color) {
      css.borderColor = merged.border.color;
      css.borderStyle = 'solid';
    }
    if (merged.border.radius) css.borderRadius = merged.border.radius;
  }
  if (merged.shadow) {
    css.boxShadow = `${merged.shadow.offsetX || 0}px ${merged.shadow.offsetY || 2}px ${merged.shadow.blur || 4}px ${merged.shadow.color || 'rgba(0,0,0,0.2)'}`;
  }

  return css;
}
