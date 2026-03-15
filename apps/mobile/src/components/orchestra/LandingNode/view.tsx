import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import type { LandingNodeProps } from './types';

export function LandingNodeView({
  title,
  subtitle,
  imageUrl,
  actions,
  onAction,
}: LandingNodeProps) {
  const pressActions = actions.filter((a) => a.trigger === 'onPress');

  return (
    <View style={styles.container}>
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {pressActions.map((action, i) => (
        <Pressable
          key={i}
          style={styles.button}
          onPress={() => onAction(action)}
        >
          <Text style={styles.buttonText}>
            {typeof action.payload === 'object' && action.payload?.label
              ? action.payload.label
              : 'Continue'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0f172a',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
