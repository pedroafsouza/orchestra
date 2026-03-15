import { View, Text, StyleSheet } from 'react-native';
import type { MapNodeProps } from './types';

export function MapNodeView({
  title,
  latitude,
  longitude,
  permissionDenied,
}: MapNodeProps) {
  if (permissionDenied) {
    return (
      <View style={styles.container}>
        <View style={styles.denied}>
          <Text style={styles.deniedIcon}>{'\u{1F5FA}'}</Text>
          <Text style={styles.deniedTitle}>Location Access Required</Text>
          <Text style={styles.deniedText}>
            Please enable location permissions in your device settings to use
            the map feature.
          </Text>
        </View>
      </View>
    );
  }

  // Placeholder - actual Mapbox integration requires native module setup
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapIcon}>{'\u{1F5FA}'}</Text>
        <Text style={styles.mapText}>
          Map View ({latitude.toFixed(4)}, {longitude.toFixed(4)})
        </Text>
        <Text style={styles.mapHint}>
          Mapbox integration requires native build
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    padding: 16,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    margin: 16,
    borderRadius: 16,
  },
  mapIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  mapText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  mapHint: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  denied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  deniedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  deniedText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
});
