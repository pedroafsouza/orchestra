import type { OrchestraAction } from '@orchestra/shared';

export interface PhotoItem {
  id: string;
  uri: string;
  caption?: string;
}

export interface PhotoGalleryNodeProps {
  title: string;
  photos: PhotoItem[];
  allowCapture: boolean;
  onCapture: () => void;
  actions: OrchestraAction[];
  onAction: (action: OrchestraAction) => void;
}
