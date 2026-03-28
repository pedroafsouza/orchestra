import type { ScreenDefinition, ScreenComponent } from '@orchestra/shared';

export interface FormField {
  key: string;
  label: string;
  type: string; // DatasourceFieldType: text, number, boolean, date, image_url, rich_text, url, geolocation
  included: boolean;
}

export interface FormConfig {
  datasourceId: string;
  datasourceName: string;
  fields: FormField[];
  submitLabel: string;
  actionType: 'DATASOURCE_ADD' | 'NAVIGATE';
  navigateTarget: string;
  showBackButton: boolean;
  backTarget: string;
}

let idCounter = 0;
function nextId(): string {
  return `wiz_form_${++idCounter}`;
}

function resetIds(): void {
  idCounter = 0;
}

function makeInputForField(field: FormField, inputId: string): ScreenComponent[] {
  const label: ScreenComponent = {
    id: nextId(),
    type: 'text',
    props: { content: field.label },
    style: { base: { fontSize: 12, textColor: '#94a3b8' } },
  };

  switch (field.type) {
    case 'boolean':
      return [
        {
          id: inputId,
          type: 'switch',
          props: { label: field.label, checked: false },
        },
      ];

    case 'date':
      return [
        label,
        {
          id: inputId,
          type: 'date_picker',
          props: { label: field.label, placeholder: 'Select date...' },
        },
      ];

    case 'geolocation':
      return [
        label,
        {
          id: inputId,
          type: 'container',
          props: { direction: 'horizontal', gap: 8 },
          children: [
            {
              id: `${inputId}_lat`,
              type: 'input',
              props: { placeholder: 'Latitude', type: 'number' },
            },
            {
              id: `${inputId}_lng`,
              type: 'input',
              props: { placeholder: 'Longitude', type: 'number' },
            },
          ],
        },
      ];

    case 'number':
      return [
        label,
        {
          id: inputId,
          type: 'input',
          props: {
            placeholder: `Enter ${field.label.toLowerCase()}...`,
            type: 'number',
          },
        },
      ];

    case 'image_url':
      return [
        label,
        {
          id: inputId,
          type: 'input',
          props: {
            placeholder: 'Image URL...',
            type: 'text',
          },
        },
      ];

    // text, rich_text, url, and any other type
    default:
      return [
        label,
        {
          id: inputId,
          type: 'input',
          props: {
            placeholder: `Enter ${field.label.toLowerCase()}...`,
            type: 'text',
          },
        },
      ];
  }
}

export function generateFormScreen(config: FormConfig): ScreenDefinition {
  resetIds();

  const includedFields = config.fields.filter((f) => f.included);

  // Header
  const headerTitle: ScreenComponent = {
    id: nextId(),
    type: 'text',
    props: { content: `New ${config.datasourceName}` },
    style: {
      base: {
        fontSize: 22,
        fontWeight: 'bold' as const,
        textColor: '#f8fafc',
        padding: { top: 20, right: 16, bottom: 4, left: 16 },
      },
    },
  };

  const headerSubtitle: ScreenComponent = {
    id: nextId(),
    type: 'text',
    props: { content: 'Fill in the details below' },
    style: {
      base: {
        fontSize: 13,
        textColor: '#94a3b8',
        padding: { top: 0, right: 16, bottom: 16, left: 16 },
      },
    },
  };

  // Build field components
  const fieldComponents: ScreenComponent[] = [];
  const fieldMap: Record<string, string> = {};

  includedFields.forEach((field, i) => {
    const inputId = `wiz_form_input_${i}`;
    fieldMap[field.key] = inputId;
    const components = makeInputForField(field, inputId);
    fieldComponents.push(...components);
  });

  const fieldsContainer: ScreenComponent = {
    id: nextId(),
    type: 'container',
    props: { direction: 'vertical', gap: 12 },
    style: { base: { padding: { top: 0, right: 16, bottom: 0, left: 16 } } },
    children: fieldComponents,
  };

  const spacer: ScreenComponent = {
    id: nextId(),
    type: 'spacer',
    props: { height: 16 },
  };

  // Submit button
  const submitButton: ScreenComponent = {
    id: nextId(),
    type: 'button',
    props: {
      label: config.submitLabel || 'Submit',
      variant: 'primary',
      navigateTo: config.actionType === 'NAVIGATE' ? config.navigateTarget : '',
    },
    style: {
      base: {
        margin: { top: 0, right: 16, bottom: 8, left: 16 },
        backgroundColor: '#6366f1',
        border: { radius: 12 },
      },
    },
    actions:
      config.actionType === 'DATASOURCE_ADD'
        ? [
            {
              trigger: 'onPress',
              type: 'DATASOURCE_ADD',
              payload: {
                datasourceId: config.datasourceId,
                fieldMap,
              },
            },
          ]
        : [],
  };

  const rootComponents: ScreenComponent[] = [
    headerTitle,
    headerSubtitle,
    fieldsContainer,
    spacer,
    submitButton,
  ];

  // Back button (optional)
  if (config.showBackButton) {
    rootComponents.push({
      id: nextId(),
      type: 'button',
      props: {
        label: 'Back',
        variant: 'secondary',
        navigateTo: config.backTarget || '',
      },
      style: {
        base: {
          margin: { top: 0, right: 16, bottom: 20, left: 16 },
          backgroundColor: '#334155',
          border: { radius: 12 },
        },
      },
    });
  }

  return {
    backgroundColor: '#0f172a',
    scrollable: true,
    rootComponents,
  };
}

export function getFormLabel(datasourceName: string): string {
  return `Add ${datasourceName}`;
}
