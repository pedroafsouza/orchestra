import { useState, useEffect, useMemo } from 'react';
import { WizardShell } from './WizardShell';
import { WizardPhonePreview } from './WizardPhonePreview';
import { LayoutPreviewCard } from './shared/LayoutPreviewCard';
import { Label } from '@/components/ui/label';
import { Grid2X2, LayoutGrid, GalleryHorizontalEnd } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import {
  generateGalleryScreen,
  getGalleryLabel,
  type GalleryLayout,
  type GalleryConfig,
} from './generators/generateGalleryScreen';
import type { OrchestraNodeData } from '../store/flowStore';
import type { DatasourceField } from '@orchestra/shared';

interface Datasource {
  id: string;
  name: string;
  fields: DatasourceField[];
}

export interface GalleryWizardProps {
  projectId: string;
  onComplete: (data: Partial<OrchestraNodeData>) => void;
  onCancel: () => void;
}

const LAYOUTS: {
  id: GalleryLayout;
  label: string;
  description: string;
  icon: typeof Grid2X2;
  gradient: string;
}[] = [
  {
    id: 'grid',
    label: 'Grid',
    description: '2-column grid of image cards',
    icon: Grid2X2,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  {
    id: 'masonry',
    label: 'Masonry',
    description: 'Pinterest-style masonry layout',
    icon: LayoutGrid,
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  },
  {
    id: 'carousel_layout',
    label: 'Carousel',
    description: 'Swipeable full-width carousel',
    icon: GalleryHorizontalEnd,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  },
];

export function GalleryWizard({ projectId, onComplete, onCancel }: GalleryWizardProps) {
  const [step, setStep] = useState(1);
  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDsId, setSelectedDsId] = useState<string>('');
  const [layout, setLayout] = useState<GalleryLayout>('grid');
  const [columns, setColumns] = useState(2);
  const [imageField, setImageField] = useState<string>('');
  const [captionField, setCaptionField] = useState<string>('');

  useEffect(() => {
    api<Datasource[]>(`/api/projects/${projectId}/datasources`)
      .then(setDatasources)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const selectedDs = datasources.find((ds) => ds.id === selectedDsId) || null;
  const imageFields = selectedDs?.fields.filter((f) => f.type === 'image_url') || [];
  const textFields = selectedDs?.fields.filter((f) => f.type === 'text' || f.type === 'rich_text') || [];

  // Auto-select first image field
  useEffect(() => {
    if (imageFields.length > 0 && !imageField) {
      setImageField(imageFields[0].key);
    }
  }, [imageFields, imageField]);

  const config: GalleryConfig = useMemo(
    () => ({
      datasourceId: selectedDsId,
      datasourceName: selectedDs?.name || 'Gallery',
      layout,
      columns,
      imageField,
      captionField: captionField || undefined,
    }),
    [selectedDsId, selectedDs, layout, columns, imageField, captionField],
  );

  const screenDefinition = useMemo(
    () =>
      selectedDsId && imageField
        ? generateGalleryScreen(config)
        : { rootComponents: [], backgroundColor: '#0f172a' },
    [config, selectedDsId, imageField],
  );

  const handleComplete = () => {
    onComplete({
      label: getGalleryLabel(selectedDs?.name || 'Gallery'),
      props: { screenDefinition },
    });
  };

  const canProceedStep1 = !!selectedDsId;
  const canProceedStep3 = !!imageField;

  return (
    <WizardShell
      title="Gallery Wizard"
      step={step}
      totalSteps={3}
      onCancel={onCancel}
      onBack={step > 1 ? () => setStep(step - 1) : undefined}
      onNext={
        step === 1 && canProceedStep1
          ? () => setStep(2)
          : step === 2
            ? () => setStep(3)
            : step === 3 && canProceedStep3
              ? handleComplete
              : undefined
      }
      nextLabel={step === 3 ? 'Create Node' : 'Next'}
      nextDisabled={step === 1 ? !canProceedStep1 : step === 3 ? !canProceedStep3 : false}
      preview={<WizardPhonePreview screenDefinition={screenDefinition} />}
    >
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Pick Datasource</h2>
            <p className="text-sm text-muted-foreground">
              Choose a datasource with images for your gallery.
            </p>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Loading datasources...</div>
          ) : datasources.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No datasources found. Create one in the Datasources tab first.
            </div>
          ) : (
            <div className="space-y-2">
              {datasources.map((ds) => {
                const hasImages = ds.fields.some((f) => f.type === 'image_url');
                return (
                  <button
                    key={ds.id}
                    type="button"
                    onClick={() => setSelectedDsId(ds.id)}
                    className={`
                      w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                      ${selectedDsId === ds.id
                        ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/10'
                        : 'border-border/60 hover:border-indigo-400/40 bg-card cursor-pointer'
                      }
                    `}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedDsId === ds.id ? 'bg-indigo-500/15 text-indigo-400' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Grid2X2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{ds.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {ds.fields.length} fields
                        {!hasImages && ' — no image fields'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Choose Layout</h2>
            <p className="text-sm text-muted-foreground">
              Select how your gallery images should be displayed.
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

          {layout !== 'carousel_layout' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Columns ({columns})</Label>
              <input
                type="range"
                min={2}
                max={3}
                value={columns}
                onChange={(e) => setColumns(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          )}
        </div>
      )}

      {step === 3 && selectedDs && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Map Image Field</h2>
            <p className="text-sm text-muted-foreground">
              Select which field contains the image URL.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Image Field</Label>
            <Select value={imageField} onValueChange={setImageField}>
              <SelectTrigger><SelectValue placeholder="Select image field" /></SelectTrigger>
              <SelectContent>
                {imageFields.map((f) => (
                  <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Caption Field (optional)</Label>
            <Select value={captionField || '_none'} onValueChange={(v) => setCaptionField(v === '_none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {textFields.map((f) => (
                  <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
