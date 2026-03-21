import type { ViewStyle, TextStyle } from 'react-native';
import type { ScreenComponent, Breakpoint, ComponentStyle } from '@orchestra/shared';

type RNStyle = ViewStyle & TextStyle;

/**
 * Merges base + breakpoint-specific styles into React Native style objects.
 * Port of the admin resolveStyle for React Native.
 */
export function resolveStyle(
  component: ScreenComponent,
  breakpoint: Breakpoint,
): RNStyle {
  const base = component.style?.base || {};
  const bpStyle = component.style?.[breakpoint] || {};
  const merged: ComponentStyle = { ...base, ...bpStyle };

  const style: RNStyle = {};

  if (merged.backgroundColor) style.backgroundColor = merged.backgroundColor;
  if (merged.textColor) style.color = merged.textColor;
  if (merged.fontSize) style.fontSize = merged.fontSize;
  if (merged.fontWeight) style.fontWeight = merged.fontWeight as any;
  if (merged.textAlign) style.textAlign = merged.textAlign;
  if (merged.opacity !== undefined) style.opacity = merged.opacity;

  if (merged.width) {
    style.width = typeof merged.width === 'string' && merged.width.endsWith('%')
      ? merged.width as any
      : merged.width;
  }
  if (merged.height) {
    style.height = typeof merged.height === 'string' && merged.height.endsWith('%')
      ? merged.height as any
      : merged.height;
  }
  if (merged.minHeight) {
    style.minHeight = typeof merged.minHeight === 'string' && merged.minHeight.endsWith('%')
      ? merged.minHeight as any
      : merged.minHeight;
  }
  if (merged.alignSelf) style.alignSelf = merged.alignSelf;

  if (merged.padding) {
    if (merged.padding.top !== undefined) style.paddingTop = merged.padding.top;
    if (merged.padding.right !== undefined) style.paddingRight = merged.padding.right;
    if (merged.padding.bottom !== undefined) style.paddingBottom = merged.padding.bottom;
    if (merged.padding.left !== undefined) style.paddingLeft = merged.padding.left;
  }
  if (merged.margin) {
    if (merged.margin.top !== undefined) style.marginTop = merged.margin.top;
    if (merged.margin.right !== undefined) style.marginRight = merged.margin.right;
    if (merged.margin.bottom !== undefined) style.marginBottom = merged.margin.bottom;
    if (merged.margin.left !== undefined) style.marginLeft = merged.margin.left;
  }
  if (merged.border) {
    if (merged.border.width) style.borderWidth = merged.border.width;
    if (merged.border.color) {
      style.borderColor = merged.border.color;
    }
    if (merged.border.radius) style.borderRadius = merged.border.radius;
  }
  if (merged.shadow) {
    style.shadowColor = merged.shadow.color || 'rgba(0,0,0,0.2)';
    style.shadowOffset = {
      width: merged.shadow.offsetX || 0,
      height: merged.shadow.offsetY || 2,
    };
    style.shadowOpacity = 1;
    style.shadowRadius = merged.shadow.blur || 4;
    style.elevation = merged.shadow.blur || 4;
  }

  return style;
}
