import { useState, useCallback } from 'react';
import type {
  ScreenComponent,
  Breakpoint,
} from '@orchestra/shared';
import { resolveStyle } from '@/lib/resolveStyle';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PreviewRuntimeProps {
  rootComponents: ScreenComponent[];
  backgroundColor: string;
  breakpoint: Breakpoint;
  datasourceData: Map<string, Record<string, any>[]>;
  onNavigate: (nodeId: string) => void;
  onAction: (action: {
    type: string;
    payload: any;
    formValues: Record<string, string>;
  }) => void;
}

interface RuntimeComponentProps {
  component: ScreenComponent;
  breakpoint: Breakpoint;
  datasourceData: Map<string, Record<string, any>[]>;
  entry?: Record<string, any>;
  formValues: Record<string, string>;
  checkedValues: Record<string, boolean>;
  onFormChange: (componentId: string, value: string) => void;
  onCheckedChange: (componentId: string, value: boolean) => void;
  onNavigate: (nodeId: string) => void;
  onAction: (action: {
    type: string;
    payload: any;
    formValues: Record<string, string>;
  }) => void;
}

// ─── Template interpolation ─────────────────────────────────────────────────

function interpolate(
  template: string,
  entry: Record<string, any> | undefined,
): string {
  if (!entry) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = entry[key];
    return val !== undefined && val !== null ? String(val) : '';
  });
}

// ─── Resolve a prop value via datasource field mapping ──────────────────────

function resolveProp(
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

// ─── RuntimeComponent ───────────────────────────────────────────────────────

function RuntimeComponent({
  component,
  breakpoint,
  datasourceData,
  entry,
  formValues,
  checkedValues,
  onFormChange,
  onCheckedChange,
  onNavigate,
  onAction,
}: RuntimeComponentProps) {
  if (component.hidden) return null;

  const { props, type } = component;

  // Helper to render children recursively
  const renderChildren = (
    children: ScreenComponent[] | undefined,
    childEntry?: Record<string, any>,
  ) =>
    children?.map((child) => (
      <RuntimeComponent
        key={child.id}
        component={child}
        breakpoint={breakpoint}
        datasourceData={datasourceData}
        entry={childEntry ?? entry}
        formValues={formValues}
        checkedValues={checkedValues}
        onFormChange={onFormChange}
        onCheckedChange={onCheckedChange}
        onNavigate={onNavigate}
        onAction={onAction}
      />
    ));

  // Helper to execute actions attached to a component
  const executeActions = () => {
    if (component.actions) {
      for (const action of component.actions) {
        onAction({
          type: action.type,
          payload: action,
          formValues,
        });
      }
    }
  };

  switch (type) {
    // ── Text ──────────────────────────────────────────────────────────────
    case 'text': {
      let content = resolveProp('content', component, entry);
      if (typeof content === 'string' && entry) {
        content = interpolate(content, entry);
      }
      return (
        <p
          style={{
            margin: 0,
            color: '#f8fafc',
            fontSize: 14,
            ...resolveStyle(component, breakpoint),
          }}
        >
          {content || 'Text'}
        </p>
      );
    }

    // ── Button ────────────────────────────────────────────────────────────
    case 'button':
      return (
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (props.navigateTo) onNavigate(props.navigateTo);
            executeActions();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (props.navigateTo) onNavigate(props.navigateTo);
              executeActions();
            }
          }}
          style={{
            backgroundColor: '#6366f1',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            userSelect: 'none',
            ...resolveStyle(component, breakpoint),
          }}
        >
          {props.label || 'Button'}
        </div>
      );

    // ── Image ─────────────────────────────────────────────────────────────
    case 'image': {
      const src = resolveProp('src', component, entry);
      return src ? (
        <img
          src={src}
          alt={props.alt || ''}
          style={{
            width: '100%',
            borderRadius: 8,
            ...resolveStyle(component, breakpoint),
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: 120,
            backgroundColor: '#1e293b',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            fontSize: 12,
            ...resolveStyle(component, breakpoint),
          }}
        >
          Image placeholder
        </div>
      );
    }

    // ── Input ─────────────────────────────────────────────────────────────
    case 'input':
      return (
        <input
          type={props.type || 'text'}
          placeholder={props.placeholder || 'Input...'}
          value={formValues[component.id] ?? ''}
          onChange={(e) => onFormChange(component.id, e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            color: '#f8fafc',
            fontSize: 14,
            boxSizing: 'border-box',
            outline: 'none',
            ...resolveStyle(component, breakpoint),
          }}
        />
      );

    // ── Combobox ──────────────────────────────────────────────────────────
    case 'combobox':
      return (
        <select
          value={formValues[component.id] ?? ''}
          onChange={(e) => onFormChange(component.id, e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            color: '#94a3b8',
            fontSize: 14,
            ...resolveStyle(component, breakpoint),
          }}
        >
          <option value="">{props.placeholder || 'Choose...'}</option>
          {(props.options as string[] | undefined)?.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    // ── Spacer ────────────────────────────────────────────────────────────
    case 'spacer':
      return <div style={{ height: props.height || 16 }} />;

    // ── Divider ───────────────────────────────────────────────────────────
    case 'divider':
      return (
        <hr
          style={{
            border: 'none',
            borderTop: `${props.thickness || 1}px solid ${props.color || '#334155'}`,
            margin: 0,
          }}
        />
      );

    // ── Icon ──────────────────────────────────────────────────────────────
    case 'icon':
      return (
        <div
          style={{
            textAlign: 'center',
            fontSize: props.size || 24,
            color: props.color || '#fff',
          }}
        >
          {'\u2B50'}
        </div>
      );

    // ── Avatar ────────────────────────────────────────────────────────────
    case 'avatar': {
      const avatarSrc = resolveProp('src', component, entry);
      return (
        <div
          style={{
            width: props.size || 48,
            height: props.size || 48,
            borderRadius: '50%',
            backgroundColor: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: 18,
            ...resolveStyle(component, breakpoint),
          }}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
              }}
            />
          ) : (
            '\u{1F464}'
          )}
        </div>
      );
    }

    // ── Badge ─────────────────────────────────────────────────────────────
    case 'badge': {
      const badgeText = resolveProp('text', component, entry);
      return (
        <span
          style={{
            display: 'inline-block',
            backgroundColor: props.color || '#6366f1',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
            ...resolveStyle(component, breakpoint),
          }}
        >
          {badgeText || 'Badge'}
        </span>
      );
    }

    // ── Gallery ───────────────────────────────────────────────────────────
    case 'gallery':
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${props.columns || 2}, 1fr)`,
            gap: 8,
            ...resolveStyle(component, breakpoint),
          }}
        >
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              style={{
                aspectRatio: '1',
                backgroundColor: '#1e293b',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                fontSize: 10,
              }}
            >
              {'\u{1F4F7}'}
            </div>
          ))}
        </div>
      );

    // ── Video ─────────────────────────────────────────────────────────────
    case 'video':
      return (
        <div
          style={{
            width: '100%',
            height: 180,
            backgroundColor: '#0f172a',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            ...resolveStyle(component, breakpoint),
          }}
        >
          {'\u25B6'} Video
        </div>
      );

    // ── Hero ──────────────────────────────────────────────────────────────
    case 'hero':
      return (
        <div
          style={{
            width: '100%',
            minHeight: 200,
            backgroundImage: props.backgroundImage
              ? `url(${props.backgroundImage})`
              : undefined,
            backgroundColor: '#1e293b',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            ...resolveStyle(component, breakpoint),
          }}
        >
          {props.overlay && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
              }}
            />
          )}
          <div style={{ position: 'relative', zIndex: 1, padding: 24 }}>
            {renderChildren(component.children)}
            {(!component.children || component.children.length === 0) && (
              <p style={{ color: '#94a3b8', fontSize: 12 }}>
                Hero / Panoramic section
              </p>
            )}
          </div>
        </div>
      );

    // ── Container / Card ──────────────────────────────────────────────────
    case 'container':
    case 'card':
      return (
        <div
          style={{
            display: 'flex',
            flexDirection:
              props.direction === 'horizontal' ? 'row' : 'column',
            gap: props.gap || 8,
            padding: type === 'card' ? 16 : 0,
            backgroundColor: type === 'card' ? '#1e293b' : 'transparent',
            borderRadius: type === 'card' ? 12 : 0,
            ...resolveStyle(component, breakpoint),
          }}
        >
          {renderChildren(component.children)}
          {(!component.children || component.children.length === 0) && (
            <p
              style={{
                color: '#475569',
                fontSize: 11,
                textAlign: 'center',
                padding: 12,
              }}
            >
              {type === 'card' ? 'Card' : 'Container'} — empty
            </p>
          )}
        </div>
      );

    // ── Horizontal Scroll ─────────────────────────────────────────────────
    case 'horizontal_scroll':
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: props.gap || 12,
            overflowX: 'auto',
            padding: '4px 0',
            ...resolveStyle(component, breakpoint),
          }}
        >
          {component.children?.map((child) => (
            <div key={child.id} style={{ flexShrink: 0 }}>
              <RuntimeComponent
                component={child}
                breakpoint={breakpoint}
                datasourceData={datasourceData}
                entry={entry}
                formValues={formValues}
                checkedValues={checkedValues}
                onFormChange={onFormChange}
                onCheckedChange={onCheckedChange}
                onNavigate={onNavigate}
                onAction={onAction}
              />
            </div>
          ))}
          {(!component.children || component.children.length === 0) && (
            <p style={{ color: '#475569', fontSize: 11, padding: 12 }}>
              Horizontal scroll — empty
            </p>
          )}
        </div>
      );

    // ── Carousel ──────────────────────────────────────────────────────────
    case 'carousel':
      return (
        <div
          style={{
            width: '100%',
            height: 180,
            backgroundColor: '#1e293b',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            fontSize: 12,
            ...resolveStyle(component, breakpoint),
          }}
        >
          {'\u{1F3A0}'} Carousel ({component.children?.length || 0} slides)
        </div>
      );

    // ── Checkbox ──────────────────────────────────────────────────────────
    case 'checkbox': {
      const isChecked = checkedValues[component.id] ?? props.checked ?? false;
      return (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            color: '#f8fafc',
            fontSize: 14,
            userSelect: 'none',
            ...resolveStyle(component, breakpoint),
          }}
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              onCheckedChange(component.id, e.target.checked);
              // Fire attached actions (e.g. DATASOURCE_UPDATE)
              if (component.actions) {
                for (const action of component.actions) {
                  onAction({
                    type: action.type,
                    payload: {
                      ...action,
                      checked: e.target.checked,
                      entry,
                    },
                    formValues,
                  });
                }
              }
            }}
            style={{
              width: 18,
              height: 18,
              accentColor: '#6366f1',
              cursor: 'pointer',
            }}
          />
          {props.label || 'Checkbox'}
        </label>
      );
    }

    // ── List (datasource-aware) ───────────────────────────────────────────
    case 'list': {
      const dsId = component.datasource?.datasourceId;
      const entries = dsId ? datasourceData.get(dsId) : undefined;

      if (entries && entries.length > 0 && component.children?.length) {
        return (
          <div
            style={{
              display: 'flex',
              flexDirection:
                props.direction === 'horizontal' ? 'row' : 'column',
              gap: props.gap || 8,
              ...resolveStyle(component, breakpoint),
            }}
          >
            {entries.map((row, rowIndex) => (
              <div
                key={rowIndex}
                style={{
                  display: 'flex',
                  flexDirection:
                    props.direction === 'horizontal' ? 'row' : 'column',
                  gap: props.gap || 8,
                }}
              >
                {renderChildren(component.children, row)}
              </div>
            ))}
          </div>
        );
      }

      // No datasource or no entries — render children as-is
      return (
        <div
          style={{
            display: 'flex',
            flexDirection:
              props.direction === 'horizontal' ? 'row' : 'column',
            gap: props.gap || 8,
            ...resolveStyle(component, breakpoint),
          }}
        >
          {renderChildren(component.children)}
          {(!component.children || component.children.length === 0) && (
            <p
              style={{
                color: '#475569',
                fontSize: 11,
                textAlign: 'center',
                padding: 12,
              }}
            >
              List — bind to datasource or add items
            </p>
          )}
        </div>
      );
    }

    // ── Rating Stars ──────────────────────────────────────────────────────
    case 'rating_stars': {
      const val = resolveProp('value', component, entry) || 0;
      const max = props.max || 5;
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            ...resolveStyle(component, breakpoint),
          }}
        >
          {Array.from({ length: max }, (_, i) => (
            <span
              key={i}
              style={{
                color: i < Math.floor(val) ? '#f59e0b' : '#334155',
                fontSize: 16,
              }}
            >
              {i < val ? '\u2605' : '\u2606'}
            </span>
          ))}
          <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 4 }}>
            {val}
          </span>
        </div>
      );
    }

    // ── Price Tag ─────────────────────────────────────────────────────────
    case 'price_tag': {
      const amount = resolveProp('amount', component, entry) ?? 0;
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 2,
            ...resolveStyle(component, breakpoint),
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc' }}>
            {props.currency || '$'}
            {amount}
          </span>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>
            {props.period || '/night'}
          </span>
        </div>
      );
    }

    // ── Map View ──────────────────────────────────────────────────────────
    case 'map_view': {
      // Resolve markers from datasource binding
      const mapDsId = component.datasource?.datasourceId;
      const mapEntries = mapDsId ? datasourceData.get(mapDsId) : undefined;
      const markerCount =
        mapEntries && component.datasource?.fieldMappings?.markerPosition
          ? mapEntries.length
          : 0;

      return (
        <div
          style={{
            width: '100%',
            height: props.height || 200,
            backgroundColor: '#1a2332',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            fontSize: 12,
            position: 'relative',
            overflow: 'hidden',
            gap: 6,
            ...resolveStyle(component, breakpoint),
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.15,
              background:
                'repeating-linear-gradient(0deg, transparent, transparent 20px, #334155 20px, #334155 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, #334155 20px, #334155 21px)',
            }}
          />
          <span style={{ zIndex: 1 }}>{'\u{1F4CD}'} Map View</span>
          {markerCount > 0 && (
            <span
              style={{
                zIndex: 1,
                backgroundColor: '#6366f1',
                color: '#fff',
                padding: '2px 10px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {markerCount} {markerCount === 1 ? 'event' : 'events'}
            </span>
          )}
        </div>
      );
    }

    // ── Chip ──────────────────────────────────────────────────────────────
    case 'chip': {
      const chipLabel = resolveProp('label', component, entry);
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 500,
            border: '1px solid #334155',
            color: '#e2e8f0',
            backgroundColor:
              props.variant === 'filled' ? '#334155' : 'transparent',
            ...resolveStyle(component, breakpoint),
          }}
        >
          {chipLabel || 'Chip'}
        </span>
      );
    }

    // ── Unknown ───────────────────────────────────────────────────────────
    default:
      return (
        <div style={{ padding: 8, color: '#64748b', fontSize: 12 }}>
          [{type}]
        </div>
      );
  }
}

// ─── PreviewRuntime (top-level) ─────────────────────────────────────────────

export function PreviewRuntime({
  rootComponents,
  backgroundColor,
  breakpoint,
  datasourceData,
  onNavigate,
  onAction,
}: PreviewRuntimeProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [checkedValues, setCheckedValues] = useState<Record<string, boolean>>(
    {},
  );

  const handleFormChange = useCallback(
    (componentId: string, value: string) => {
      setFormValues((prev) => ({ ...prev, [componentId]: value }));
    },
    [],
  );

  const handleCheckedChange = useCallback(
    (componentId: string, value: boolean) => {
      setCheckedValues((prev) => ({ ...prev, [componentId]: value }));
    },
    [],
  );

  return (
    <div
      style={{
        backgroundColor: backgroundColor || '#0f172a',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {rootComponents.map((comp) => (
        <RuntimeComponent
          key={comp.id}
          component={comp}
          breakpoint={breakpoint}
          datasourceData={datasourceData}
          formValues={formValues}
          checkedValues={checkedValues}
          onFormChange={handleFormChange}
          onCheckedChange={handleCheckedChange}
          onNavigate={onNavigate}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
