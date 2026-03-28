import type { ScreenDefinition, ScreenComponent } from '@orchestra/shared';

export interface MapConfig {
  datasourceId: string;
  datasourceName: string;
  /** 'geolocation' field key or null if using separate lat/lng */
  geoField?: string;
  latField?: string;
  lngField?: string;
  markerTitle?: string;
  markerImage?: string;
  zoom: number;
  mapHeight: number;
  onMarkerTap: 'callout' | 'navigate';
  navigateTarget?: string;
}

let idCounter = 0;
function nextId(): string {
  return `wiz_map_${++idCounter}`;
}

function resetIds(): void {
  idCounter = 0;
}

export function generateMapScreen(config: MapConfig): ScreenDefinition {
  resetIds();

  const fieldMappings: Record<string, string> = {};

  if (config.geoField) {
    fieldMappings.lat = `${config.geoField}.latitude`;
    fieldMappings.lng = `${config.geoField}.longitude`;
  } else {
    if (config.latField) fieldMappings.lat = config.latField;
    if (config.lngField) fieldMappings.lng = config.lngField;
  }
  if (config.markerTitle) fieldMappings.markerTitle = config.markerTitle;
  if (config.markerImage) fieldMappings.markerImage = config.markerImage;

  const mapComponent: ScreenComponent = {
    id: nextId(),
    type: 'map_view',
    props: {
      lat: 0,
      lng: 0,
      zoom: config.zoom,
      height: config.mapHeight,
      markers: [],
    },
    style: {
      base: {
        margin: { top: 0, right: 16, bottom: 16, left: 16 },
        border: { radius: 16 },
      },
    },
    datasource: {
      datasourceId: config.datasourceId,
      fieldMappings,
    },
    actions:
      config.onMarkerTap === 'navigate' && config.navigateTarget
        ? [
            {
              trigger: 'onMarkerPress',
              type: 'NAVIGATE',
              payload: { targetNodeId: config.navigateTarget },
            },
          ]
        : [],
  };

  return {
    backgroundColor: '#0f172a',
    scrollable: true,
    rootComponents: [
      {
        id: nextId(),
        type: 'text',
        props: { content: config.datasourceName },
        style: {
          base: {
            fontSize: 22,
            fontWeight: 'bold',
            textColor: '#f8fafc',
            padding: { top: 20, right: 16, bottom: 8, left: 16 },
          },
        },
      },
      mapComponent,
    ],
  };
}

export function getMapLabel(datasourceName: string): string {
  return `${datasourceName} Map`;
}
