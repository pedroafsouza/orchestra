import { resolveProp } from '@orchestra/shared';
import type { ComponentRenderer } from './types';

const renderGallery: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${props.columns || 2}, 1fr)`,
        gap: 8,
        ...ctx.resolvedStyle,
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
};

const renderVideo: ComponentRenderer = (component, ctx) => {
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
        ...ctx.resolvedStyle,
      }}
    >
      {'\u25B6'} Video
    </div>
  );
};

const renderMapView: ComponentRenderer = (component, ctx) => {
  const { props } = component;

  // Resolve markers from datasource binding
  let markerLabel: React.ReactNode = null;
  if (ctx.interactive) {
    const mapDsId = component.datasource?.datasourceId;
    const mapEntries = mapDsId ? ctx.datasourceData.get(mapDsId) : undefined;
    const markerCount =
      mapEntries && component.datasource?.fieldMappings?.markerPosition
        ? mapEntries.length
        : 0;
    if (markerCount > 0) {
      markerLabel = (
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
      );
    }
  } else {
    const hasDsMarkers = !!component.datasource?.fieldMappings?.markerPosition;
    if (hasDsMarkers) {
      markerLabel = (
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
      );
    }
  }

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
        ...ctx.resolvedStyle,
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
      {markerLabel}
    </div>
  );
};

const renderRatingStars: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const val = resolveProp('value', component, ctx.entry) || 0;
  const max = props.max || 5;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        ...ctx.resolvedStyle,
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
};

const renderPriceTag: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const amount = resolveProp('amount', component, ctx.entry) ?? 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 2,
        ...ctx.resolvedStyle,
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
};

export const mediaRenderers = {
  gallery: renderGallery,
  video: renderVideo,
  map_view: renderMapView,
  rating_stars: renderRatingStars,
  price_tag: renderPriceTag,
};
