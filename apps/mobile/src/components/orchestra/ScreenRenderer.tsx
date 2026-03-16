import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Switch,
  StyleSheet,
} from 'react-native';
import type {
  ScreenComponent,
  ScreenDefinition,
  ComponentStyle,
  OrchestraAction,
} from '@orchestra/shared';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScreenRendererProps {
  screenDefinition: ScreenDefinition;
  datasourceData: Map<string, Record<string, any>[]>;
  onNavigate: (nodeId: string) => void;
  onAction: (action: OrchestraAction) => void;
}

interface RuntimeComponentProps {
  component: ScreenComponent;
  datasourceData: Map<string, Record<string, any>[]>;
  entry?: Record<string, any>;
  formValues: Record<string, string>;
  checkedValues: Record<string, boolean>;
  onFormChange: (componentId: string, value: string) => void;
  onCheckedChange: (componentId: string, value: boolean) => void;
  onNavigate: (nodeId: string) => void;
  onAction: (action: OrchestraAction) => void;
}

// ─── Style resolver (RN equivalent of admin resolveStyle) ───────────────────

function resolveRNStyle(component: ScreenComponent): Record<string, any> {
  const base = component.style?.base || {};
  const merged: ComponentStyle = { ...base };
  const s: Record<string, any> = {};

  if (merged.backgroundColor) s.backgroundColor = merged.backgroundColor;
  if (merged.textColor) s.color = merged.textColor;
  if (merged.fontSize) s.fontSize = merged.fontSize;
  if (merged.fontWeight) s.fontWeight = String(merged.fontWeight);
  if (merged.textAlign) s.textAlign = merged.textAlign;
  if (merged.opacity !== undefined) s.opacity = merged.opacity;
  if (merged.width) s.width = merged.width;
  if (merged.height) s.height = merged.height;
  if (merged.minHeight) s.minHeight = merged.minHeight;
  if (merged.alignSelf) s.alignSelf = merged.alignSelf;

  if (merged.padding) {
    s.paddingTop = merged.padding.top;
    s.paddingRight = merged.padding.right;
    s.paddingBottom = merged.padding.bottom;
    s.paddingLeft = merged.padding.left;
  }
  if (merged.margin) {
    s.marginTop = merged.margin.top;
    s.marginRight = merged.margin.right;
    s.marginBottom = merged.margin.bottom;
    s.marginLeft = merged.margin.left;
  }
  if (merged.border) {
    if (merged.border.width) s.borderWidth = merged.border.width;
    if (merged.border.color) s.borderColor = merged.border.color;
    if (merged.border.radius) s.borderRadius = merged.border.radius;
  }

  return s;
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
  const style = resolveRNStyle(component);

  const renderChildren = (
    children: ScreenComponent[] | undefined,
    childEntry?: Record<string, any>,
  ) =>
    children?.map((child) => (
      <RuntimeComponent
        key={child.id}
        component={child}
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

  const executeActions = () => {
    if (component.actions) {
      for (const action of component.actions) {
        onAction({
          trigger: 'onPress',
          type: action.type,
          payload: { ...action, entry },
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
        <Text style={[{ color: '#f8fafc', fontSize: 14 }, style]}>
          {content || 'Text'}
        </Text>
      );
    }

    // ── Button ────────────────────────────────────────────────────────────
    case 'button':
      return (
        <Pressable
          onPress={() => {
            if (props.navigateTo) onNavigate(props.navigateTo);
            executeActions();
          }}
          style={[
            {
              backgroundColor: '#6366f1',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              alignItems: 'center',
            },
            style,
          ]}
        >
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
            {props.label || 'Button'}
          </Text>
        </Pressable>
      );

    // ── Image ─────────────────────────────────────────────────────────────
    case 'image': {
      const src = resolveProp('src', component, entry);
      return src ? (
        <Image
          source={{ uri: src }}
          style={[{ width: '100%', height: 200, borderRadius: 8 }, style]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            {
              width: '100%',
              height: 120,
              backgroundColor: '#1e293b',
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            },
            style,
          ]}
        >
          <Text style={{ color: '#475569', fontSize: 12 }}>
            Image placeholder
          </Text>
        </View>
      );
    }

    // ── Input ─────────────────────────────────────────────────────────────
    case 'input':
      return (
        <TextInput
          placeholder={props.placeholder || 'Input...'}
          placeholderTextColor="#64748b"
          value={formValues[component.id] ?? ''}
          onChangeText={(val) => onFormChange(component.id, val)}
          secureTextEntry={props.type === 'password'}
          keyboardType={
            props.type === 'number'
              ? 'numeric'
              : props.type === 'email'
                ? 'email-address'
                : 'default'
          }
          style={[
            {
              width: '100%',
              padding: 10,
              backgroundColor: '#1e293b',
              borderWidth: 1,
              borderColor: '#334155',
              borderRadius: 8,
              color: '#f8fafc',
              fontSize: 14,
            },
            style,
          ]}
        />
      );

    // ── Combobox (simplified as text for RN) ────────────────────────────
    case 'combobox':
      return (
        <View
          style={[
            {
              width: '100%',
              padding: 10,
              backgroundColor: '#1e293b',
              borderWidth: 1,
              borderColor: '#334155',
              borderRadius: 8,
            },
            style,
          ]}
        >
          <Text style={{ color: '#94a3b8', fontSize: 14 }}>
            {formValues[component.id] || props.placeholder || 'Choose...'}
          </Text>
        </View>
      );

    // ── Spacer ────────────────────────────────────────────────────────────
    case 'spacer':
      return <View style={{ height: props.height || 16 }} />;

    // ── Divider ───────────────────────────────────────────────────────────
    case 'divider':
      return (
        <View
          style={{
            height: props.thickness || 1,
            backgroundColor: props.color || '#334155',
          }}
        />
      );

    // ── Icon ──────────────────────────────────────────────────────────────
    case 'icon':
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

    // ── Avatar ────────────────────────────────────────────────────────────
    case 'avatar': {
      const avatarSrc = resolveProp('src', component, entry);
      const size = props.size || 48;
      return avatarSrc ? (
        <Image
          source={{ uri: avatarSrc }}
          style={[
            { width: size, height: size, borderRadius: size / 2 },
            style,
          ]}
        />
      ) : (
        <View
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: '#334155',
              alignItems: 'center',
              justifyContent: 'center',
            },
            style,
          ]}
        >
          <Text style={{ color: '#94a3b8', fontSize: 18 }}>
            {'\u{1F464}'}
          </Text>
        </View>
      );
    }

    // ── Badge ─────────────────────────────────────────────────────────────
    case 'badge': {
      const badgeText = resolveProp('text', component, entry);
      return (
        <View
          style={[
            {
              backgroundColor: props.color || '#6366f1',
              paddingVertical: 2,
              paddingHorizontal: 8,
              borderRadius: 12,
              alignSelf: 'flex-start',
            },
            style,
          ]}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
            {badgeText || 'Badge'}
          </Text>
        </View>
      );
    }

    // ── Gallery ───────────────────────────────────────────────────────────
    case 'gallery':
      return (
        <View
          style={[
            { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
            style,
          ]}
        >
          {[1, 2, 3, 4].map((n) => (
            <View
              key={n}
              style={{
                width: '47%',
                aspectRatio: 1,
                backgroundColor: '#1e293b',
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#475569' }}>{'\u{1F4F7}'}</Text>
            </View>
          ))}
        </View>
      );

    // ── Video ─────────────────────────────────────────────────────────────
    case 'video':
      return (
        <View
          style={[
            {
              width: '100%',
              height: 180,
              backgroundColor: '#0f172a',
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            },
            style,
          ]}
        >
          <Text style={{ color: '#475569' }}>{'\u25B6'} Video</Text>
        </View>
      );

    // ── Hero ──────────────────────────────────────────────────────────────
    case 'hero':
      return (
        <View
          style={[
            {
              width: '100%',
              minHeight: 200,
              backgroundColor: '#1e293b',
              justifyContent: 'center',
              alignItems: 'center',
            },
            style,
          ]}
        >
          {props.backgroundImage && (
            <Image
              source={{ uri: props.backgroundImage }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
          )}
          <View style={{ padding: 24, zIndex: 1 }}>
            {renderChildren(component.children)}
            {(!component.children || component.children.length === 0) && (
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                Hero section
              </Text>
            )}
          </View>
        </View>
      );

    // ── Container / Card ────────────────────────────────────────────────
    case 'container':
    case 'card':
      return (
        <View
          style={[
            {
              flexDirection:
                props.direction === 'horizontal' ? 'row' : 'column',
              gap: props.gap || 8,
              ...(type === 'card'
                ? {
                    padding: 16,
                    backgroundColor: '#1e293b',
                    borderRadius: 12,
                  }
                : {}),
            },
            style,
          ]}
        >
          {renderChildren(component.children)}
        </View>
      );

    // ── Horizontal Scroll ───────────────────────────────────────────────
    case 'horizontal_scroll':
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            { gap: props.gap || 12, paddingVertical: 4 },
            style,
          ]}
        >
          {renderChildren(component.children)}
        </ScrollView>
      );

    // ── Carousel ────────────────────────────────────────────────────────
    case 'carousel':
      return (
        <View
          style={[
            {
              width: '100%',
              height: 180,
              backgroundColor: '#1e293b',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            },
            style,
          ]}
        >
          <Text style={{ color: '#475569', fontSize: 12 }}>
            {'\u{1F3A0}'} Carousel ({component.children?.length || 0} slides)
          </Text>
        </View>
      );

    // ── Checkbox ────────────────────────────────────────────────────────
    case 'checkbox': {
      const isChecked =
        checkedValues[component.id] ??
        resolveProp('checked', component, entry) ??
        false;
      return (
        <Pressable
          onPress={() => {
            const newVal = !isChecked;
            onCheckedChange(component.id, newVal);
            if (component.actions) {
              for (const action of component.actions) {
                onAction({
                  trigger: 'onValueChange',
                  type: action.type,
                  payload: { ...action, checked: newVal, entry },
                });
              }
            }
          }}
          style={[
            { flexDirection: 'row', alignItems: 'center', gap: 8 },
            style,
          ]}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: isChecked ? '#6366f1' : '#475569',
              backgroundColor: isChecked ? '#6366f1' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isChecked && (
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                {'\u2713'}
              </Text>
            )}
          </View>
          {props.label ? (
            <Text style={{ color: '#f8fafc', fontSize: 14 }}>
              {props.label}
            </Text>
          ) : null}
        </Pressable>
      );
    }

    // ── List (datasource-aware) ─────────────────────────────────────────
    case 'list': {
      const dsId = component.datasource?.datasourceId;
      const entries = dsId ? datasourceData.get(dsId) : undefined;

      if (entries && entries.length > 0 && component.children?.length) {
        return (
          <View
            style={[
              {
                flexDirection:
                  props.direction === 'horizontal' ? 'row' : 'column',
                gap: props.gap || 8,
              },
              style,
            ]}
          >
            {entries.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{
                  flexDirection:
                    props.direction === 'horizontal' ? 'row' : 'column',
                  gap: props.gap || 8,
                }}
              >
                {renderChildren(component.children, row)}
              </View>
            ))}
          </View>
        );
      }

      return (
        <View
          style={[
            {
              flexDirection:
                props.direction === 'horizontal' ? 'row' : 'column',
              gap: props.gap || 8,
            },
            style,
          ]}
        >
          {renderChildren(component.children)}
          {(!component.children || component.children.length === 0) && (
            <Text
              style={{
                color: '#475569',
                fontSize: 11,
                textAlign: 'center',
                padding: 12,
              }}
            >
              List — no data
            </Text>
          )}
        </View>
      );
    }

    // ── Rating Stars ────────────────────────────────────────────────────
    case 'rating_stars': {
      const val = resolveProp('value', component, entry) || 0;
      const max = props.max || 5;
      return (
        <View
          style={[{ flexDirection: 'row', alignItems: 'center', gap: 2 }, style]}
        >
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
          <Text style={{ color: '#94a3b8', fontSize: 12, marginLeft: 4 }}>
            {val}
          </Text>
        </View>
      );
    }

    // ── Price Tag ───────────────────────────────────────────────────────
    case 'price_tag': {
      const amount = resolveProp('amount', component, entry) ?? 0;
      return (
        <View
          style={[{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }, style]}
        >
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#f8fafc' }}>
            {props.currency || '$'}
            {amount}
          </Text>
          <Text style={{ fontSize: 13, color: '#94a3b8' }}>
            {props.period || '/night'}
          </Text>
        </View>
      );
    }

    // ── Map View ────────────────────────────────────────────────────────
    case 'map_view': {
      const mapDsId = component.datasource?.datasourceId;
      const mapEntries = mapDsId ? datasourceData.get(mapDsId) : undefined;
      const markerCount =
        mapEntries && component.datasource?.fieldMappings?.markerPosition
          ? mapEntries.length
          : 0;
      return (
        <View
          style={[
            {
              width: '100%',
              height: props.height || 200,
              backgroundColor: '#1a2332',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            },
            style,
          ]}
        >
          <Text style={{ color: '#475569' }}>{'\u{1F4CD}'} Map View</Text>
          {markerCount > 0 && (
            <View
              style={{
                backgroundColor: '#6366f1',
                paddingVertical: 2,
                paddingHorizontal: 10,
                borderRadius: 12,
                marginTop: 6,
              }}
            >
              <Text
                style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}
              >
                {markerCount} {markerCount === 1 ? 'marker' : 'markers'}
              </Text>
            </View>
          )}
        </View>
      );
    }

    // ── Chip ────────────────────────────────────────────────────────────
    case 'chip': {
      const chipLabel = resolveProp('label', component, entry);
      return (
        <View
          style={[
            {
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: '#334155',
              backgroundColor:
                props.variant === 'filled' ? '#334155' : 'transparent',
              alignSelf: 'flex-start',
            },
            style,
          ]}
        >
          <Text style={{ color: '#e2e8f0', fontSize: 12, fontWeight: '500' }}>
            {chipLabel || 'Chip'}
          </Text>
        </View>
      );
    }

    // ── Unknown ─────────────────────────────────────────────────────────
    default:
      return (
        <View style={{ padding: 8 }}>
          <Text style={{ color: '#64748b', fontSize: 12 }}>[{type}]</Text>
        </View>
      );
  }
}

// ─── ScreenRenderer (top-level) ─────────────────────────────────────────────

export function ScreenRenderer({
  screenDefinition,
  datasourceData,
  onNavigate,
  onAction,
}: ScreenRendererProps) {
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

  const { rootComponents, backgroundColor, scrollable } = screenDefinition;

  const content = (
    <View style={{ flex: 1, backgroundColor: backgroundColor || '#0f172a' }}>
      {rootComponents.map((comp) => (
        <RuntimeComponent
          key={comp.id}
          component={comp}
          datasourceData={datasourceData}
          formValues={formValues}
          checkedValues={checkedValues}
          onFormChange={handleFormChange}
          onCheckedChange={handleCheckedChange}
          onNavigate={onNavigate}
          onAction={onAction}
        />
      ))}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: backgroundColor || '#0f172a' }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {rootComponents.map((comp) => (
          <RuntimeComponent
            key={comp.id}
            component={comp}
            datasourceData={datasourceData}
            formValues={formValues}
            checkedValues={checkedValues}
            onFormChange={handleFormChange}
            onCheckedChange={handleCheckedChange}
            onNavigate={onNavigate}
            onAction={onAction}
          />
        ))}
      </ScrollView>
    );
  }

  return content;
}
