import { useFlowStore, type OrchestraNodeData } from '@/store/flowStore';
import type { NodeType, OrchestraAction, ActionTrigger, ActionType } from '@orchestra/shared';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faList,
  faFileLines,
  faMapLocationDot,
  faImages,
  faCodeBranch,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const NODE_TYPES: { type: NodeType; label: string; icon: IconDefinition }[] = [
  { type: 'landing', label: 'Landing', icon: faHome },
  { type: 'list', label: 'List', icon: faList },
  { type: 'form', label: 'Form', icon: faFileLines },
  { type: 'map', label: 'Map', icon: faMapLocationDot },
  { type: 'photo_gallery', label: 'Gallery', icon: faImages },
  { type: 'decision', label: 'Decision', icon: faCodeBranch },
];

const TRIGGERS: ActionTrigger[] = ['onLoad', 'onPress', 'onValueChange'];
const ACTION_TYPES: ActionType[] = ['NAVIGATE', 'SET_CONTEXT', 'GET_GEO', 'API_CALL'];

function NodePalette() {
  const addNode = useFlowStore((s) => s.addNode);

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400 mb-2">
        Add Node
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {NODE_TYPES.map(({ type, label, icon }) => (
          <button
            key={type}
            className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-lg
              bg-primary-100 hover:bg-primary-200 text-primary-700
              dark:bg-primary-700 dark:hover:bg-primary-600 dark:text-white
              transition-colors"
            onClick={() =>
              addNode(type, {
                x: 250 + Math.random() * 200,
                y: 150 + Math.random() * 200,
              })
            }
          >
            <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5 opacity-60" />
            {label}
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
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400 mb-2">
        Properties
      </h3>
      <div className="space-y-2">
        <div>
          <label className="text-xs text-primary-500 dark:text-primary-400">Label</label>
          <input
            className="w-full px-2 py-1.5 text-sm rounded-lg border
              bg-white border-primary-300 text-primary-800
              dark:bg-primary-700 dark:border-primary-600 dark:text-white
              focus:outline-none focus:ring-1 focus:ring-accent-500"
            value={data.label}
            onChange={(e) => handleLabelChange(e.target.value)}
          />
        </div>
        {Object.entries(data.props).map(([key, value]) => (
          <div key={key}>
            <label className="text-xs text-primary-500 dark:text-primary-400">{key}</label>
            <input
              className="w-full px-2 py-1.5 text-sm rounded-lg border
                bg-white border-primary-300 text-primary-800
                dark:bg-primary-700 dark:border-primary-600 dark:text-white
                focus:outline-none focus:ring-1 focus:ring-accent-500"
              value={String(value)}
              onChange={(e) => handlePropChange(key, e.target.value)}
            />
          </div>
        ))}
        <button
          className="flex items-center gap-1 text-xs text-accent-600 dark:text-accent-400 hover:text-accent-500 dark:hover:text-accent-300"
          onClick={handleAddProp}
        >
          <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
          Add Property
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
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400 mb-2">
        Actions
      </h3>
      <div className="space-y-3">
        {data.actions.map((action, i) => (
          <div
            key={i}
            className="p-2.5 rounded-lg border space-y-1.5
              bg-primary-50 border-primary-200
              dark:bg-primary-700 dark:border-primary-600"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs text-primary-500 dark:text-primary-300">Action {i + 1}</span>
              <button
                className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                onClick={() => removeAction(i)}
              >
                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
              </button>
            </div>
            <select
              className="w-full px-2 py-1 text-xs rounded-lg border
                bg-white border-primary-300 text-primary-800
                dark:bg-primary-800 dark:border-primary-600 dark:text-white"
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
              className="w-full px-2 py-1 text-xs rounded-lg border
                bg-white border-primary-300 text-primary-800
                dark:bg-primary-800 dark:border-primary-600 dark:text-white"
              value={action.type}
              onChange={(e) =>
                updateAction(i, { type: e.target.value as ActionType })
              }
            >
              {ACTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              className="w-full px-2 py-1 text-xs rounded-lg border
                bg-white border-primary-300 text-primary-800
                dark:bg-primary-800 dark:border-primary-600 dark:text-white"
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
          className="flex items-center gap-1 text-xs text-accent-600 dark:text-accent-400 hover:text-accent-500 dark:hover:text-accent-300"
          onClick={addAction}
        >
          <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
          Add Action
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
    <aside className="w-72 p-4 overflow-y-auto border-l
      bg-white border-primary-200 text-primary-800
      dark:bg-primary-800 dark:border-primary-700 dark:text-white">
      <NodePalette />

      {selectedNode ? (
        <>
          <div className="border-t border-primary-200 dark:border-primary-600 pt-4 mb-4">
            <h2 className="text-sm font-semibold mb-1">
              Editing: {selectedNode.data.label}
            </h2>
            <p className="text-xs text-primary-500 dark:text-primary-400">ID: {selectedNode.id}</p>
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
        <p className="text-xs text-primary-500 dark:text-primary-400 italic">
          Select a node to edit its properties and actions.
        </p>
      )}
    </aside>
  );
}
