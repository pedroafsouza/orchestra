import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import { resolveProp } from '@orchestra/shared';
import type { ComponentRenderer } from './types';

// ─── Renderers ──────────────────────────────────────────────────────────────

const renderGallery: ComponentRenderer = (component, ctx) => {
  const cols = component.props.columns || 2;
  return (
    <View
      style={[
        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
        ctx.resolvedStyle as ViewStyle,
      ]}
    >
      {[1, 2, 3, 4].map((n) => (
        <View
          key={n}
          style={{
            width: `${100 / cols - 2}%` as any,
            aspectRatio: 1,
            backgroundColor: '#1e293b',
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#475569', fontSize: 10 }}>{'\u{1F4F7}'}</Text>
        </View>
      ))}
    </View>
  );
};

const renderVideo: ComponentRenderer = (_component, ctx) => {
  return (
    <View style={[s.videoPlaceholder, ctx.resolvedStyle as ViewStyle]}>
      <Text style={s.placeholderText}>{'\u25B6'} Video</Text>
    </View>
  );
};

const renderMapView: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const mapDsId = component.datasource?.datasourceId;
  const mapEntries = mapDsId ? ctx.datasourceData.get(mapDsId) : undefined;
  const markerCount =
    mapEntries && component.datasource?.fieldMappings?.markerPosition
      ? mapEntries.length
      : 0;

  return (
    <View
      style={[
        s.mapPlaceholder,
        { height: props.height || 200 },
        ctx.resolvedStyle as ViewStyle,
      ]}
    >
      <Text style={s.placeholderText}>{'\u{1F4CD}'} Map View</Text>
      {markerCount > 0 && (
        <View style={s.mapBadge}>
          <Text style={s.mapBadgeText}>
            {markerCount} {markerCount === 1 ? 'event' : 'events'}
          </Text>
        </View>
      )}
    </View>
  );
};

const renderRatingStars: ComponentRenderer = (component, ctx) => {
  const val = resolveProp('value', component, ctx.entry) || 0;
  const max = component.props.max || 5;
  return (
    <View style={[s.ratingRow, ctx.resolvedStyle as ViewStyle]}>
      {Array.from({ length: max }, (_, i) => (
        <Text
          key={i}
          style={{
            color: i < Math.floor(val) ? '#f59e0b' : '#334155',
            fontSize: 16,
          }}
        >
          {i < val ? '\u2605' : '\u2606'}
        </Text>
      ))}
      <Text style={s.ratingValue}>{val}</Text>
    </View>
  );
};

const renderPriceTag: ComponentRenderer = (component, ctx) => {
  const amount = resolveProp('amount', component, ctx.entry) ?? 0;
  const { props } = component;
  return (
    <View style={[s.priceRow, ctx.resolvedStyle as ViewStyle]}>
      <Text style={s.priceAmount}>
        {props.currency || '$'}{amount}
      </Text>
      <Text style={s.pricePeriod}>
        {props.period || '/night'}
      </Text>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  placeholderText: {
    color: '#475569',
    fontSize: 12,
  },
  videoPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholder: {
    width: '100%',
    backgroundColor: '#1a2332',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 6,
  },
  mapBadge: {
    backgroundColor: '#6366f1',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  mapBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingValue: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
  },
  pricePeriod: {
    fontSize: 13,
    color: '#94a3b8',
  },
});

// ─── Export map ──────────────────────────────────────────────────────────────

export const mediaRenderers: Record<string, ComponentRenderer> = {
  gallery: renderGallery,
  video: renderVideo,
  map_view: renderMapView,
  rating_stars: renderRatingStars,
  price_tag: renderPriceTag,
};
