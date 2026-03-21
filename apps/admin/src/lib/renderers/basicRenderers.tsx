import { interpolate, resolveProp } from '@orchestra/shared';
import type { ComponentRenderer } from './types';

const renderText: ComponentRenderer = (component, ctx) => {
  let content = resolveProp('content', component, ctx.entry);
  if (typeof content === 'string' && ctx.entry) {
    content = interpolate(content, ctx.entry);
  }
  return (
    <p
      style={{
        margin: 0,
        color: '#f8fafc',
        fontSize: 14,
        ...ctx.resolvedStyle,
      }}
    >
      {content || 'Text'}
    </p>
  );
};

const renderButton: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  return (
    <div
      role="button"
      tabIndex={ctx.interactive ? 0 : undefined}
      onClick={
        ctx.interactive
          ? () => {
              if (props.navigateTo) ctx.onNavigate(props.navigateTo, ctx.entry);
              ctx.executeActions();
            }
          : undefined
      }
      onKeyDown={
        ctx.interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (props.navigateTo) ctx.onNavigate(props.navigateTo, ctx.entry);
                ctx.executeActions();
              }
            }
          : undefined
      }
      style={{
        backgroundColor: '#6366f1',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 600,
        cursor: ctx.interactive ? 'pointer' : 'pointer',
        ...(ctx.interactive ? { userSelect: 'none' as const } : {}),
        ...ctx.resolvedStyle,
      }}
    >
      {props.label || 'Button'}
    </div>
  );
};

const renderImage: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  let src = resolveProp('src', component, ctx.entry);
  if (typeof src === 'string' && ctx.entry) {
    src = interpolate(src, ctx.entry);
  }
  // Fallback: try common image field names from entry
  if (!src && ctx.entry) {
    const imageFields = ['imageUrl', 'image', 'photo', 'thumbnail', 'src', 'url', 'coverImage', 'avatar'];
    for (const field of imageFields) {
      if (ctx.entry[field] && typeof ctx.entry[field] === 'string') {
        src = ctx.entry[field];
        break;
      }
    }
  }
  return src ? (
    <img
      src={src}
      alt={props.alt || ''}
      style={{
        width: '100%',
        borderRadius: 8,
        ...ctx.resolvedStyle,
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
        ...ctx.resolvedStyle,
      }}
    >
      {ctx.interactive ? 'Image placeholder' : '\u{1F5BC} Image placeholder'}
    </div>
  );
};

const renderIcon: ComponentRenderer = (component) => {
  const { props } = component;
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
};

const renderSpacer: ComponentRenderer = (component) => {
  return <div style={{ height: component.props.height || 16 }} />;
};

const renderDivider: ComponentRenderer = (component) => {
  const { props } = component;
  return (
    <hr
      style={{
        border: 'none',
        borderTop: `${props.thickness || 1}px solid ${props.color || '#334155'}`,
        margin: 0,
      }}
    />
  );
};

const renderAvatar: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const avatarSrc = resolveProp('src', component, ctx.entry);
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
        ...ctx.resolvedStyle,
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
};

const renderBadge: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const badgeText = resolveProp('text', component, ctx.entry);
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
        ...ctx.resolvedStyle,
      }}
    >
      {badgeText || 'Badge'}
    </span>
  );
};

const renderChip: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const chipLabel = resolveProp('label', component, ctx.entry);
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
        ...ctx.resolvedStyle,
      }}
    >
      {chipLabel || 'Chip'}
    </span>
  );
};

export const basicRenderers = {
  text: renderText,
  button: renderButton,
  image: renderImage,
  icon: renderIcon,
  spacer: renderSpacer,
  divider: renderDivider,
  avatar: renderAvatar,
  badge: renderBadge,
  chip: renderChip,
};
