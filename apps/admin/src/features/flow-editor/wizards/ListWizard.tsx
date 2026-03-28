import { useState, useMemo } from 'react';
import { WizardShell } from './WizardShell';
import { WizardPhonePreview } from './WizardPhonePreview';
import { LayoutPreviewCard } from './shared/LayoutPreviewCard';
import { DatasourcePicker, type DatasourceInfo } from './shared/DatasourcePicker';
import { FieldMapper } from './shared/FieldMapper';
import { LayoutList, Grid2x2, AlignJustify, ArrowRightLeft } from 'lucide-react';
import {
  generateListScreen,
  getListLabel,
  type ListLayout,
  type ListConfig,
} from './generators/generateListScreen';
import type { OrchestraNodeData } from '../store/flowStore';

export interface ListWizardProps {
  projectId: string;
  onComplete: (data: Partial<OrchestraNodeData>) => void;
  onCancel: () => void;
}

const LAYOUTS: {
  id: ListLayout;
  label: string;
  description: string;
  icon: typeof LayoutList;
  gradient: string;
}[] = [
  {
    id: 'card_list',
    label: 'Card List',
    description: 'Vertical cards with image + title + subtitle',
    icon: LayoutList,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  {
    id: 'image_grid',
    label: 'Image Grid',
    description: '2-column grid of image thumbnails',
    icon: Grid2x2,
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  },
  {
    id: 'simple_rows',
    label: 'Simple Rows',
    description: 'Text rows with icon + chevron',
    icon: AlignJustify,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  },
  {
    id: 'horizontal_scroll',
    label: 'Horizontal Scroll',
    description: 'Horizontal card carousel',
    icon: ArrowRightLeft,
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  },
];

// Define which slots each layout needs
const LAYOUT_SLOTS: Record<ListLayout, { key: string; label: string; types?: string[] }[]> = {
  card_list: [
    { key: 'title', label: 'Title', types: ['text', 'rich_text', 'url', 'number'] },
    { key: 'subtitle', label: 'Subtitle', types: ['text', 'rich_text', 'url', 'number'] },
    { key: 'image', label: 'Image', types: ['image_url'] },
  ],
  image_grid: [
    { key: 'image', label: 'Image', types: ['image_url'] },
    { key: 'title', label: 'Title', types: ['text', 'rich_text', 'url', 'number'] },
    { key: 'subtitle', label: 'Subtitle', types: ['text', 'rich_text', 'url', 'number'] },
  ],
  simple_rows: [
    { key: 'title', label: 'Title', types: ['text', 'rich_text', 'url', 'number'] },
    { key: 'subtitle', label: 'Subtitle', types: ['text', 'rich_text', 'url', 'number'] },
  ],
  horizontal_scroll: [
    { key: 'image', label: 'Image', types: ['image_url'] },
    { key: 'title', label: 'Title', types: ['text', 'rich_text', 'url', 'number'] },
    { key: 'subtitle', label: 'Subtitle', types: ['text', 'rich_text', 'url', 'number'] },
  ],
};

export function ListWizard({ projectId, onComplete, onCancel }: ListWizardProps) {
  const [step, setStep] = useState(1);
  const [datasource, setDatasource] = useState<DatasourceInfo | null>(null);
  const [layout, setLayout] = useState<ListLayout>('card_list');
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});

  const config: ListConfig | null = useMemo(() => {
    if (!datasource) return null;
    return {
      layout,
      datasourceId: datasource.id,
      datasourceName: datasource.name,
      fieldMap: fieldMapping,
    };
  }, [datasource, layout, fieldMapping]);

  const screenDefinition = useMemo(
    () => (config ? generateListScreen(config) : null),
    [config],
  );

  const handleDatasourceChange = (ds: DatasourceInfo) => {
    setDatasource(ds);
    // Auto-map fields by matching slot keys to datasource field keys
    const autoMapping: Record<string, string> = {};
    const slots = LAYOUT_SLOTS[layout];
    for (const slot of slots) {
      const match = ds.fields.find((f) => {
        if (slot.types && !slot.types.includes(f.type)) return false;
        return f.key.toLowerCase().includes(slot.key.toLowerCase());
      });
      if (match) {
        autoMapping[slot.key] = match.key;
      }
    }
    setFieldMapping(autoMapping);
  };

  const handleComplete = () => {
    if (!screenDefinition || !datasource) return;
    onComplete({
      label: getListLabel(datasource.name, layout),
      props: { screenDefinition },
    });
  };

  const canGoNext = () => {
    if (step === 1) return !!datasource;
    if (step === 2) return true;
    if (step === 3) return !!fieldMapping.title || layout === 'simple_rows';
    return true;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const fields = datasource
    ? datasource.fields.map((f) => ({ key: f.key, name: f.label, type: f.type }))
    : [];

  return (
    <WizardShell
      title="List Wizard"
      step={step}
      totalSteps={3}
      onCancel={onCancel}
      onBack={step > 1 ? () => setStep(step - 1) : undefined}
      onNext={handleNext}
      nextLabel={step === 3 ? 'Create Node' : 'Next'}
      nextDisabled={!canGoNext()}
      preview={
        screenDefinition ? (
          <WizardPhonePreview screenDefinition={screenDefinition} />
        ) : undefined
      }
    >
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Choose a Datasource</h2>
            <p className="text-sm text-muted-foreground">
              Select the datasource that will power this list screen.
            </p>
          </div>
          <DatasourcePicker
            projectId={projectId}
            value={datasource?.id ?? null}
            onChange={handleDatasourceChange}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Choose a Layout</h2>
            <p className="text-sm text-muted-foreground">
              Select how items from{' '}
              <span className="font-medium text-foreground">{datasource?.name}</span>{' '}
              should be displayed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {LAYOUTS.map((l) => (
              <LayoutPreviewCard
                key={l.id}
                icon={l.icon}
                label={l.label}
                description={l.description}
                selected={layout === l.id}
                onClick={() => setLayout(l.id)}
                gradient={l.gradient}
              />
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Map Fields</h2>
            <p className="text-sm text-muted-foreground">
              Choose which datasource fields map to each visual slot in the{' '}
              <span className="font-medium text-foreground">
                {LAYOUTS.find((l) => l.id === layout)?.label}
              </span>{' '}
              layout.
            </p>
          </div>

          <FieldMapper
            fields={fields}
            slots={LAYOUT_SLOTS[layout]}
            mapping={fieldMapping}
            onChange={setFieldMapping}
          />
        </div>
      )}
    </WizardShell>
  );
}
