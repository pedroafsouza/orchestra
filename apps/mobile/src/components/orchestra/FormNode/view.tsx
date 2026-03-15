import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import type { FormNodeProps, FormField } from './types';

const KEYBOARD_MAP: Record<string, KeyboardTypeOptions> = {
  email: 'email-address',
  number: 'numeric',
};

export function FormNodeView({
  title,
  fields,
  submitLabel,
  values,
  onFieldChange,
  onSubmit,
}: FormNodeProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{title}</Text>
      {fields.map((field: FormField) => (
        <View key={field.key} style={styles.fieldWrap}>
          <Text style={styles.label}>
            {field.label}
            {field.required && <Text style={styles.required}> *</Text>}
          </Text>
          <TextInput
            style={[
              styles.input,
              field.type === 'textarea' && styles.textarea,
            ]}
            placeholder={field.placeholder}
            placeholderTextColor="#64748b"
            value={values[field.key] || ''}
            onChangeText={(text) => onFieldChange(field.key, text)}
            keyboardType={KEYBOARD_MAP[field.type] || 'default'}
            secureTextEntry={field.type === 'password'}
            multiline={field.type === 'textarea'}
            numberOfLines={field.type === 'textarea' ? 4 : 1}
          />
        </View>
      ))}
      <Pressable style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>{submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 24,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  required: {
    color: '#f87171',
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
