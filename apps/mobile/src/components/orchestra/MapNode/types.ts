import type { OrchestraAction } from '@orchestra/shared';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
}

export interface MapNodeProps {
  title?: string;
  latitude: number;
  longitude: number;
  zoom: number;
  markers: MapMarker[];
  mapboxToken?: string;
  permissionDenied: boolean;
  actions: OrchestraAction[];
  onAction: (action: OrchestraAction) => void;
  onMarkerPress?: (marker: MapMarker) => void;
}
