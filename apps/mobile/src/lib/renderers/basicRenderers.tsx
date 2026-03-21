import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import type { ScreenComponent } from '@orchestra/shared';
import { interpolate, resolveProp } from '@orchestra/shared';
import type { ComponentRenderer } from './types';

// ─── Tab bar icon map ───────────────────────────────────────────────────────

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

// ─── Renderers ──────────────────────────────────────────────────────────────

const renderText: ComponentRenderer = (component, ctx) => {
  let content = resolveProp('content', component, ctx.entry);
  if (typeof content === 'string' && ctx.entry) {
    content = interpolate(content, ctx.entry);
  }
  return (
    <Text style={[s.text, ctx.resolvedStyle as TextStyle]}>
      {content || 'Text'}
    </Text>
  );
};

const renderButton: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        if (props.navigateTo) ctx.onNavigate(props.navigateTo, ctx.entry);
        ctx.executeActions();
      }}
      style={[s.button, ctx.resolvedStyle as ViewStyle]}
    >
      <Text style={[s.buttonText, ctx.resolvedStyle.color ? { color: ctx.resolvedStyle.color as string } : null]}>
        {props.label || 'Button'}
      </Text>
    </TouchableOpacity>
  );
};

const renderImage: ComponentRenderer = (component, ctx) => {
  const { entry } = ctx;
  let src = resolveProp('src', component, entry);
  if (typeof src === 'string' && entry) {
    src = interpolate(src, entry);
  }
  if (!src && entry) {
    const imageFields = ['imageUrl', 'image', 'photo', 'thumbnail', 'src', 'url', 'coverImage', 'avatar'];
    for (const field of imageFields) {
      if (entry[field] && typeof entry[field] === 'string') {
        src = entry[field];
        break;
      }
    }
  }
  return src ? (
    <Image
      source={{ uri: src }}
      style={[s.image, ctx.resolvedStyle as ImageStyle]}
      resizeMode="cover"
    />
  ) : (
    <View style={[s.imagePlaceholder, ctx.resolvedStyle as ViewStyle]}>
      <Text style={s.placeholderText}>Image placeholder</Text>
    </View>
  );
};

const renderIcon: ComponentRenderer = (component, _ctx) => {
  const { props } = component;
  return (
    <Text
      style={{
        textAlign: 'center',
        fontSize: props.size || 24,
        color: props.color || '#fff',
      }}
    >
      {'\u2B50'}
    </Text>
  );
};

const renderSpacer: ComponentRenderer = (component, _ctx) => {
  return <View style={{ height: component.props.height || 16 }} />;
};

const renderDivider: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  return (
    <View
      style={{
        height: props.thickness || 1,
        backgroundColor: props.color || '#334155',
        ...ctx.resolvedStyle,
      }}
    />
  );
};

const renderAvatar: ComponentRenderer = (component, ctx) => {
  const avatarSrc = resolveProp('src', component, ctx.entry);
  const size = component.props.size || 48;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#334155',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        ctx.resolvedStyle as ViewStyle,
      ]}
    >
      {avatarSrc ? (
        <Image
          source={{ uri: avatarSrc }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={{ fontSize: 18 }}>{'\u{1F464}'}</Text>
      )}
    </View>
  );
};

const renderBadge: ComponentRenderer = (component, ctx) => {
  const badgeText = resolveProp('text', component, ctx.entry);
  return (
    <View
      style={[
        s.badge,
        { backgroundColor: component.props.color || '#6366f1' },
        ctx.resolvedStyle as ViewStyle,
      ]}
    >
      <Text style={s.badgeText}>{badgeText || 'Badge'}</Text>
    </View>
  );
};

const renderChip: ComponentRenderer = (component, ctx) => {
  const chipLabel = resolveProp('label', component, ctx.entry);
  return (
    <View
      style={[
        s.chip,
        component.props.variant === 'filled' && { backgroundColor: '#334155' },
        ctx.resolvedStyle as ViewStyle,
      ]}
    >
      <Text style={s.chipText}>{chipLabel || 'Chip'}</Text>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  text: {
    color: '#f8fafc',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#475569',
    fontSize: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  chip: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#e2e8f0',
  },
});

// ─── Export map ──────────────────────────────────────────────────────────────

export const basicRenderers: Record<string, ComponentRenderer> = {
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

export { TAB_ICONS };
