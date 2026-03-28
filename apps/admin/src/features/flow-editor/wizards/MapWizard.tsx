import { useState, useEffect, useMemo } from 'react';
import { WizardShell } from './WizardShell';
import { WizardPhonePreview } from './WizardPhonePreview';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import {
  generateMapScreen,
  getMapLabel,
  type MapConfig,
} from './generators/generateMapScreen';
import type { OrchestraNodeData } from '../store/flowStore';
import type { DatasourceField } from '@orchestra/shared';

interface Datasource {
  id: string;
  name: string;
  fields: DatasourceField[];
}

export interface MapWizardProps {
  projectId: string;
  onComplete: (data: Partial<OrchestraNodeData>) => void;
  onCancel: () => void;
}

export function MapWizard({ projectId, onComplete, onCancel }: MapWizardProps) {
  const [step, setStep] = useState(1);
  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDsId, setSelectedDsId] = useState<string>('');

  // Field mappings
  const [geoField, setGeoField] = useState<string>('');
  const [latField, setLatField] = useState<string>('');
  const [lngField, setLngField] = useState<string>('');
  const [markerTitle, setMarkerTitle] = useState<string>('');

  // Map settings
  const [zoom, setZoom] = useState(12);
  const [mapHeight, setMapHeight] = useState(300);

  useEffect(() => {
    api<Datasource[]>(`/api/projects/${projectId}/datasources`)
      .then(setDatasources)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const selectedDs = datasources.find((ds) => ds.id === selectedDsId) || null;

  const geoFields = selectedDs?.fields.filter((f) => f.type === 'geolocation') || [];
  const numberFields = selectedDs?.fields.filter((f) => f.type === 'number') || [];
  const textFields = selectedDs?.fields.filter((f) => f.type === 'text' || f.type === 'rich_text') || [];

  const useGeoMode = geoFields.length > 0;

  // Auto-select first geo field
  useEffect(() => {
    if (useGeoMode && geoFields.length > 0 && !geoField) {
      setGeoField(geoFields[0].key);
    }
  }, [useGeoMode, geoFields, geoField]);

  const config: MapConfig = useMemo(
    () => ({
      datasourceId: selectedDsId,
      datasourceName: selectedDs?.name || 'Map',
      geoField: useGeoMode ? geoField : undefined,
      latField: !useGeoMode ? latField : undefined,
      lngField: !useGeoMode ? lngField : undefined,
      markerTitle: markerTitle || undefined,
      zoom,
      mapHeight,
      onMarkerTap: 'callout' as const,
    }),
    [selectedDsId, selectedDs, useGeoMode, geoField, latField, lngField, markerTitle, zoom, mapHeight],
  );

  const screenDefinition = useMemo(
    () => (selectedDsId ? generateMapScreen(config) : { rootComponents: [], backgroundColor: '#0f172a' }),
    [config, selectedDsId],
  );

  const handleComplete = () => {
    onComplete({
      label: getMapLabel(selectedDs?.name || 'Map'),
      props: { screenDefinition },
    });
  };

  const canProceedStep1 = !!selectedDsId;
  const canProceedStep2 = useGeoMode ? !!geoField : !!(latField && lngField);

  return (
    <WizardShell
      title="Map Wizard"
      step={step}
      totalSteps={2}
      onCancel={onCancel}
      onBack={step > 1 ? () => setStep(step - 1) : undefined}
      onNext={
        step === 1 && canProceedStep1
          ? () => setStep(2)
          : step === 2 && canProceedStep2
            ? handleComplete
            : undefined
      }
      nextLabel={step === 2 ? 'Create Node' : 'Next'}
      nextDisabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
      preview={<WizardPhonePreview screenDefinition={screenDefinition} />}
    >
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Pick Datasource</h2>
            <p className="text-sm text-muted-foreground">
              Choose a datasource with location data for your map.
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
                const hasGeo = ds.fields.some((f) => f.type === 'geolocation');
                const hasNumbers = ds.fields.filter((f) => f.type === 'number').length >= 2;
                const compatible = hasGeo || hasNumbers;
                return (
                  <button
                    key={ds.id}
                    type="button"
                    onClick={() => compatible && setSelectedDsId(ds.id)}
                    disabled={!compatible}
                    className={`
                      w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                      ${selectedDsId === ds.id
                        ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/10'
                        : compatible
                          ? 'border-border/60 hover:border-indigo-400/40 bg-card cursor-pointer'
                          : 'border-border/30 bg-card/50 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedDsId === ds.id ? 'bg-indigo-500/15 text-indigo-400' : 'bg-muted text-muted-foreground'
                    }`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{ds.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {ds.fields.length} fields
                        {!compatible && ' — no location fields'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedDs && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Map Fields</h2>
            <p className="text-sm text-muted-foreground">
              Configure how location data is mapped to map markers.
            </p>
          </div>

          {useGeoMode ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Geolocation Field</Label>
              <Select value={geoField} onValueChange={setGeoField}>
                <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
                <SelectContent>
                  {geoFields.map((f) => (
                    <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Latitude Field</Label>
                <Select value={latField} onValueChange={setLatField}>
                  <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
                  <SelectContent>
                    {numberFields.map((f) => (
                      <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Longitude Field</Label>
                <Select value={lngField} onValueChange={setLngField}>
                  <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
                  <SelectContent>
                    {numberFields.map((f) => (
                      <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Marker Label Field (optional)</Label>
            <Select value={markerTitle || '_none'} onValueChange={(v) => setMarkerTitle(v === '_none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {textFields.map((f) => (
                  <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Zoom Level ({zoom})</Label>
            <input
              type="range"
              min={1}
              max={18}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Map Height ({mapHeight}px)</Label>
            <input
              type="range"
              min={150}
              max={400}
              step={10}
              value={mapHeight}
              onChange={(e) => setMapHeight(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      )}
    </WizardShell>
  );
}
