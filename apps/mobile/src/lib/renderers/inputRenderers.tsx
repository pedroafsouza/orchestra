import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
} from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';
import type { ComponentRenderer } from './types';

// ─── Renderers ──────────────────────────────────────────────────────────────

const renderInput: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  return (
    <TextInput
      placeholder={props.placeholder || 'Input...'}
      placeholderTextColor="#64748b"
      value={ctx.formValues[component.id] ?? ''}
      onChangeText={(val) => ctx.onFormChange(component.id, val)}
      secureTextEntry={props.type === 'password'}
      keyboardType={props.type === 'number' ? 'numeric' : 'default'}
      style={[s.input, ctx.resolvedStyle as TextStyle]}
    />
  );
};

const renderCombobox: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const options = (props.options as string[]) || [];
  return (
    <View style={[s.combobox, ctx.resolvedStyle as ViewStyle]}>
      <Text style={s.comboboxText}>
        {ctx.formValues[component.id] || props.placeholder || 'Choose...'}
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
              onPress={() => ctx.onFormChange(component.id, opt)}
              style={[
                s.comboboxOption,
                ctx.formValues[component.id] === opt && s.comboboxOptionActive,
              ]}
            >
              <Text
                style={[
                  s.comboboxOptionText,
                  ctx.formValues[component.id] === opt && s.comboboxOptionTextActive,
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
};

const renderCheckbox: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const isChecked = ctx.checkedValues[component.id] ?? props.checked ?? false;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        ctx.onCheckedChange(component.id, !isChecked);
        if (component.actions) {
          for (const action of component.actions) {
            ctx.onAction({
              type: action.type,
              payload: { ...action, checked: !isChecked, entry: ctx.entry },
              formValues: ctx.formValues,
            });
          }
        }
      }}
      style={[s.checkboxRow, ctx.resolvedStyle as ViewStyle]}
    >
      <View style={[s.checkboxBox, isChecked && s.checkboxBoxChecked]}>
        {isChecked && <Text style={s.checkboxCheck}>{'\u2713'}</Text>}
      </View>
      <Text style={s.checkboxLabel}>{props.label || 'Checkbox'}</Text>
    </TouchableOpacity>
  );
};

const renderSwitch: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const isOn = ctx.checkedValues[component.id] ?? props.checked ?? false;
  return (
    <View style={[s.switchRow, ctx.resolvedStyle as ViewStyle]}>
      <Switch
        value={isOn}
        onValueChange={(val) => {
          ctx.onCheckedChange(component.id, val);
          if (component.actions) {
            for (const action of component.actions) {
              ctx.onAction({
                type: action.type,
                payload: { ...action, checked: val, entry: ctx.entry },
                formValues: ctx.formValues,
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
};

const renderDatePicker: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  return (
    <View style={ctx.resolvedStyle as ViewStyle}>
      {props.label && (
        <Text style={s.fieldLabel}>{props.label}</Text>
      )}
      <TextInput
        placeholder={props.placeholder || 'Select date...'}
        placeholderTextColor="#64748b"
        value={ctx.formValues[component.id] ?? ''}
        onChangeText={(val) => ctx.onFormChange(component.id, val)}
        style={s.input}
      />
    </View>
  );
};

const renderSlider: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const sliderVal = ctx.formValues[component.id] ?? String(props.value ?? 50);
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const pct = Math.min(100, Math.max(0, ((Number(sliderVal) - min) / (max - min)) * 100));
  return (
    <View style={ctx.resolvedStyle as ViewStyle}>
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
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
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
});

// ─── Export map ──────────────────────────────────────────────────────────────

export const inputRenderers: Record<string, ComponentRenderer> = {
  input: renderInput,
  combobox: renderCombobox,
  checkbox: renderCheckbox,
  switch: renderSwitch,
  date_picker: renderDatePicker,
  slider: renderSlider,
};
