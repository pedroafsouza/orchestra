import type { ScreenDefinition, ScreenComponent } from '@orchestra/shared';

export type ListLayout = 'card_list' | 'image_grid' | 'simple_rows' | 'horizontal_scroll';

export interface ListConfig {
  layout: ListLayout;
  datasourceId: string;
  datasourceName: string;
  fieldMap: Record<string, string>; // slot key -> datasource field key
}

let idCounter = 0;
function nextId(): string {
  return `wiz_list_${++idCounter}`;
}

function resetIds(): void {
  idCounter = 0;
}

function makeHeaderText(content: string): ScreenComponent {
  return {
    id: nextId(),
    type: 'text',
    props: { content },
    style: {
      base: {
        fontSize: 22,
        fontWeight: 'bold' as const,
        textColor: '#f8fafc',
        padding: { top: 20, right: 16, bottom: 8, left: 16 },
      },
    },
  };
}

function makeDatasourceBinding(datasourceId: string, fieldMappings: Record<string, string>) {
  return { datasourceId, fieldMappings };
}

function generateCardList(config: ListConfig): ScreenDefinition {
  const { datasourceId, datasourceName, fieldMap } = config;

  const cardChildren: ScreenComponent[] = [];

  // Image (optional)
  if (fieldMap.image) {
    cardChildren.push({
      id: nextId(),
      type: 'image',
      props: { src: `{{${fieldMap.image}}}`, alt: 'item' },
      style: { base: { width: '100%', height: 160, border: { radius: 12 } } },
      datasource: makeDatasourceBinding(datasourceId, { src: fieldMap.image }),
    });
  }

  // Text container
  const textChildren: ScreenComponent[] = [
    {
      id: nextId(),
      type: 'text',
      props: { content: `{{${fieldMap.title || 'title'}}}` },
      style: { base: { fontSize: 16, fontWeight: '600' as const, textColor: '#f8fafc' } },
      datasource: makeDatasourceBinding(datasourceId, { content: fieldMap.title || 'title' }),
    },
  ];

  if (fieldMap.subtitle) {
    textChildren.push({
      id: nextId(),
      type: 'text',
      props: { content: `{{${fieldMap.subtitle}}}` },
      style: { base: { fontSize: 12, textColor: '#94a3b8' } },
      datasource: makeDatasourceBinding(datasourceId, { content: fieldMap.subtitle }),
    });
  }

  cardChildren.push({
    id: nextId(),
    type: 'container',
    props: { direction: 'vertical', gap: 4 },
    style: { base: { padding: { top: 10, right: 12, bottom: 10, left: 12 } } },
    children: textChildren,
  });

  return {
    backgroundColor: '#0f172a',
    scrollable: true,
    rootComponents: [
      makeHeaderText(datasourceName),
      {
        id: nextId(),
        type: 'list',
        props: { direction: 'vertical', gap: 12 },
        style: { base: { padding: { top: 0, right: 16, bottom: 16, left: 16 } } },
        datasource: makeDatasourceBinding(datasourceId, {}),
        children: [
          {
            id: nextId(),
            type: 'card',
            props: { elevation: 2 },
            style: { base: { backgroundColor: '#1e293b', border: { radius: 14 } } },
            children: cardChildren,
          },
        ],
      },
    ],
  };
}

function generateImageGrid(config: ListConfig): ScreenDefinition {
  const { datasourceId, datasourceName, fieldMap } = config;

  const cardChildren: ScreenComponent[] = [
    {
      id: nextId(),
      type: 'image',
      props: { src: `{{${fieldMap.image || 'image'}}}`, alt: 'grid item' },
      style: { base: { width: '100%', height: 140, border: { radius: 10 } } },
      datasource: makeDatasourceBinding(datasourceId, { src: fieldMap.image || 'image' }),
    },
    {
      id: nextId(),
      type: 'text',
      props: { content: `{{${fieldMap.title || 'title'}}}` },
      style: {
        base: {
          fontSize: 13,
          fontWeight: '600' as const,
          textColor: '#f8fafc',
          padding: { top: 6, right: 8, bottom: 6, left: 8 },
        },
      },
      datasource: makeDatasourceBinding(datasourceId, { content: fieldMap.title || 'title' }),
    },
  ];

  return {
    backgroundColor: '#0f172a',
    scrollable: true,
    rootComponents: [
      makeHeaderText(datasourceName),
      {
        id: nextId(),
        type: 'gallery',
        props: { columns: 2 },
        style: { base: { padding: { top: 0, right: 16, bottom: 16, left: 16 } } },
        datasource: makeDatasourceBinding(datasourceId, {}),
        children: [
          {
            id: nextId(),
            type: 'card',
            props: { elevation: 1 },
            style: { base: { backgroundColor: '#1e293b', border: { radius: 12 } } },
            children: cardChildren,
          },
        ],
      },
    ],
  };
}

function generateSimpleRows(config: ListConfig): ScreenDefinition {
  const { datasourceId, datasourceName, fieldMap } = config;

  const rowInnerChildren: ScreenComponent[] = [];

  // Left side: title + subtitle
  const leftChildren: ScreenComponent[] = [
    {
      id: nextId(),
      type: 'text',
      props: { content: `{{${fieldMap.title || 'title'}}}` },
      style: { base: { fontSize: 15, fontWeight: '500' as const, textColor: '#f8fafc' } },
      datasource: makeDatasourceBinding(datasourceId, { content: fieldMap.title || 'title' }),
    },
  ];

  if (fieldMap.subtitle) {
    leftChildren.push({
      id: nextId(),
      type: 'text',
      props: { content: `{{${fieldMap.subtitle}}}` },
      style: { base: { fontSize: 12, textColor: '#64748b' } },
      datasource: makeDatasourceBinding(datasourceId, { content: fieldMap.subtitle }),
    });
  }

  rowInnerChildren.push({
    id: nextId(),
    type: 'container',
    props: { direction: 'vertical', gap: 2 },
    children: leftChildren,
  });

  return {
    backgroundColor: '#0f172a',
    scrollable: true,
    rootComponents: [
      makeHeaderText(datasourceName),
      {
        id: nextId(),
        type: 'list',
        props: { direction: 'vertical', gap: 0 },
        style: { base: { padding: { top: 0, right: 0, bottom: 16, left: 0 } } },
        datasource: makeDatasourceBinding(datasourceId, {}),
        children: [
          {
            id: nextId(),
            type: 'container',
            props: { direction: 'horizontal', gap: 8 },
            style: {
              base: {
                padding: { top: 12, right: 16, bottom: 12, left: 16 },
                border: { width: 0, color: '#1e293b' },
              },
            },
            children: rowInnerChildren,
          },
          {
            id: nextId(),
            type: 'divider',
            props: { color: '#1e293b', thickness: 1 },
          },
        ],
      },
    ],
  };
}

function generateHorizontalScroll(config: ListConfig): ScreenDefinition {
  const { datasourceId, datasourceName, fieldMap } = config;

  const cardChildren: ScreenComponent[] = [];

  if (fieldMap.image) {
    cardChildren.push({
      id: nextId(),
      type: 'image',
      props: { src: `{{${fieldMap.image}}}`, alt: 'item' },
      style: { base: { width: 200, height: 130, border: { radius: 12 } } },
      datasource: makeDatasourceBinding(datasourceId, { src: fieldMap.image }),
    });
  }

  cardChildren.push({
    id: nextId(),
    type: 'text',
    props: { content: `{{${fieldMap.title || 'title'}}}` },
    style: {
      base: {
        fontSize: 14,
        fontWeight: '600' as const,
        textColor: '#f8fafc',
        padding: { top: 8, right: 10, bottom: 4, left: 10 },
      },
    },
    datasource: makeDatasourceBinding(datasourceId, { content: fieldMap.title || 'title' }),
  });

  if (fieldMap.subtitle) {
    cardChildren.push({
      id: nextId(),
      type: 'text',
      props: { content: `{{${fieldMap.subtitle}}}` },
      style: {
        base: {
          fontSize: 11,
          textColor: '#94a3b8',
          padding: { top: 0, right: 10, bottom: 8, left: 10 },
        },
      },
      datasource: makeDatasourceBinding(datasourceId, { content: fieldMap.subtitle }),
    });
  }

  return {
    backgroundColor: '#0f172a',
    scrollable: true,
    rootComponents: [
      makeHeaderText(datasourceName),
      {
        id: nextId(),
        type: 'horizontal_scroll',
        props: { gap: 12 },
        style: { base: { padding: { top: 0, right: 16, bottom: 16, left: 16 } } },
        datasource: makeDatasourceBinding(datasourceId, {}),
        children: [
          {
            id: nextId(),
            type: 'card',
            props: { elevation: 2 },
            style: { base: { backgroundColor: '#1e293b', border: { radius: 14 }, width: 200 } },
            children: cardChildren,
          },
        ],
      },
    ],
  };
}

export function generateListScreen(config: ListConfig): ScreenDefinition {
  resetIds();

  switch (config.layout) {
    case 'card_list':
      return generateCardList(config);
    case 'image_grid':
      return generateImageGrid(config);
    case 'simple_rows':
      return generateSimpleRows(config);
    case 'horizontal_scroll':
      return generateHorizontalScroll(config);
    default:
      return generateCardList(config);
  }
}

const LAYOUT_LABELS: Record<ListLayout, string> = {
  card_list: 'Card List',
  image_grid: 'Image Grid',
  simple_rows: 'Simple Rows',
  horizontal_scroll: 'H-Scroll',
};

export function getListLabel(datasourceName: string, layout: ListLayout): string {
  return `${datasourceName} (${LAYOUT_LABELS[layout]})`;
}
