import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { resolveProps } from '@orchestra/shared';
import type { OrchestraNode, OrchestraAction } from '@orchestra/shared';
import { PhotoGalleryNodeView } from './view';
import type { PhotoItem } from './types';

interface Props {
  node: OrchestraNode;
  context: Record<string, any>;
  onAction: (action: OrchestraAction) => void;
}

export function PhotoGalleryNode({ node, context, onAction }: Props) {
  const resolved = resolveProps(node.props, { context });
  const [photos, setPhotos] = useState<PhotoItem[]>(resolved.photos || []);

  useEffect(() => {
    node.actions
      .filter((a) => a.trigger === 'onLoad')
      .forEach(onAction);
  }, [node.id]);

  const handleCapture = async () => {
    if (Platform.OS === 'web') return;
    try {
      const ImagePicker = require('expo-image-picker');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const newPhoto: PhotoItem = {
          id: `photo_${Date.now()}`,
          uri: result.assets[0].uri,
        };
        setPhotos((prev) => [...prev, newPhoto]);
        onAction({
          trigger: 'onPress',
          type: 'SET_CONTEXT',
          payload: { capturedPhotos: [...photos, newPhoto] },
        });
      }
    } catch {
      // Camera unavailable
    }
  };

  return (
    <PhotoGalleryNodeView
      title={resolved.title || 'Photos'}
      photos={photos}
      allowCapture={resolved.allowCapture !== false}
      onCapture={handleCapture}
      actions={node.actions}
      onAction={onAction}
    />
  );
}
