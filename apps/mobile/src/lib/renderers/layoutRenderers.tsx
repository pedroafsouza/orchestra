import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import type { ComponentRenderer } from './types';
import { TAB_ICONS } from './basicRenderers';

// ─── Renderers ──────────────────────────────────────────────────────────────

const renderContainerOrCard: ComponentRenderer = (component, ctx) => {
  const { props, type } = component;
  return (
    <View
      style={[
        {
          flexDirection: props.direction === 'horizontal' ? 'row' : 'column',
          gap: props.gap || 8,
          padding: type === 'card' ? 16 : 0,
          backgroundColor: type === 'card' ? '#1e293b' : 'transparent',
          borderRadius: type === 'card' ? 12 : 0,
        },
        ctx.resolvedStyle as ViewStyle,
      ]}
    >
      {ctx.renderChildren(component.children)}
      {(!component.children || component.children.length === 0) && (
        <Text style={[s.placeholderText, { textAlign: 'center', padding: 12 }]}>
          {type === 'card' ? 'Card' : 'Container'} — empty
        </Text>
      )}
    </View>
  );
};

const renderHorizontalScroll: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        { gap: props.gap || 12, paddingVertical: 4 },
        ctx.resolvedStyle as ViewStyle,
      ]}
    >
      {ctx.renderChildren(component.children)}
      {(!component.children || component.children.length === 0) && (
        <Text style={s.placeholderText}>Horizontal scroll — empty</Text>
      )}
    </ScrollView>
  );
};

const renderCarousel: ComponentRenderer = (component, ctx) => {
  return (
    <View style={[s.carouselPlaceholder, ctx.resolvedStyle as ViewStyle]}>
      <Text style={s.placeholderText}>
        {'\u{1F3A0}'} Carousel ({component.children?.length || 0} slides)
      </Text>
    </View>
  );
};

const renderHero: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  return (
    <View style={[s.hero, ctx.resolvedStyle as ViewStyle]}>
      {props.backgroundImage && (
        <Image
          source={{ uri: props.backgroundImage }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      )}
      {props.overlay && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      )}
      <View style={{ zIndex: 1, padding: 24 }}>
        {ctx.renderChildren(component.children)}
        {(!component.children || component.children.length === 0) && (
          <Text style={s.placeholderText}>Hero / Panoramic section</Text>
        )}
      </View>
    </View>
  );
};

const renderList: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const dsId = component.datasource?.datasourceId;
  const entries = dsId ? ctx.datasourceData.get(dsId) : undefined;

  if (entries && entries.length > 0 && component.children?.length) {
    return (
      <View
        style={[
          {
            flexDirection: props.direction === 'horizontal' ? 'row' : 'column',
            gap: props.gap || 8,
          },
          ctx.resolvedStyle as ViewStyle,
        ]}
      >
        {entries.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={{
              flexDirection: props.direction === 'horizontal' ? 'row' : 'column',
              gap: props.gap || 8,
            }}
          >
            {ctx.renderChildren(component.children, row)}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View
      style={[
        {
          flexDirection: props.direction === 'horizontal' ? 'row' : 'column',
          gap: props.gap || 8,
        },
        ctx.resolvedStyle as ViewStyle,
      ]}
    >
      {ctx.renderChildren(component.children)}
      {(!component.children || component.children.length === 0) && (
        <Text style={[s.placeholderText, { textAlign: 'center', padding: 12 }]}>
          List — bind to datasource or add items
        </Text>
      )}
    </View>
  );
};

const renderTabBar: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const items = (props.items as { label: string; icon?: string }[]) || [];
  const activeIdx = props.activeIndex ?? 0;
  return (
    <View style={[s.tabBar, ctx.resolvedStyle as ViewStyle]}>
      {items.map((item, i) => (
        <View key={i} style={s.tabItem}>
          <Text style={{ fontSize: 18 }}>
            {TAB_ICONS[item.icon || ''] || '\u{25CF}'}
          </Text>
          <Text
            style={[
              s.tabLabel,
              {
                fontWeight: i === activeIdx ? '600' : '400',
                color: i === activeIdx ? '#6366f1' : '#94a3b8',
              },
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
      {items.length === 0 && (
        <Text style={[s.placeholderText, { padding: 8 }]}>
          Tab Bar — add items
        </Text>
      )}
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  placeholderText: {
    color: '#475569',
    fontSize: 12,
  },
  hero: {
    width: '100%',
    minHeight: 200,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  carouselPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
    paddingBottom: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
  },
});

// ─── Export map ──────────────────────────────────────────────────────────────

export const layoutRenderers: Record<string, ComponentRenderer> = {
  container: renderContainerOrCard,
  card: renderContainerOrCard,
  horizontal_scroll: renderHorizontalScroll,
  carousel: renderCarousel,
  hero: renderHero,
  list: renderList,
  tab_bar: renderTabBar,
};
