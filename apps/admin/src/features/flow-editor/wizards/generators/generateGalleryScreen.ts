import type { ScreenDefinition, ScreenComponent } from '@orchestra/shared';

export type GalleryLayout = 'grid' | 'masonry' | 'carousel_layout';

export interface GalleryConfig {
  datasourceId: string;
  datasourceName: string;
  layout: GalleryLayout;
  columns: number;
  imageField: string;
  captionField?: string;
}

let idCounter = 0;
function nextId(): string {
  return `wiz_gallery_${++idCounter}`;
}

function resetIds(): void {
  idCounter = 0;
}

function generateGridOrMasonry(config: GalleryConfig): ScreenDefinition {
  const cardChildren: ScreenComponent[] = [
    {
      id: nextId(),
      type: 'image',
      props: { src: `{{${config.imageField}}}`, alt: 'gallery item' },
      style: { base: { width: '100%', height: 140, border: { radius: 8 } } },
      datasource: {
        datasourceId: config.datasourceId,
        fieldMappings: { src: config.imageField },
      },
    },
  ];

  if (config.captionField) {
    cardChildren.push({
      id: nextId(),
      type: 'text',
      props: { content: `{{${config.captionField}}}` },
      style: {
        base: {
          fontSize: 11,
          textColor: '#94a3b8',
          padding: { top: 4, right: 8, bottom: 6, left: 8 },
        },
      },
      datasource: {
        datasourceId: config.datasourceId,
        fieldMappings: { content: config.captionField },
      },
    });
  }

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
      {
        id: nextId(),
        type: 'gallery',
        props: {
          columns: config.columns,
        },
        style: {
          base: { padding: { top: 0, right: 12, bottom: 16, left: 12 } },
        },
        datasource: {
          datasourceId: config.datasourceId,
          fieldMappings: {},
        },
        children: [
          {
            id: nextId(),
            type: 'card',
            props: { elevation: 1 },
            style: {
              base: {
                backgroundColor: '#1e293b',
                border: { radius: 10 },
                margin: { top: 4, right: 4, bottom: 4, left: 4 },
              },
            },
            children: cardChildren,
          },
        ],
      },
    ],
  };
}

function generateCarousel(config: GalleryConfig): ScreenDefinition {
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
      {
        id: nextId(),
        type: 'carousel',
        props: { autoPlay: true, interval: 4000 },
        style: {
          base: {
            margin: { top: 0, right: 16, bottom: 16, left: 16 },
            border: { radius: 16 },
          },
        },
        datasource: {
          datasourceId: config.datasourceId,
          fieldMappings: {},
        },
        children: [
          {
            id: nextId(),
            type: 'image',
            props: { src: `{{${config.imageField}}}`, alt: 'carousel item' },
            style: { base: { width: '100%', height: 280, border: { radius: 14 } } },
            datasource: {
              datasourceId: config.datasourceId,
              fieldMappings: { src: config.imageField },
            },
          },
        ],
      },
    ],
  };
}

export function generateGalleryScreen(config: GalleryConfig): ScreenDefinition {
  resetIds();

  if (config.layout === 'carousel_layout') {
    return generateCarousel(config);
  }
  return generateGridOrMasonry(config);
}

export function getGalleryLabel(datasourceName: string): string {
  return `${datasourceName} Gallery`;
}
