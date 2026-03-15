import { useFlowStore, type OrchestraNodeData } from '@/store/flowStore';
import type { NodeType, OrchestraAction, ActionTrigger, ActionType } from '@orchestra/shared';

const NODE_TYPES: NodeType[] = [
  'landing',
  'list',
  'form',
  'map',
  'photo_gallery',
  'decision',
];

const TRIGGERS: ActionTrigger[] = ['onLoad', 'onPress', 'onValueChange'];
const ACTION_TYPES: ActionType[] = ['NAVIGATE', 'SET_CONTEXT', 'GET_GEO', 'API_CALL'];

function NodePalette() {
  const addNode = useFlowStore((s) => s.addNode);

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-2">
        Add Node
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {NODE_TYPES.map((type) => (
          <button
            key={type}
            className="px-3 py-2 text-xs font-medium rounded-md bg-primary-700 hover:bg-primary-600 text-white transition-colors capitalize"
            onClick={() =>
              addNode(type, {
                x: 250 + Math.random() * 200,
                y: 150 + Math.random() * 200,
              })
            }
          >
            {type.replace('_', ' ')}
          </button>
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
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-2">
        Properties
      </h3>
      <div className="space-y-2">
        <div>
          <label className="text-xs text-primary-400">Label</label>
          <input
            className="w-full px-2 py-1 text-sm bg-primary-700 rounded border border-primary-600 text-white"
            value={data.label}
            onChange={(e) => handleLabelChange(e.target.value)}
          />
        </div>
        {Object.entries(data.props).map(([key, value]) => (
          <div key={key}>
            <label className="text-xs text-primary-400">{key}</label>
            <input
              className="w-full px-2 py-1 text-sm bg-primary-700 rounded border border-primary-600 text-white"
              value={String(value)}
              onChange={(e) => handlePropChange(key, e.target.value)}
            />
          </div>
        ))}
        <button
          className="text-xs text-accent-400 hover:text-accent-300"
          onClick={handleAddProp}
        >
          + Add Property
        </button>
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
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-2">
        Actions
      </h3>
      <div className="space-y-3">
        {data.actions.map((action, i) => (
          <div
            key={i}
            className="p-2 bg-primary-700 rounded border border-primary-600 space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs text-primary-300">Action {i + 1}</span>
              <button
                className="text-xs text-red-400 hover:text-red-300"
                onClick={() => removeAction(i)}
              >
                Remove
              </button>
            </div>
            <select
              className="w-full px-2 py-1 text-xs bg-primary-800 rounded text-white"
              value={action.trigger}
              onChange={(e) =>
                updateAction(i, { trigger: e.target.value as ActionTrigger })
              }
            >
              {TRIGGERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className="w-full px-2 py-1 text-xs bg-primary-800 rounded text-white"
              value={action.type}
              onChange={(e) =>
                updateAction(i, { type: e.target.value as ActionType })
              }
            >
              {ACTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              className="w-full px-2 py-1 text-xs bg-primary-800 rounded text-white"
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
        <button
          className="text-xs text-accent-400 hover:text-accent-300"
          onClick={addAction}
        >
          + Add Action
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const nodes = useFlowStore((s) => s.nodes);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <aside className="w-72 bg-primary-800 text-white p-4 overflow-y-auto border-l border-primary-700">
      <NodePalette />

      {selectedNode ? (
        <>
          <div className="border-t border-primary-600 pt-4 mb-4">
            <h2 className="text-sm font-semibold text-white mb-1">
              Editing: {selectedNode.data.label}
            </h2>
            <p className="text-xs text-primary-400">ID: {selectedNode.id}</p>
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
        <p className="text-xs text-primary-400 italic">
          Select a node to edit its properties and actions.
        </p>
      )}
    </aside>
  );
}
