import type { ComponentRenderer } from './types';

const TAB_ICONS: Record<string, string> = {
  home: '\u{1F3E0}',
  search: '\u{1F50D}',
  user: '\u{1F464}',
  profile: '\u{1F464}',
  settings: '\u{2699}',
  heart: '\u{2764}',
  star: '\u{2B50}',
  cart: '\u{1F6D2}',
  bell: '\u{1F514}',
  chat: '\u{1F4AC}',
};

const renderContainer: ComponentRenderer = (component, ctx) => {
  const { props, type } = component;
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
        ...ctx.resolvedStyle,
      }}
    >
      {ctx.renderChildren(component.children)}
      {(!component.children || component.children.length === 0) && (
        <p
          style={{
            color: '#475569',
            fontSize: 11,
            textAlign: 'center',
            padding: 12,
          }}
        >
          {type === 'card' ? 'Card' : 'Container'} {ctx.interactive ? '— empty' : '— drop components here'}
        </p>
      )}
    </div>
  );
};

const renderHorizontalScroll: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: props.gap || 12,
        overflowX: 'auto',
        padding: '4px 0',
        ...ctx.resolvedStyle,
      }}
    >
      {component.children?.map((child) => (
        <div key={child.id} style={{ flexShrink: 0 }}>
          {ctx.renderChildren([child])}
        </div>
      ))}
      {(!component.children || component.children.length === 0) && (
        <p style={{ color: '#475569', fontSize: 11, padding: 12 }}>
          Horizontal scroll {ctx.interactive ? '— empty' : '— add children'}
        </p>
      )}
    </div>
  );
};

const renderCarousel: ComponentRenderer = (component, ctx) => {
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
        ...ctx.resolvedStyle,
      }}
    >
      {'\u{1F3A0}'} Carousel ({component.children?.length || 0} slides)
    </div>
  );
};

const renderHero: ComponentRenderer = (component, ctx) => {
  const { props } = component;
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
        ...ctx.resolvedStyle,
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
        {ctx.renderChildren(component.children)}
        {(!component.children || component.children.length === 0) && (
          <p style={{ color: '#94a3b8', fontSize: 12 }}>
            Hero / Panoramic section
          </p>
        )}
      </div>
    </div>
  );
};

const renderList: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const dsId = component.datasource?.datasourceId;
  const entries = dsId ? ctx.datasourceData.get(dsId) : undefined;

  if (ctx.interactive && entries && entries.length > 0 && component.children?.length) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection:
            props.direction === 'horizontal' ? 'row' : 'column',
          gap: props.gap || 8,
          ...ctx.resolvedStyle,
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
            {ctx.renderChildren(component.children, row)}
          </div>
        ))}
      </div>
    );
  }

  // No datasource, no entries, or non-interactive — render children as-is
  return (
    <div
      style={{
        display: 'flex',
        flexDirection:
          props.direction === 'horizontal' ? 'row' : 'column',
        gap: props.gap || 8,
        ...ctx.resolvedStyle,
      }}
    >
      {ctx.renderChildren(component.children)}
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
};

const renderTabBar: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const items = (props.items as { label: string; icon?: string }[]) || [];
  const activeIdx = props.activeIndex ?? 0;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#1e293b',
        borderTop: '1px solid #334155',
        padding: '8px 0 10px',
        ...ctx.resolvedStyle,
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            flex: 1,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 18 }}>
            {TAB_ICONS[item.icon || ''] || '\u{25CF}'}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: i === activeIdx ? 600 : 400,
              color: i === activeIdx ? '#6366f1' : '#94a3b8',
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
      {items.length === 0 && (
        <span style={{ color: '#475569', fontSize: 11, padding: 8 }}>
          Tab Bar — add items
        </span>
      )}
    </div>
  );
};

export const layoutRenderers = {
  container: renderContainer,
  card: renderContainer,
  horizontal_scroll: renderHorizontalScroll,
  carousel: renderCarousel,
  hero: renderHero,
  list: renderList,
  tab_bar: renderTabBar,
};
