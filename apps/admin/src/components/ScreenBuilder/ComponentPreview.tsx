import type { ScreenComponent, Breakpoint } from '@orchestra/shared';
import { COMPONENT_DEFAULTS } from '@orchestra/shared';
import { useScreenStore } from './screenStore';
import { resolveStyle } from '@/lib/resolveStyle';

interface Props {
  component: ScreenComponent;
  index: number;
  breakpoint: Breakpoint;
}

function renderComponentContent(
  component: ScreenComponent,
  breakpoint: Breakpoint
): React.ReactNode {
  const { props, type } = component;

  switch (type) {
    case 'text':
      return (
        <p style={{ margin: 0, color: '#f8fafc', fontSize: 14, ...resolveStyle(component, breakpoint) }}>
          {props.content || 'Text'}
        </p>
      );

    case 'button':
      return (
        <div
          style={{
            backgroundColor: '#6366f1',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            ...resolveStyle(component, breakpoint),
          }}
        >
          {props.label || 'Button'}
        </div>
      );

    case 'image':
      return props.src ? (
        <img
          src={props.src}
          alt={props.alt || ''}
          style={{ width: '100%', borderRadius: 8, ...resolveStyle(component, breakpoint) }}
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
          {'\u{1F5BC}'} Image placeholder
        </div>
      );

    case 'input':
      return (
        <input
          type={props.type || 'text'}
          placeholder={props.placeholder || 'Input...'}
          disabled
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            color: '#f8fafc',
            fontSize: 14,
            boxSizing: 'border-box',
            ...resolveStyle(component, breakpoint),
          }}
        />
      );

    case 'combobox':
      return (
        <select
          disabled
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
          <option>{props.placeholder || 'Choose...'}</option>
        </select>
      );

    case 'spacer':
      return <div style={{ height: props.height || 16 }} />;

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

    case 'icon':
      return (
        <div style={{ textAlign: 'center', fontSize: props.size || 24, color: props.color || '#fff' }}>
          {'\u{2B50}'}
        </div>
      );

    case 'avatar':
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
          {props.src ? <img src={props.src} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : '\u{1F464}'}
        </div>
      );

    case 'badge':
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
          {props.text || 'Badge'}
        </span>
      );

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
          {'\u{25B6}'} Video
        </div>
      );

    case 'hero':
      return (
        <div
          style={{
            width: '100%',
            minHeight: 200,
            backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : undefined,
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
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
          )}
          <div style={{ position: 'relative', zIndex: 1, padding: 24 }}>
            {component.children?.map((child, i) => (
              <ComponentPreview key={child.id} component={child} index={i} breakpoint={breakpoint} />
            ))}
            {(!component.children || component.children.length === 0) && (
              <p style={{ color: '#94a3b8', fontSize: 12 }}>Hero / Panoramic section</p>
            )}
          </div>
        </div>
      );

    case 'container':
    case 'card':
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: props.direction === 'horizontal' ? 'row' : 'column',
            gap: props.gap || 8,
            padding: type === 'card' ? 16 : 0,
            backgroundColor: type === 'card' ? '#1e293b' : 'transparent',
            borderRadius: type === 'card' ? 12 : 0,
            ...resolveStyle(component, breakpoint),
          }}
        >
          {component.children?.map((child, i) => (
            <ComponentPreview key={child.id} component={child} index={i} breakpoint={breakpoint} />
          ))}
          {(!component.children || component.children.length === 0) && (
            <p style={{ color: '#475569', fontSize: 11, textAlign: 'center', padding: 12 }}>
              {type === 'card' ? 'Card' : 'Container'} — drop components here
            </p>
          )}
        </div>
      );

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
          {component.children?.map((child, i) => (
            <div key={child.id} style={{ flexShrink: 0 }}>
              <ComponentPreview component={child} index={i} breakpoint={breakpoint} />
            </div>
          ))}
          {(!component.children || component.children.length === 0) && (
            <p style={{ color: '#475569', fontSize: 11, padding: 12 }}>
              Horizontal scroll — add children
            </p>
          )}
        </div>
      );

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

    case 'checkbox':
      return (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            color: '#f8fafc',
            fontSize: 14,
            ...resolveStyle(component, breakpoint),
          }}
        >
          <input
            type="checkbox"
            checked={props.checked || false}
            disabled
            style={{
              width: 18,
              height: 18,
              accentColor: '#6366f1',
            }}
          />
          {props.label || 'Checkbox'}
        </label>
      );

    case 'list':
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: props.direction === 'horizontal' ? 'row' : 'column',
            gap: props.gap || 8,
            ...resolveStyle(component, breakpoint),
          }}
        >
          {component.children?.map((child, i) => (
            <ComponentPreview key={child.id} component={child} index={i} breakpoint={breakpoint} />
          ))}
          {(!component.children || component.children.length === 0) && (
            <p style={{ color: '#475569', fontSize: 11, textAlign: 'center', padding: 12 }}>
              List — bind to datasource or add items
            </p>
          )}
        </div>
      );

    case 'rating_stars': {
      const val = props.value || 0;
      const max = props.max || 5;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, ...resolveStyle(component, breakpoint) }}>
          {Array.from({ length: max }, (_, i) => (
            <span key={i} style={{ color: i < Math.floor(val) ? '#f59e0b' : '#334155', fontSize: 16 }}>
              {i < val ? '\u2605' : '\u2606'}
            </span>
          ))}
          <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 4 }}>{val}</span>
        </div>
      );
    }

    case 'price_tag':
      return (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, ...resolveStyle(component, breakpoint) }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc' }}>
            {props.currency || '$'}{props.amount ?? 0}
          </span>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{props.period || '/night'}</span>
        </div>
      );

    case 'map_view': {
      const hasDsMarkers = !!component.datasource?.fieldMappings?.markerPosition;
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
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'repeating-linear-gradient(0deg, transparent, transparent 20px, #334155 20px, #334155 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, #334155 20px, #334155 21px)' }} />
          <span style={{ zIndex: 1 }}>{'\u{1F4CD}'} Map View</span>
          {hasDsMarkers && (
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
              Datasource markers
            </span>
          )}
        </div>
      );
    }

    case 'chip':
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
            backgroundColor: props.variant === 'filled' ? '#334155' : 'transparent',
            ...resolveStyle(component, breakpoint),
          }}
        >
          {props.label || 'Chip'}
        </span>
      );

    default:
      return (
        <div style={{ padding: 8, color: '#64748b', fontSize: 12 }}>
          [{type}]
        </div>
      );
  }
}

export function ComponentPreview({ component, index, breakpoint }: Props) {
  const selectComponent = useScreenStore((s) => s.selectComponent);
  const selectedComponentId = useScreenStore((s) => s.selectedComponentId);
  const isSelected = selectedComponentId === component.id;

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
      {renderComponentContent(component, breakpoint)}
    </div>
  );
}
