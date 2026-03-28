import type { ScreenDefinition, ScreenComponent, DatasourceField } from '@orchestra/shared';

export type DetailLayout = 'header_fields' | 'card_layout' | 'full_width';

export interface DetailFieldConfig {
  key: string;
  label: string;
  type: DatasourceField['type'];
  included: boolean;
}

export interface DetailConfig {
  datasourceId: string;
  datasourceName: string;
  layout: DetailLayout;
  fields: DetailFieldConfig[];
}

let idCounter = 0;
function nextId(): string {
  return `wiz_detail_${++idCounter}`;
}

function resetIds(): void {
  idCounter = 0;
}

function makeFieldComponents(
  field: DetailFieldConfig,
  datasourceId: string,
): ScreenComponent[] {
  const components: ScreenComponent[] = [];

  // Label
  components.push({
    id: nextId(),
    type: 'text',
    props: { content: field.label },
    style: { base: { fontSize: 11, textColor: '#64748b' } },
  });

  // Value — type-specific
  if (field.type === 'image_url') {
    components.push({
      id: nextId(),
      type: 'image',
      props: { src: `{{${field.key}}}`, alt: field.label },
      style: { base: { width: '100%', height: 180, border: { radius: 12 } } },
      datasource: {
        datasourceId,
        fieldMappings: { src: field.key },
      },
    });
  } else if (field.type === 'boolean') {
    components.push({
      id: nextId(),
      type: 'badge',
      props: { text: `{{${field.key}}}`, color: '#6366f1' },
      datasource: {
        datasourceId,
        fieldMappings: { text: field.key },
      },
    });
  } else if (field.type === 'geolocation') {
    components.push({
      id: nextId(),
      type: 'map_view',
      props: { height: 150, zoom: 14, lat: 0, lng: 0, markers: [] },
      style: { base: { border: { radius: 12 } } },
      datasource: {
        datasourceId,
        fieldMappings: {
          lat: `${field.key}.latitude`,
          lng: `${field.key}.longitude`,
        },
      },
    });
  } else {
    // text, number, date, rich_text, url
    components.push({
      id: nextId(),
      type: 'text',
      props: { content: `{{${field.key}}}` },
      style: { base: { fontSize: 15, fontWeight: '500', textColor: '#f8fafc' } },
      datasource: {
        datasourceId,
        fieldMappings: { content: field.key },
      },
    });
  }

  return components;
}

function generateHeaderFields(config: DetailConfig): ScreenDefinition {
  const includedFields = config.fields.filter((f) => f.included);
  const imageField = includedFields.find((f) => f.type === 'image_url');
  const nonImageFields = includedFields.filter((f) => f.type !== 'image_url');

  const rootComponents: ScreenComponent[] = [];

  // Hero image at top
  if (imageField) {
    rootComponents.push({
      id: nextId(),
      type: 'image',
      props: { src: `{{${imageField.key}}}`, alt: 'detail header' },
      style: { base: { width: '100%', height: 220 } },
      datasource: {
        datasourceId: config.datasourceId,
        fieldMappings: { src: imageField.key },
      },
    });
  }

  // Field rows
  const fieldChildren: ScreenComponent[] = [];
  for (const field of nonImageFields) {
    fieldChildren.push(...makeFieldComponents(field, config.datasourceId));
  }

  rootComponents.push({
    id: nextId(),
    type: 'container',
    props: { direction: 'vertical', gap: 12 },
    style: {
      base: { padding: { top: 16, right: 16, bottom: 20, left: 16 } },
    },
    children: fieldChildren,
  });

  return {
    backgroundColor: '#0f172a',
    scrollable: true,
    rootComponents,
  };
}

function generateCardLayout(config: DetailConfig): ScreenDefinition {
  const includedFields = config.fields.filter((f) => f.included);
  const imageField = includedFields.find((f) => f.type === 'image_url');
  const nonImageFields = includedFields.filter((f) => f.type !== 'image_url');

  const cardChildren: ScreenComponent[] = [];

  if (imageField) {
    cardChildren.push({
      id: nextId(),
      type: 'image',
      props: { src: `{{${imageField.key}}}`, alt: 'detail image' },
      style: { base: { width: '100%', height: 180, border: { radius: 12 } } },
      datasource: {
        datasourceId: config.datasourceId,
        fieldMappings: { src: imageField.key },
      },
    });
  }

  for (const field of nonImageFields) {
    cardChildren.push(...makeFieldComponents(field, config.datasourceId));
  }

  return {
    backgroundColor: '#0f172a',
    scrollable: true,
    rootComponents: [
      {
        id: nextId(),
        type: 'card',
        props: { elevation: 2 },
        style: {
          base: {
            backgroundColor: '#1e293b',
            border: { radius: 16 },
            margin: { top: 16, right: 16, bottom: 16, left: 16 },
            padding: { top: 16, right: 16, bottom: 16, left: 16 },
          },
        },
        children: cardChildren,
      },
    ],
  };
}

function generateFullWidth(config: DetailConfig): ScreenDefinition {
  const includedFields = config.fields.filter((f) => f.included);
  const imageField = includedFields.find((f) => f.type === 'image_url');
  const nonImageFields = includedFields.filter((f) => f.type !== 'image_url');

  const rootComponents: ScreenComponent[] = [];

  if (imageField) {
    rootComponents.push({
      id: nextId(),
      type: 'image',
      props: { src: `{{${imageField.key}}}`, alt: 'detail image' },
      style: { base: { width: '100%', height: 260 } },
      datasource: {
        datasourceId: config.datasourceId,
        fieldMappings: { src: imageField.key },
      },
    });
  }

  for (const field of nonImageFields) {
    const comps = makeFieldComponents(field, config.datasourceId);
    // Wrap each field group in a container with horizontal padding
    rootComponents.push({
      id: nextId(),
      type: 'container',
      props: { direction: 'vertical', gap: 4 },
      style: {
        base: { padding: { top: 12, right: 16, bottom: 12, left: 16 } },
      },
      children: comps,
    });
    // Add divider between fields
    rootComponents.push({
      id: nextId(),
      type: 'divider',
      props: { color: '#334155', thickness: 1 },
    });
  }

  // Remove trailing divider
  if (rootComponents.length > 0 && rootComponents[rootComponents.length - 1].type === 'divider') {
    rootComponents.pop();
  }

  return {
    backgroundColor: '#0f172a',
    scrollable: true,
    rootComponents,
  };
}

export function generateDetailScreen(config: DetailConfig): ScreenDefinition {
  resetIds();

  switch (config.layout) {
    case 'header_fields':
      return generateHeaderFields(config);
    case 'card_layout':
      return generateCardLayout(config);
    case 'full_width':
      return generateFullWidth(config);
    default:
      return generateHeaderFields(config);
  }
}

export function getDetailLabel(datasourceName: string): string {
  return `${datasourceName} Detail`;
}
