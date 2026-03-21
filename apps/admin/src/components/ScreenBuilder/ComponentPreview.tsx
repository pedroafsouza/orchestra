import type { ScreenComponent, Breakpoint } from '@orchestra/shared';
import { COMPONENT_DEFAULTS } from '@orchestra/shared';
import { useScreenStore } from './screenStore';
import { resolveStyle } from '@/lib/resolveStyle';
import { COMPONENT_RENDERERS } from '@/lib/renderers';
import type { ComponentRenderContext } from '@/lib/renderers';

interface Props {
  component: ScreenComponent;
  index: number;
  breakpoint: Breakpoint;
}

const EMPTY_MAP = new Map<string, Record<string, any>[]>();
const noop = () => {};

export function ComponentPreview({ component, index, breakpoint }: Props) {
  const selectComponent = useScreenStore((s) => s.selectComponent);
  const selectedComponentId = useScreenStore((s) => s.selectedComponentId);
  const isSelected = selectedComponentId === component.id;

  const renderChildren = (
    children: ScreenComponent[] | undefined,
    _childEntry?: Record<string, any>,
  ) =>
    children?.map((child, i) => (
      <ComponentPreview
        key={child.id}
        component={child}
        index={i}
        breakpoint={breakpoint}
      />
    ));

  const ctx: ComponentRenderContext = {
    breakpoint,
    entry: undefined,
    resolvedStyle: resolveStyle(component, breakpoint),
    renderChildren,
    interactive: false,
    datasourceData: EMPTY_MAP,
    formValues: {},
    checkedValues: {},
    onFormChange: noop,
    onCheckedChange: noop,
    onNavigate: noop,
    onAction: noop,
    executeActions: noop,
  };

  const renderer = COMPONENT_RENDERERS[component.type];
  const content = renderer
    ? renderer(component, ctx)
    : (
        <div style={{ padding: 8, color: '#64748b', fontSize: 12 }}>
          [{component.type}]
        </div>
      );

  return (
    <div
      style={{
        position: 'relative',
        outline: isSelected ? '2px solid #6366f1' : '1px solid transparent',
        outlineOffset: 1,
        borderRadius: 4,
        cursor: 'pointer',
        transition: 'outline-color 0.15s',
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.outlineColor = '#6366f180';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.outlineColor = 'transparent';
        }
      }}
    >
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: -16,
            left: 0,
            fontSize: 9,
            backgroundColor: '#6366f1',
            color: '#fff',
            padding: '1px 6px',
            borderRadius: '4px 4px 0 0',
            zIndex: 10,
          }}
        >
          {COMPONENT_DEFAULTS[component.type]?.label || component.type}
        </div>
      )}
      {content}
    </div>
  );
}
