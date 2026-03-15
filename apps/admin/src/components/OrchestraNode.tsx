import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { OrchestraNodeData } from '@/store/flowStore';
import { useFlowStore } from '@/store/flowStore';

const NODE_COLORS: Record<string, string> = {
  landing: 'bg-indigo-100 border-indigo-400',
  list: 'bg-emerald-100 border-emerald-400',
  form: 'bg-amber-100 border-amber-400',
  map: 'bg-sky-100 border-sky-400',
  photo_gallery: 'bg-rose-100 border-rose-400',
  decision: 'bg-violet-100 border-violet-400',
};

const NODE_ICONS: Record<string, string> = {
  landing: '\u{1F3E0}',
  list: '\u{1F4CB}',
  form: '\u{1F4DD}',
  map: '\u{1F5FA}',
  photo_gallery: '\u{1F4F7}',
  decision: '\u{1F500}',
};

export function OrchestraNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as OrchestraNodeData;
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const isSelected = selectedNodeId === id;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-sm min-w-[160px] cursor-pointer transition-shadow
        ${NODE_COLORS[nodeData.nodeType] || 'bg-gray-100 border-gray-400'}
        ${isSelected ? 'ring-2 ring-accent-500 shadow-md' : ''}
      `}
      onClick={() => setSelectedNode(id)}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary-600" />
      <div className="flex items-center gap-2">
        <span className="text-lg">{NODE_ICONS[nodeData.nodeType] || '\u{2B1B}'}</span>
        <div>
          <div className="text-xs font-semibold uppercase text-primary-500 tracking-wide">
            {nodeData.nodeType}
          </div>
          <div className="text-sm font-medium text-primary-800">
            {nodeData.label}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary-600" />
    </div>
  );
}
