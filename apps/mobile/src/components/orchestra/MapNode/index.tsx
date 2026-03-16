import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { resolveProps } from '@orchestra/shared';
import type { OrchestraNode, OrchestraAction } from '@orchestra/shared';
import { MapNodeView } from './view';
import type { MapMarker } from './types';

interface Props {
  node: OrchestraNode;
  context: Record<string, any>;
  config: { mapboxToken?: string };
  onAction: (action: OrchestraAction) => void;
}

export function MapNode({ node, context, config, onAction }: Props) {
  const resolved = resolveProps(node.props, { context });
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      if (Platform.OS === 'web') return;
      try {
        const Location = require('expo-location');
        const { status } =
          await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermissionDenied(true);
        }
      } catch {
        setPermissionDenied(true);
      }
    }
    checkPermission();

    node.actions
      .filter((a) => a.trigger === 'onLoad')
      .forEach(onAction);
  }, [node.id]);

  const handleMarkerPress = useCallback(
    (marker: MapMarker) => {
      // Find a markerPress action to determine navigation target
      const markerAction = node.actions.find(
        (a) => a.trigger === 'onMarkerPress',
      );
      if (markerAction) {
        onAction({
          ...markerAction,
          payload: { ...markerAction.payload, markerData: marker },
        });
      } else {
        // Default: SET_CONTEXT with marker data then NAVIGATE if configured
        onAction({
          trigger: 'onMarkerPress',
          type: 'SET_CONTEXT',
          payload: { data: marker },
        } as OrchestraAction);
      }
    },
    [node.actions, onAction],
  );

  return (
    <MapNodeView
      title={resolved.title}
      latitude={Number(resolved.latitude) || 0}
      longitude={Number(resolved.longitude) || 0}
      zoom={Number(resolved.zoom) || 12}
      markers={resolved.markers || []}
      mapboxToken={config.mapboxToken}
      permissionDenied={permissionDenied}
      actions={node.actions}
      onAction={onAction}
      onMarkerPress={handleMarkerPress}
    />
  );
}
