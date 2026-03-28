import { useState, useEffect, useMemo } from 'react';
import { WizardShell } from './WizardShell';
import { WizardPhonePreview } from './WizardPhonePreview';
import { LayoutPreviewCard } from './shared/LayoutPreviewCard';
import { Label } from '@/components/ui/label';
import { FileText, CreditCard, Maximize2, Database } from 'lucide-react';
import { api } from '@/lib/api';
import {
  generateDetailScreen,
  getDetailLabel,
  type DetailLayout,
  type DetailConfig,
  type DetailFieldConfig,
} from './generators/generateDetailScreen';
import type { OrchestraNodeData } from '../store/flowStore';
import type { DatasourceField } from '@orchestra/shared';

interface Datasource {
  id: string;
  name: string;
  fields: DatasourceField[];
}

export interface DetailWizardProps {
  projectId: string;
  onComplete: (data: Partial<OrchestraNodeData>) => void;
  onCancel: () => void;
}

const LAYOUTS: {
  id: DetailLayout;
  label: string;
  description: string;
  icon: typeof FileText;
  gradient: string;
}[] = [
  {
    id: 'header_fields',
    label: 'Header + Fields',
    description: 'Large image at top, fields below',
    icon: FileText,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  {
    id: 'card_layout',
    label: 'Card',
    description: 'Everything inside a rounded card',
    icon: CreditCard,
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  },
  {
    id: 'full_width',
    label: 'Full Width',
    description: 'Edge-to-edge with dividers',
    icon: Maximize2,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  },
];

export function DetailWizard({ projectId, onComplete, onCancel }: DetailWizardProps) {
  const [step, setStep] = useState(1);
  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDsId, setSelectedDsId] = useState<string>('');
  const [fields, setFields] = useState<DetailFieldConfig[]>([]);
  const [layout, setLayout] = useState<DetailLayout>('header_fields');

  useEffect(() => {
    api<Datasource[]>(`/api/projects/${projectId}/datasources`)
      .then(setDatasources)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const selectedDs = datasources.find((ds) => ds.id === selectedDsId) || null;

  // Initialize fields when datasource changes
  useEffect(() => {
    if (selectedDs) {
      setFields(
        selectedDs.fields.map((f) => ({
          key: f.key,
          label: f.label,
          type: f.type,
          included: true,
        })),
      );
    }
  }, [selectedDs]);

  const toggleField = (key: string) => {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, included: !f.included } : f)),
    );
  };

  const config: DetailConfig = useMemo(
    () => ({
      datasourceId: selectedDsId,
      datasourceName: selectedDs?.name || 'Detail',
      layout,
      fields,
    }),
    [selectedDsId, selectedDs, layout, fields],
  );

  const screenDefinition = useMemo(
    () =>
      selectedDsId && fields.some((f) => f.included)
        ? generateDetailScreen(config)
        : { rootComponents: [], backgroundColor: '#0f172a' },
    [config, selectedDsId, fields],
  );

  const handleComplete = () => {
    onComplete({
      label: getDetailLabel(selectedDs?.name || 'Detail'),
      props: { screenDefinition },
    });
  };

  const canProceedStep1 = !!selectedDsId;
  const canProceedStep2 = fields.some((f) => f.included);

  return (
    <WizardShell
      title="Detail Wizard"
      step={step}
      totalSteps={3}
      onCancel={onCancel}
      onBack={step > 1 ? () => setStep(step - 1) : undefined}
      onNext={
        step === 1 && canProceedStep1
          ? () => setStep(2)
          : step === 2 && canProceedStep2
            ? () => setStep(3)
            : step === 3
              ? handleComplete
              : undefined
      }
      nextLabel={step === 3 ? 'Create Node' : 'Next'}
      nextDisabled={step === 1 ? !canProceedStep1 : step === 2 ? !canProceedStep2 : false}
      preview={<WizardPhonePreview screenDefinition={screenDefinition} />}
    >
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Pick Datasource</h2>
            <p className="text-sm text-muted-foreground">
              Choose a datasource for your detail screen.
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
              {datasources.map((ds) => (
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
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{ds.name}</div>
                    <div className="text-xs text-muted-foreground">{ds.fields.length} fields</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedDs && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Select Fields</h2>
            <p className="text-sm text-muted-foreground">
              Choose which fields to display on the detail screen.
            </p>
          </div>

          <div className="space-y-2">
            {fields.map((field) => (
              <button
                key={field.key}
                type="button"
                onClick={() => toggleField(field.key)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left
                  ${field.included
                    ? 'border-indigo-500/50 bg-indigo-500/5'
                    : 'border-border/40 bg-card/50 opacity-60'
                  }
                `}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  field.included ? 'border-indigo-500 bg-indigo-500' : 'border-border'
                }`}>
                  {field.included && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{field.label}</div>
                  <div className="text-[11px] text-muted-foreground">{field.type}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Choose Layout</h2>
            <p className="text-sm text-muted-foreground">
              Select how the detail fields should be arranged.
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
    </WizardShell>
  );
}
