import { useFlowStore, type OrchestraNodeData } from '../store/flowStore';
import type { OrchestraAction, ActionTrigger, ActionType } from '@orchestra/shared';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TRIGGERS: ActionTrigger[] = ['onLoad', 'onPress', 'onValueChange'];
const ACTION_TYPES: ActionType[] = ['NAVIGATE', 'SET_CONTEXT', 'DATASOURCE_ADD', 'DATASOURCE_UPDATE', 'GET_GEO', 'API_CALL'];

export function ActionsEditor({
  nodeId,
  data,
}: {
  nodeId: string;
  data: OrchestraNodeData;
}) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  const addAction = () => {
    const newAction: OrchestraAction = {
      trigger: 'onPress',
      type: 'NAVIGATE',
      payload: {},
    };
    updateNodeData(nodeId, {
      actions: [...data.actions, newAction],
    });
  };

  const updateAction = (index: number, partial: Partial<OrchestraAction>) => {
    const updated = data.actions.map((a, i) =>
      i === index ? { ...a, ...partial } : a
    );
    updateNodeData(nodeId, { actions: updated });
  };

  const removeAction = (index: number) => {
    updateNodeData(nodeId, {
      actions: data.actions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Actions
      </h3>
      <div className="space-y-3">
        {data.actions.map((action, i) => (
          <div
            key={i}
            className="p-2.5 rounded-lg border border-border bg-muted/50 space-y-1.5"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Action {i + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-destructive hover:text-destructive/80"
                onClick={() => removeAction(i)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <select
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
              value={action.trigger}
              onChange={(e) =>
                updateAction(i, { trigger: e.target.value as ActionTrigger })
              }
            >
              {TRIGGERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
              value={action.type}
              onChange={(e) =>
                updateAction(i, { type: e.target.value as ActionType })
              }
            >
              {ACTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <Input
              className="h-8 text-xs"
              placeholder="Payload (JSON)"
              value={
                typeof action.payload === 'string'
                  ? action.payload
                  : JSON.stringify(action.payload)
              }
              onChange={(e) => {
                try {
                  updateAction(i, { payload: JSON.parse(e.target.value) });
                } catch {
                  updateAction(i, { payload: e.target.value });
                }
              }}
            />
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-primary hover:text-primary/80 p-0 h-auto"
          onClick={addAction}
        >
          <Plus className="w-2.5 h-2.5" />
          Add Action
        </Button>
      </div>
    </div>
  );
}
