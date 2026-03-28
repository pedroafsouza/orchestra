import { useState, useMemo, useCallback } from 'react';
import { WizardShell } from './WizardShell';
import { WizardPhonePreview } from './WizardPhonePreview';
import { DatasourcePicker, type DatasourceInfo } from './shared/DatasourcePicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GripVertical, Check } from 'lucide-react';
import {
  generateFormScreen,
  getFormLabel,
  type FormField,
  type FormConfig,
} from './generators/generateFormScreen';
import type { OrchestraNodeData } from '../store/flowStore';

export interface FormWizardProps {
  projectId: string;
  onComplete: (data: Partial<OrchestraNodeData>) => void;
  onCancel: () => void;
}

function fieldTypeToInputHint(type: string): string {
  switch (type) {
    case 'text':
    case 'rich_text':
    case 'url':
      return 'Text input';
    case 'number':
      return 'Number input';
    case 'boolean':
      return 'Switch toggle';
    case 'date':
      return 'Date picker';
    case 'image_url':
      return 'Image URL input';
    case 'geolocation':
      return 'Lat/Lng inputs';
    default:
      return 'Text input';
  }
}

export function FormWizard({ projectId, onComplete, onCancel }: FormWizardProps) {
  const [step, setStep] = useState(1);
  const [datasource, setDatasource] = useState<DatasourceInfo | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [submitLabel, setSubmitLabel] = useState('Submit');
  const [actionType, setActionType] = useState<'DATASOURCE_ADD' | 'NAVIGATE'>('DATASOURCE_ADD');
  const [navigateTarget, setNavigateTarget] = useState('');
  const [showBackButton, setShowBackButton] = useState(true);
  const [backTarget, setBackTarget] = useState('');

  const handleDatasourceChange = (ds: DatasourceInfo) => {
    setDatasource(ds);
    // Auto-generate form fields from datasource fields
    setFields(
      ds.fields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        included: true,
      })),
    );
  };

  const toggleField = useCallback((key: string) => {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, included: !f.included } : f)),
    );
  }, []);

  const updateFieldLabel = useCallback((key: string, label: string) => {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, label } : f)),
    );
  }, []);

  const moveField = useCallback((fromIndex: number, direction: 'up' | 'down') => {
    setFields((prev) => {
      const newFields = [...prev];
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= newFields.length) return prev;
      [newFields[fromIndex], newFields[toIndex]] = [newFields[toIndex], newFields[fromIndex]];
      return newFields;
    });
  }, []);

  const config: FormConfig | null = useMemo(() => {
    if (!datasource) return null;
    return {
      datasourceId: datasource.id,
      datasourceName: datasource.name,
      fields,
      submitLabel,
      actionType,
      navigateTarget,
      showBackButton,
      backTarget,
    };
  }, [datasource, fields, submitLabel, actionType, navigateTarget, showBackButton, backTarget]);

  const screenDefinition = useMemo(
    () => (config ? generateFormScreen(config) : null),
    [config],
  );

  const handleComplete = () => {
    if (!screenDefinition || !datasource) return;
    onComplete({
      label: getFormLabel(datasource.name),
      props: { screenDefinition },
    });
  };

  const canGoNext = () => {
    if (step === 1) return !!datasource;
    if (step === 2) return fields.some((f) => f.included);
    return true;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <WizardShell
      title="Form Wizard"
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
              Select the datasource this form will write to. Fields will be auto-generated.
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
            <h2 className="text-lg font-semibold text-foreground mb-1">Configure Fields</h2>
            <p className="text-sm text-muted-foreground">
              Select which fields to include and customize their labels. Drag to reorder.
            </p>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.key}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border transition-all duration-200
                  ${
                    field.included
                      ? 'bg-card border-border/60'
                      : 'bg-muted/30 border-border/30 opacity-60'
                  }
                `}
              >
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveField(index, 'up')}
                    disabled={index === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
                    aria-label="Move up"
                  >
                    <GripVertical className="w-3.5 h-3.5 rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveField(index, 'down')}
                    disabled={index === fields.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
                    aria-label="Move down"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Include checkbox */}
                <button
                  type="button"
                  onClick={() => toggleField(field.key)}
                  className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                    ${
                      field.included
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-border bg-transparent'
                    }
                  `}
                >
                  {field.included && <Check className="w-3 h-3 text-white" />}
                </button>

                {/* Label input */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateFieldLabel(field.key, e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-foreground outline-none border-none focus:ring-0"
                  />
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {field.key} &middot; {fieldTypeToInputHint(field.type)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Configure Submit</h2>
            <p className="text-sm text-muted-foreground">
              Choose what happens when the user submits the form.
            </p>
          </div>

          {/* Action type */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Action Type</Label>
            <div className="space-y-2">
              <label
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    actionType === 'DATASOURCE_ADD'
                      ? 'border-indigo-500 bg-indigo-500/5'
                      : 'border-border/60 bg-card'
                  }
                `}
              >
                <input
                  type="radio"
                  name="actionType"
                  value="DATASOURCE_ADD"
                  checked={actionType === 'DATASOURCE_ADD'}
                  onChange={() => setActionType('DATASOURCE_ADD')}
                  className="accent-indigo-500"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">Add to Datasource</div>
                  <div className="text-xs text-muted-foreground">
                    Submit creates a new entry in {datasource?.name}
                  </div>
                </div>
              </label>

              <label
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    actionType === 'NAVIGATE'
                      ? 'border-indigo-500 bg-indigo-500/5'
                      : 'border-border/60 bg-card'
                  }
                `}
              >
                <input
                  type="radio"
                  name="actionType"
                  value="NAVIGATE"
                  checked={actionType === 'NAVIGATE'}
                  onChange={() => setActionType('NAVIGATE')}
                  className="accent-indigo-500"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">Navigate</div>
                  <div className="text-xs text-muted-foreground">
                    Submit navigates to another screen
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Navigate target (if NAVIGATE) */}
          {actionType === 'NAVIGATE' && (
            <div className="space-y-1.5">
              <Label htmlFor="wiz-nav-target" className="text-xs font-medium">Navigate To</Label>
              <Input
                id="wiz-nav-target"
                value={navigateTarget}
                onChange={(e) => setNavigateTarget(e.target.value)}
                placeholder="Node ID"
              />
            </div>
          )}

          {/* Submit button label */}
          <div className="space-y-1.5">
            <Label htmlFor="wiz-submit-label" className="text-xs font-medium">Submit Button Label</Label>
            <Input
              id="wiz-submit-label"
              value={submitLabel}
              onChange={(e) => setSubmitLabel(e.target.value)}
              placeholder="Submit"
            />
          </div>

          {/* Back button toggle */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setShowBackButton(!showBackButton)}
                className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                  ${
                    showBackButton
                      ? 'bg-indigo-500 border-indigo-500'
                      : 'border-border bg-transparent'
                  }
                `}
              >
                {showBackButton && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className="text-sm text-foreground">Show back button</span>
            </label>

            {showBackButton && (
              <div className="space-y-1.5 pl-8">
                <Label htmlFor="wiz-back-target" className="text-xs font-medium">Back Button Target</Label>
                <Input
                  id="wiz-back-target"
                  value={backTarget}
                  onChange={(e) => setBackTarget(e.target.value)}
                  placeholder="Node ID (optional)"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </WizardShell>
  );
}
