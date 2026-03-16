import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { MapNodeProps, MapMarker } from './types';

export function MapNodeView({
  title,
  latitude,
  longitude,
  markers,
  permissionDenied,
  onMarkerPress,
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
        {markers.length > 0 && (
          <Text style={styles.markerCount}>
            {markers.length} {markers.length === 1 ? 'marker' : 'markers'}
          </Text>
        )}
        <Text style={styles.mapHint}>
          Mapbox integration requires native build
        </Text>
      </View>
      {markers.length > 0 && (
        <View style={styles.markerList}>
          {markers.map((marker) => (
            <TouchableOpacity
              key={marker.id}
              style={styles.markerItem}
              onPress={() => onMarkerPress?.(marker)}
            >
              <Text style={styles.markerPin}>{'\u{1F4CD}'}</Text>
              <View style={styles.markerInfo}>
                <Text style={styles.markerTitle} numberOfLines={1}>
                  {marker.title || 'Marker'}
                </Text>
                <Text style={styles.markerCoords}>
                  {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  markerCount: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 4,
  },
  markerList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  markerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  markerPin: {
    fontSize: 20,
    marginRight: 10,
  },
  markerInfo: {
    flex: 1,
  },
  markerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
  },
  markerCoords: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
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
