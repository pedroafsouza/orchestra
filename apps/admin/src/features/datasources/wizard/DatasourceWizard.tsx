import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  PenLine,
  Globe,
  ArrowLeft,
  ArrowRight,
  X,
  Check,
  Plus,
} from 'lucide-react';
import type { DatasourceField, RestSourceConfig } from '@orchestra/shared';
import { FIELD_TYPES } from '../components/SchemaEditor';
import { RestConfigForm } from '../rest-config/RestConfigForm';
import { FieldMappingStep } from '../components/FieldMappingStep';
import type { TestRestResponse } from '../hooks/useDatasources';

interface DatasourceWizardProps {
  onCreateManual: (name: string, fields: DatasourceField[]) => void;
  onCreateRest: (
    name: string,
    config: RestSourceConfig,
    fields: DatasourceField[]
  ) => void;
  onTestRest: (config: RestSourceConfig) => Promise<TestRestResponse>;
  testResult: TestRestResponse | null;
  testLoading: boolean;
  onCancel: () => void;
}

const STEPS_MANUAL = ['Source Type', 'Fields'];
const STEPS_REST = ['Source Type', 'REST Config', 'Map Fields'];

export function DatasourceWizard({
  onCreateManual,
  onCreateRest,
  onTestRest,
  testResult,
  testLoading,
  onCancel,
}: DatasourceWizardProps) {
  const [step, setStep] = useState(0);
  const [sourceType, setSourceType] = useState<'manual' | 'rest' | null>(null);
  const [name, setName] = useState('');

  // Manual fields state
  const [fields, setFields] = useState<DatasourceField[]>([
    { key: 'title', label: 'Title', type: 'text' },
  ]);

  // REST config state
  const [restConfig, setRestConfig] = useState<RestSourceConfig>({
    url: '',
    method: 'GET',
    auth: { type: 'none' },
  });

  // Mapped fields from REST response
  const [mappedFields, setMappedFields] = useState<DatasourceField[]>([]);

  const steps = sourceType === 'rest' ? STEPS_REST : STEPS_MANUAL;
  const canNext =
    step === 0 ? !!sourceType && name.trim().length > 0 : true;

  const handleNext = () => {
    if (step === 0 && sourceType === 'manual') {
      setStep(1);
    } else if (step === 0 && sourceType === 'rest') {
      setStep(1);
    } else if (step === 1 && sourceType === 'manual') {
      onCreateManual(name, fields);
    } else if (step === 1 && sourceType === 'rest') {
      setStep(2);
    } else if (step === 2 && sourceType === 'rest') {
      onCreateRest(name, restConfig, mappedFields);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  i < step
                    ? 'bg-primary text-primary-foreground'
                    : i === step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? (
                  <Check className="w-3 h-3" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs ${
                  i === step ? 'font-medium' : 'text-muted-foreground'
                }`}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <div className="w-8 h-px bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Source type */}
        {step === 0 && (
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Collection name
            </Label>
            <Input
              className="mb-4"
              placeholder="My collection..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Label className="text-xs text-muted-foreground mb-2 block">
              Choose data source
            </Label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  sourceType === 'manual'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSourceType('manual')}
              >
                <PenLine className="w-8 h-8 text-muted-foreground" />
                <span className="font-medium text-sm">Manual Entry</span>
                <span className="text-xs text-muted-foreground text-center">
                  Add data manually via the table editor
                </span>
              </button>
              <button
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  sourceType === 'rest'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSourceType('rest')}
              >
                <Globe className="w-8 h-8 text-muted-foreground" />
                <span className="font-medium text-sm">REST API</span>
                <span className="text-xs text-muted-foreground text-center">
                  Fetch data from an external REST endpoint
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step 1 (manual): Field editor */}
        {step === 1 && sourceType === 'manual' && (
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Fields
            </Label>
            {fields.map((field, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  className="flex-1 h-8 text-xs"
                  placeholder="Key"
                  value={field.key}
                  onChange={(e) =>
                    setFields((prev) =>
                      prev.map((f, j) =>
                        j === i ? { ...f, key: e.target.value } : f
                      )
                    )
                  }
                />
                <Input
                  className="flex-1 h-8 text-xs"
                  placeholder="Label"
                  value={field.label}
                  onChange={(e) =>
                    setFields((prev) =>
                      prev.map((f, j) =>
                        j === i ? { ...f, label: e.target.value } : f
                      )
                    )
                  }
                />
                <select
                  className="rounded-md border border-input bg-background text-sm h-8 px-2"
                  value={field.type}
                  onChange={(e) =>
                    setFields((prev) =>
                      prev.map((f, j) =>
                        j === i
                          ? { ...f, type: e.target.value as any }
                          : f
                      )
                    )
                  }
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-destructive hover:text-destructive"
                  onClick={() =>
                    setFields((prev) => prev.filter((_, j) => j !== i))
                  }
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="xs"
              className="gap-1 text-primary mb-3"
              onClick={() =>
                setFields((prev) => [
                  ...prev,
                  {
                    key: `field_${prev.length}`,
                    label: '',
                    type: 'text',
                  },
                ])
              }
            >
              <Plus className="w-3 h-3" />
              Add Field
            </Button>
          </div>
        )}

        {/* Step 1 (REST): REST config form */}
        {step === 1 && sourceType === 'rest' && (
          <RestConfigForm
            config={restConfig}
            onChange={setRestConfig}
            onTest={onTestRest}
            testResult={testResult}
            testLoading={testLoading}
          />
        )}

        {/* Step 2 (REST): Field mapping */}
        {step === 2 && sourceType === 'rest' && testResult && (
          <FieldMappingStep
            testResult={testResult}
            onFieldsChange={setMappedFields}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div>
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step === 0 && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              disabled={!canNext || (step === 1 && sourceType === 'rest' && !testResult?.success)}
              onClick={handleNext}
            >
              {(step === 1 && sourceType === 'manual') ||
              (step === 2 && sourceType === 'rest')
                ? 'Create'
                : 'Next'}
              {!((step === 1 && sourceType === 'manual') ||
                (step === 2 && sourceType === 'rest')) && (
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
