import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
} from 'react-native';
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import type { ScreenComponent, Breakpoint } from '@orchestra/shared';
import { resolveStyle } from '@/lib/resolveStyle';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PreviewRuntimeProps {
  rootComponents: ScreenComponent[];
  backgroundColor: string;
  breakpoint: Breakpoint;
  datasourceData: Map<string, Record<string, any>[]>;
  navigationContext?: Record<string, any>;
  onNavigate: (nodeId: string, entry?: Record<string, any>) => void;
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
  onNavigate: (nodeId: string, entry?: Record<string, any>) => void;
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
  const resolved = resolveStyle(component, breakpoint);

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

  const executeActions = () => {
    if (component.actions) {
      for (const action of component.actions) {
        onAction({ type: action.type, payload: action, formValues });
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
        <Text style={[s.text, resolved as TextStyle]}>
          {content || 'Text'}
        </Text>
      );
    }

    // ── Button ────────────────────────────────────────────────────────────
    case 'button':
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (props.navigateTo) onNavigate(props.navigateTo, entry);
            executeActions();
          }}
          style={[s.button, resolved as ViewStyle]}
        >
          <Text style={[s.buttonText, resolved.color ? { color: resolved.color as string } : null]}>
            {props.label || 'Button'}
          </Text>
        </TouchableOpacity>
      );

    // ── Image ─────────────────────────────────────────────────────────────
    case 'image': {
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
          style={[s.image, resolved as ImageStyle]}
          resizeMode="cover"
        />
      ) : (
        <View style={[s.imagePlaceholder, resolved as ViewStyle]}>
          <Text style={s.placeholderText}>Image placeholder</Text>
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
          keyboardType={props.type === 'number' ? 'numeric' : 'default'}
          style={[s.input, resolved as TextStyle]}
        />
      );

    // ── Combobox (RN: simple picker-like) ───────────────────────────────
    case 'combobox': {
      const options = (props.options as string[]) || [];
      return (
        <View style={[s.combobox, resolved as ViewStyle]}>
          <Text style={s.comboboxText}>
            {formValues[component.id] || props.placeholder || 'Choose...'}
          </Text>
          {options.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 6 }}
            >
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => onFormChange(component.id, opt)}
                  style={[
                    s.comboboxOption,
                    formValues[component.id] === opt && s.comboboxOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      s.comboboxOptionText,
                      formValues[component.id] === opt && s.comboboxOptionTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      );
    }

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
            ...resolved,
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
            resolved as ViewStyle,
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
    }

    // ── Badge ─────────────────────────────────────────────────────────────
    case 'badge': {
      const badgeText = resolveProp('text', component, entry);
      return (
        <View
          style={[
            s.badge,
            { backgroundColor: props.color || '#6366f1' },
            resolved as ViewStyle,
          ]}
        >
          <Text style={s.badgeText}>{badgeText || 'Badge'}</Text>
        </View>
      );
    }

    // ── Gallery ───────────────────────────────────────────────────────────
    case 'gallery': {
      const cols = props.columns || 2;
      return (
        <View
          style={[
            { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
            resolved as ViewStyle,
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
    }

    // ── Video ─────────────────────────────────────────────────────────────
    case 'video':
      return (
        <View style={[s.videoPlaceholder, resolved as ViewStyle]}>
          <Text style={s.placeholderText}>{'\u25B6'} Video</Text>
        </View>
      );

    // ── Hero ──────────────────────────────────────────────────────────────
    case 'hero':
      return (
        <View style={[s.hero, resolved as ViewStyle]}>
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
            {renderChildren(component.children)}
            {(!component.children || component.children.length === 0) && (
              <Text style={s.placeholderText}>Hero / Panoramic section</Text>
            )}
          </View>
        </View>
      );

    // ── Container / Card ──────────────────────────────────────────────────
    case 'container':
    case 'card':
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
            resolved as ViewStyle,
          ]}
        >
          {renderChildren(component.children)}
          {(!component.children || component.children.length === 0) && (
            <Text style={[s.placeholderText, { textAlign: 'center', padding: 12 }]}>
              {type === 'card' ? 'Card' : 'Container'} — empty
            </Text>
          )}
        </View>
      );

    // ── Horizontal Scroll ─────────────────────────────────────────────────
    case 'horizontal_scroll':
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            { gap: props.gap || 12, paddingVertical: 4 },
            resolved as ViewStyle,
          ]}
        >
          {component.children?.map((child) => (
            <View key={child.id}>
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
            </View>
          ))}
          {(!component.children || component.children.length === 0) && (
            <Text style={s.placeholderText}>Horizontal scroll — empty</Text>
          )}
        </ScrollView>
      );

    // ── Carousel ──────────────────────────────────────────────────────────
    case 'carousel':
      return (
        <View style={[s.carouselPlaceholder, resolved as ViewStyle]}>
          <Text style={s.placeholderText}>
            {'\u{1F3A0}'} Carousel ({component.children?.length || 0} slides)
          </Text>
        </View>
      );

    // ── Checkbox ──────────────────────────────────────────────────────────
    case 'checkbox': {
      const isChecked = checkedValues[component.id] ?? props.checked ?? false;
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            onCheckedChange(component.id, !isChecked);
            if (component.actions) {
              for (const action of component.actions) {
                onAction({
                  type: action.type,
                  payload: { ...action, checked: !isChecked, entry },
                  formValues,
                });
              }
            }
          }}
          style={[s.checkboxRow, resolved as ViewStyle]}
        >
          <View style={[s.checkboxBox, isChecked && s.checkboxBoxChecked]}>
            {isChecked && <Text style={s.checkboxCheck}>{'\u2713'}</Text>}
          </View>
          <Text style={s.checkboxLabel}>{props.label || 'Checkbox'}</Text>
        </TouchableOpacity>
      );
    }

    // ── List (datasource-aware) ───────────────────────────────────────────
    case 'list': {
      const dsId = component.datasource?.datasourceId;
      const entries = dsId ? datasourceData.get(dsId) : undefined;

      if (entries && entries.length > 0 && component.children?.length) {
        return (
          <View
            style={[
              {
                flexDirection: props.direction === 'horizontal' ? 'row' : 'column',
                gap: props.gap || 8,
              },
              resolved as ViewStyle,
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
              flexDirection: props.direction === 'horizontal' ? 'row' : 'column',
              gap: props.gap || 8,
            },
            resolved as ViewStyle,
          ]}
        >
          {renderChildren(component.children)}
          {(!component.children || component.children.length === 0) && (
            <Text style={[s.placeholderText, { textAlign: 'center', padding: 12 }]}>
              List — bind to datasource or add items
            </Text>
          )}
        </View>
      );
    }

    // ── Rating Stars ──────────────────────────────────────────────────────
    case 'rating_stars': {
      const val = resolveProp('value', component, entry) || 0;
      const max = props.max || 5;
      return (
        <View style={[s.ratingRow, resolved as ViewStyle]}>
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
    }

    // ── Price Tag ─────────────────────────────────────────────────────────
    case 'price_tag': {
      const amount = resolveProp('amount', component, entry) ?? 0;
      return (
        <View style={[s.priceRow, resolved as ViewStyle]}>
          <Text style={s.priceAmount}>
            {props.currency || '$'}{amount}
          </Text>
          <Text style={s.pricePeriod}>
            {props.period || '/night'}
          </Text>
        </View>
      );
    }

    // ── Map View ──────────────────────────────────────────────────────────
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
            s.mapPlaceholder,
            { height: props.height || 200 },
            resolved as ViewStyle,
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
    }

    // ── Chip ──────────────────────────────────────────────────────────────
    case 'chip': {
      const chipLabel = resolveProp('label', component, entry);
      return (
        <View
          style={[
            s.chip,
            props.variant === 'filled' && { backgroundColor: '#334155' },
            resolved as ViewStyle,
          ]}
        >
          <Text style={s.chipText}>{chipLabel || 'Chip'}</Text>
        </View>
      );
    }

    // ── Switch / Toggle ─────────────────────────────────────────────────
    case 'switch': {
      const isOn = checkedValues[component.id] ?? props.checked ?? false;
      return (
        <View style={[s.switchRow, resolved as ViewStyle]}>
          <Switch
            value={isOn}
            onValueChange={(val) => {
              onCheckedChange(component.id, val);
              if (component.actions) {
                for (const action of component.actions) {
                  onAction({
                    type: action.type,
                    payload: { ...action, checked: val, entry },
                    formValues,
                  });
                }
              }
            }}
            trackColor={{ false: '#334155', true: '#6366f1' }}
            thumbColor="#f8fafc"
          />
          <Text style={s.switchLabel}>{props.label || 'Toggle'}</Text>
        </View>
      );
    }

    // ── Date Picker ───────────────────────────────────────────────────────
    case 'date_picker':
      return (
        <View style={resolved as ViewStyle}>
          {props.label && (
            <Text style={s.fieldLabel}>{props.label}</Text>
          )}
          <TextInput
            placeholder={props.placeholder || 'Select date...'}
            placeholderTextColor="#64748b"
            value={formValues[component.id] ?? ''}
            onChangeText={(val) => onFormChange(component.id, val)}
            style={s.input}
          />
        </View>
      );

    // ── Slider ────────────────────────────────────────────────────────────
    case 'slider': {
      const sliderVal = formValues[component.id] ?? String(props.value ?? 50);
      const min = props.min ?? 0;
      const max = props.max ?? 100;
      const pct = Math.min(100, Math.max(0, ((Number(sliderVal) - min) / (max - min)) * 100));
      return (
        <View style={resolved as ViewStyle}>
          {props.label && (
            <View style={s.sliderHeader}>
              <Text style={s.fieldLabel}>{props.label}</Text>
              <Text style={s.sliderValue}>{sliderVal}</Text>
            </View>
          )}
          <View style={s.sliderTrack}>
            <View style={[s.sliderFill, { width: `${pct}%` as any }]} />
            <View style={[s.sliderThumb, { left: `${pct}%` as any }]} />
          </View>
        </View>
      );
    }

    // ── Tab Bar ───────────────────────────────────────────────────────────
    case 'tab_bar': {
      const items = (props.items as { label: string; icon?: string }[]) || [];
      const activeIdx = props.activeIndex ?? 0;
      return (
        <View style={[s.tabBar, resolved as ViewStyle]}>
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
    }

    // ── Unknown ───────────────────────────────────────────────────────────
    default:
      return (
        <View style={{ padding: 8 }}>
          <Text style={{ color: '#64748b', fontSize: 12 }}>[{type}]</Text>
        </View>
      );
  }
}

// ─── PreviewRuntime (top-level) ─────────────────────────────────────────────

export function PreviewRuntime({
  rootComponents,
  backgroundColor,
  breakpoint,
  datasourceData,
  navigationContext,
  onNavigate,
  onAction,
}: PreviewRuntimeProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [checkedValues, setCheckedValues] = useState<Record<string, boolean>>({});

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
    <View style={{ backgroundColor: backgroundColor || '#0f172a', flex: 1 }}>
      {rootComponents.map((comp) => (
        <RuntimeComponent
          key={comp.id}
          component={comp}
          breakpoint={breakpoint}
          datasourceData={datasourceData}
          entry={navigationContext}
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
}

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
  input: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    color: '#f8fafc',
    fontSize: 14,
  },
  combobox: {
    width: '100%',
    padding: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
  },
  comboboxText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  comboboxOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 6,
  },
  comboboxOptionActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  comboboxOptionText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  comboboxOptionTextActive: {
    color: '#fff',
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
  videoPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxLabel: {
    color: '#f8fafc',
    fontSize: 14,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchLabel: {
    color: '#f8fafc',
    fontSize: 14,
  },
  fieldLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  sliderValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    position: 'relative',
    marginVertical: 8,
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    marginLeft: -8,
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
