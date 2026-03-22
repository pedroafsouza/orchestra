import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ActionTrigger, ActionType } from '@orchestra/shared';
import { useFlowStore } from '@/store/flowStore';
import { useScreenStore } from '../screenStore';
import { api } from '@/lib/api';
import { Section } from './Section';
import { FieldRow } from './FieldRow';

const selectCls = 'h-8 w-full rounded-md border border-input bg-background px-2 text-xs';

/** Human-readable labels for action types */
const ACTION_TYPE_LABELS: Record<string, string> = {
  NAVIGATE: 'Navigate',
  SET_CONTEXT: 'Set Context',
  DATASOURCE_ADD: 'Add to Datasource',
  DATASOURCE_UPDATE: 'Update Datasource',
  GET_GEO: 'Get Location',
  API_CALL: 'API Call',
};

/** Human-readable labels for triggers */
const TRIGGER_LABELS: Record<string, string> = {
  onPress: 'On Press',
  onLoad: 'On Load',
  onValueChange: 'On Value Change',
  onMarkerPress: 'On Marker Press',
};

interface DatasourceMini {
  id: string;
  name: string;
  fields: { key: string; label: string; type: string }[];
}

interface InteractionSectionProps {
  selectedId: string;
  actions: any[];
  updateComponentActions: (id: string, actions: any[]) => void;
}

export function InteractionSection({ selectedId, actions, updateComponentActions }: InteractionSectionProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const flowNodes = useFlowStore((s) => s.nodes);
  const components = useScreenStore((s) => s.components);
  const [datasources, setDatasources] = useState<DatasourceMini[]>([]);

  // Fetch datasources for the project
  useEffect(() => {
    if (!projectId) return;
    api<DatasourceMini[]>(`/api/projects/${projectId}/datasources`)
      .then(setDatasources)
      .catch(() => {});
  }, [projectId]);

  // Collect all input component IDs in the current screen
  const inputComponents = collectInputComponents(components);

  const updateAction = (idx: number, updates: Record<string, any>) => {
    const newActions = [...actions];
    newActions[idx] = { ...newActions[idx], ...updates };
    updateComponentActions(selectedId, newActions);
  };

  const updatePayload = (idx: number, updates: Record<string, any>) => {
    const newActions = [...actions];
    const currentPayload = typeof newActions[idx].payload === 'object' ? newActions[idx].payload : {};
    newActions[idx] = { ...newActions[idx], payload: { ...currentPayload, ...updates } };
    updateComponentActions(selectedId, newActions);
  };

  return (
    <Section
      title="Interaction"
      actions={
        <button
          className="p-0.5 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            const newActions = [...actions];
            newActions.push({ trigger: 'onPress', type: 'NAVIGATE', payload: {} });
            updateComponentActions(selectedId, newActions);
          }}
          title="Add event handler"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      }
    >
      <FieldRow label="Event handlers">
        <span className="text-xs text-muted-foreground">
          {actions.length || 'None'}
        </span>
      </FieldRow>

      {actions.map((action: any, idx: number) => {
        const payload = typeof action.payload === 'object' ? action.payload : {};

        return (
          <div
            key={idx}
            className="mb-2 p-3 rounded-lg border border-border bg-secondary/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-muted-foreground">Handler #{idx + 1}</span>
              <button
                className="text-destructive hover:text-destructive/80"
                onClick={() => {
                  const newActions = [...actions];
                  newActions.splice(idx, 1);
                  updateComponentActions(selectedId, newActions);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Trigger */}
            <FieldRow label="Trigger">
              <select
                value={action.trigger || 'onPress'}
                onChange={(e) => updateAction(idx, { trigger: e.target.value })}
                className={selectCls}
              >
                {ActionTrigger.options.map((t) => (
                  <option key={t} value={t}>{TRIGGER_LABELS[t] || t}</option>
                ))}
              </select>
            </FieldRow>

            {/* Action Type */}
            <FieldRow label="Type">
              <select
                value={action.type || 'NAVIGATE'}
                onChange={(e) => {
                  // Reset payload when switching types
                  updateAction(idx, { type: e.target.value, payload: {} });
                }}
                className={selectCls}
              >
                {ActionType.options.map((t) => (
                  <option key={t} value={t}>{ACTION_TYPE_LABELS[t] || t}</option>
                ))}
              </select>
            </FieldRow>

            {/* Context-aware payload editor */}
            {action.type === 'NAVIGATE' && (
              <NavigatePayload
                payload={payload}
                flowNodes={flowNodes}
                onChange={(updates) => updatePayload(idx, updates)}
              />
            )}

            {action.type === 'SET_CONTEXT' && (
              <SetContextPayload
                payload={payload}
                onChange={(updates) => updatePayload(idx, updates)}
              />
            )}

            {action.type === 'DATASOURCE_ADD' && (
              <DatasourceAddPayload
                payload={payload}
                datasources={datasources}
                inputComponents={inputComponents}
                onChange={(updates) => updatePayload(idx, updates)}
              />
            )}

            {action.type === 'DATASOURCE_UPDATE' && (
              <DatasourceUpdatePayload
                payload={payload}
                datasources={datasources}
                onChange={(updates) => updatePayload(idx, updates)}
              />
            )}

            {(action.type === 'API_CALL' || action.type === 'GET_GEO') && (
              <FieldRow label="Payload">
                <Input
                  type="text"
                  value={typeof action.payload === 'string' ? action.payload : JSON.stringify(action.payload || {})}
                  onChange={(e) => {
                    const newActions = [...actions];
                    try {
                      newActions[idx] = { ...newActions[idx], payload: JSON.parse(e.target.value) };
                    } catch {
                      newActions[idx] = { ...newActions[idx], payload: e.target.value };
                    }
                    updateComponentActions(selectedId, newActions);
                  }}
                  className="h-8 px-2 text-xs"
                  placeholder="JSON payload"
                />
              </FieldRow>
            )}
          </div>
        );
      })}
    </Section>
  );
}

// ─── Payload Editors ──────────────────────────────────────────────────────────

function NavigatePayload({
  payload,
  flowNodes,
  onChange,
}: {
  payload: any;
  flowNodes: any[];
  onChange: (updates: Record<string, any>) => void;
}) {
  return (
    <FieldRow label="Target">
      <select
        value={payload.targetNodeId || ''}
        onChange={(e) => onChange({ targetNodeId: e.target.value })}
        className={selectCls}
      >
        <option value="">Select screen...</option>
        {flowNodes.map((n) => (
          <option key={n.id} value={n.id}>
            {(n.data as any).label} ({n.id})
          </option>
        ))}
      </select>
    </FieldRow>
  );
}

function SetContextPayload({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: Record<string, any>) => void;
}) {
  return (
    <>
      <FieldRow label="Key">
        <Input
          type="text"
          value={payload.key || ''}
          onChange={(e) => onChange({ key: e.target.value })}
          className="h-8 px-2 text-xs"
          placeholder="e.g. selectedOption"
        />
      </FieldRow>
      <FieldRow label="Value">
        <Input
          type="text"
          value={payload.value ?? ''}
          onChange={(e) => {
            // Try to parse as number/boolean, otherwise keep as string
            const raw = e.target.value;
            let parsed: any = raw;
            if (raw === 'true') parsed = true;
            else if (raw === 'false') parsed = false;
            else if (!isNaN(Number(raw)) && raw !== '') parsed = Number(raw);
            onChange({ value: parsed });
          }}
          className="h-8 px-2 text-xs"
          placeholder="e.g. A"
        />
      </FieldRow>
    </>
  );
}

function DatasourceAddPayload({
  payload,
  datasources,
  inputComponents,
  onChange,
}: {
  payload: any;
  datasources: DatasourceMini[];
  inputComponents: { id: string; label: string }[];
  onChange: (updates: Record<string, any>) => void;
}) {
  const selectedDs = datasources.find((ds) => ds.id === payload.datasourceId);
  const fieldMap: Record<string, string> = payload.fieldMap || {};

  return (
    <>
      {/* Datasource selector */}
      <FieldRow label="Datasource">
        <select
          value={payload.datasourceId || ''}
          onChange={(e) => onChange({ datasourceId: e.target.value, fieldMap: {} })}
          className={selectCls}
        >
          <option value="">Select datasource...</option>
          {datasources.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name}
            </option>
          ))}
        </select>
      </FieldRow>

      {/* Field mapping */}
      {selectedDs && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            Field Mapping
          </p>
          <p className="text-[10px] text-muted-foreground mb-2">
            Map each datasource field to an input component on this screen.
          </p>
          {selectedDs.fields.map((field) => (
            <FieldRow key={field.key} label={field.label || field.key}>
              <select
                value={fieldMap[field.key] || ''}
                onChange={(e) => {
                  const newMap = { ...fieldMap };
                  if (e.target.value) {
                    newMap[field.key] = e.target.value;
                  } else {
                    delete newMap[field.key];
                  }
                  onChange({ fieldMap: newMap });
                }}
                className={selectCls}
              >
                <option value="">Not mapped</option>
                {inputComponents.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.label} ({comp.id})
                  </option>
                ))}
              </select>
            </FieldRow>
          ))}
        </div>
      )}
    </>
  );
}

function DatasourceUpdatePayload({
  payload,
  datasources,
  onChange,
}: {
  payload: any;
  datasources: DatasourceMini[];
  onChange: (updates: Record<string, any>) => void;
}) {
  const selectedDs = datasources.find((ds) => ds.id === payload.datasourceId);

  return (
    <>
      <FieldRow label="Datasource">
        <select
          value={payload.datasourceId || ''}
          onChange={(e) => onChange({ datasourceId: e.target.value, field: '' })}
          className={selectCls}
        >
          <option value="">Select datasource...</option>
          {datasources.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name}
            </option>
          ))}
        </select>
      </FieldRow>
      {selectedDs && (
        <FieldRow label="Field">
          <select
            value={payload.field || ''}
            onChange={(e) => onChange({ field: e.target.value })}
            className={selectCls}
          >
            <option value="">Select field...</option>
            {selectedDs.fields.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label || f.key}
              </option>
            ))}
          </select>
        </FieldRow>
      )}
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Recursively collect all input-like components for field mapping */
function collectInputComponents(
  components: any[],
  result: { id: string; label: string }[] = [],
): { id: string; label: string }[] {
  for (const comp of components) {
    if (comp.type === 'input' || comp.type === 'checkbox') {
      const label = comp.props?.placeholder || comp.props?.label || comp.type;
      result.push({ id: comp.id, label });
    }
    if (comp.children) {
      collectInputComponents(comp.children, result);
    }
  }
  return result;
}
