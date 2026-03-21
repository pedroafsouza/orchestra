import { useFlowStore, type OrchestraNodeData } from '@/store/flowStore';
import type { NodeType, OrchestraAction, ActionTrigger, ActionType } from '@orchestra/shared';
import { Home, List, FileText, Map, Images, GitBranch, LayoutList, Plus, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const NODE_TYPES: { type: NodeType; label: string; icon: LucideIcon }[] = [
  { type: 'landing', label: 'Landing', icon: Home },
  { type: 'list', label: 'List', icon: List },
  { type: 'form', label: 'Form', icon: FileText },
  { type: 'map', label: 'Map', icon: Map },
  { type: 'photo_gallery', label: 'Gallery', icon: Images },
  { type: 'decision', label: 'Decision', icon: GitBranch },
  { type: 'detail', label: 'Detail', icon: LayoutList },
];

const TRIGGERS: ActionTrigger[] = ['onLoad', 'onPress', 'onValueChange'];
const ACTION_TYPES: ActionType[] = ['NAVIGATE', 'SET_CONTEXT', 'GET_GEO', 'API_CALL'];

function NodePalette() {
  const addNode = useFlowStore((s) => s.addNode);

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Add Node
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {NODE_TYPES.map(({ type, label, icon: Icon }) => (
          <Button
            key={type}
            variant="secondary"
            size="sm"
            className="justify-start gap-2 text-xs font-medium"
            onClick={() => addNode(type, { x: 0, y: 0 })}
          >
            <Icon className="w-3.5 h-3.5 opacity-60" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function PropsEditor({
  nodeId,
  data,
}: {
  nodeId: string;
  data: OrchestraNodeData;
}) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  const handleLabelChange = (label: string) => {
    updateNodeData(nodeId, { label });
  };

  const handlePropChange = (key: string, value: string) => {
    updateNodeData(nodeId, {
      props: { ...data.props, [key]: value },
    });
  };

  const handleAddProp = () => {
    const key = prompt('Property name:');
    if (key) handlePropChange(key, '');
  };

  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Properties
      </h3>
      <div className="space-y-2">
        <div>
          <Label className="text-xs text-muted-foreground">Label</Label>
          <Input
            className="h-8 text-sm"
            value={data.label}
            onChange={(e) => handleLabelChange(e.target.value)}
          />
        </div>
        {Object.entries(data.props).map(([key, value]) => (
          <div key={key}>
            <Label className="text-xs text-muted-foreground">{key}</Label>
            <Input
              className="h-8 text-sm"
              value={String(value)}
              onChange={(e) => handlePropChange(key, e.target.value)}
            />
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-primary hover:text-primary/80 p-0 h-auto"
          onClick={handleAddProp}
        >
          <Plus className="w-2.5 h-2.5" />
          Add Property
        </Button>
      </div>
    </div>
  );
}

function ActionsEditor({
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

export function Sidebar() {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const nodes = useFlowStore((s) => s.nodes);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <ScrollArea className="w-72 border-l border-border bg-card text-foreground">
      <div className="p-4">
        <NodePalette />

        {selectedNode ? (
          <>
            <Separator className="mb-4" />
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground mb-1">
                Editing: {selectedNode.data.label}
              </h2>
              <p className="text-xs text-muted-foreground">ID: {selectedNode.id}</p>
            </div>
            <PropsEditor
              nodeId={selectedNode.id}
              data={selectedNode.data as unknown as OrchestraNodeData}
            />
            <ActionsEditor
              nodeId={selectedNode.id}
              data={selectedNode.data as unknown as OrchestraNodeData}
            />
          </>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Select a node to edit its properties and actions.
          </p>
        )}
      </div>
    </ScrollArea>
  );
}
