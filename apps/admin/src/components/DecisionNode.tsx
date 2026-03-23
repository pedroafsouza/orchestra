import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import type { OrchestraNodeData } from '@/store/flowStore';
import { useFlowStore } from '@/store/flowStore';

/** Condition handle colors for visual distinction */
const HANDLE_COLORS = [
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export function getConditionColor(index: number): string {
  return HANDLE_COLORS[index % HANDLE_COLORS.length];
}

export function DecisionNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as OrchestraNodeData;
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const isSelected = selectedNodeId === id;

  const conditions: { label: string; expression: string }[] =
    nodeData.props?.conditions || [];

  // Diamond dimensions
  const size = 120;
  const half = size / 2;

  return (
    <div
      className="relative cursor-pointer"
      style={{ width: '100%', height: '100%', minWidth: size, minHeight: size }}
      onClick={() => setSelectedNode(id)}
    >
      <NodeResizer
        isVisible={isSelected}
        minWidth={100}
        minHeight={100}
        keepAspectRatio
        lineClassName="!border-violet-400/40"
        handleClassName="!w-2 !h-2 !bg-violet-400 !border-2 !border-white dark:!border-slate-800 !rounded-sm"
      />

      {/* Target handle at the top of the diamond */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-violet-400 !border-2 !border-white dark:!border-slate-800 !-top-1.5"
        style={{ left: '50%' }}
      />

      {/* Diamond shape via rotated square */}
      <div
        className={`
          absolute inset-0 flex items-center justify-center
          transition-shadow duration-200
        `}
      >
        {/* Rotated diamond background */}
        <div
          className={`
            absolute rounded-xl
            bg-gradient-to-br from-violet-500 to-purple-600
            dark:from-violet-600 dark:to-purple-800
            shadow-lg
            ${isSelected ? 'ring-2 ring-violet-300 dark:ring-violet-400 shadow-violet-500/30' : 'shadow-violet-500/10'}
          `}
          style={{
            width: size * 0.72,
            height: size * 0.72,
            transform: 'rotate(45deg)',
            top: '50%',
            left: '50%',
            marginTop: -(size * 0.72) / 2,
            marginLeft: -(size * 0.72) / 2,
            position: 'absolute',
          }}
        />

        {/* Content (not rotated) */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <GitBranch className="w-5 h-5 text-white drop-shadow" />
          <span className="text-[10px] font-bold text-white drop-shadow truncate max-w-[80px] text-center leading-tight">
            {nodeData.label}
          </span>
        </div>
      </div>

      {/* Condition output handles — spread along the bottom and sides */}
      {conditions.length === 0 && (
        /* Default single bottom handle when no conditions yet */
        <Handle
          type="source"
          position={Position.Bottom}
          id="default"
          className="!w-3 !h-3 !bg-violet-400 !border-2 !border-white dark:!border-slate-800 !-bottom-1.5"
          style={{ left: '50%' }}
        />
      )}

      {conditions.length > 0 && conditions.map((cond, i) => {
        const pos = getHandlePosition(i, conditions.length, half);
        return (
          <Handle
            key={`cond-${i}`}
            type="source"
            position={pos.position}
            id={`condition-${i}`}
            className="!w-3.5 !h-3.5 !border-2 !border-white dark:!border-slate-800"
            style={{
              backgroundColor: HANDLE_COLORS[i % HANDLE_COLORS.length],
              ...pos.style,
            }}
          />
        );
      })}

      {/* Condition labels rendered as small tags near each handle */}
      {conditions.length > 0 && conditions.map((cond, i) => {
        const tag = getTagPosition(i, conditions.length, size);
        return (
          <div
            key={`tag-${i}`}
            className="absolute pointer-events-none whitespace-nowrap"
            style={tag}
          >
            <span
              className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full text-white shadow-sm"
              style={{ backgroundColor: HANDLE_COLORS[i % HANDLE_COLORS.length] }}
            >
              {cond.label || `Option ${i + 1}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Compute handle placement around the diamond for N conditions.
 * Distributes handles: bottom, right, left, then additional positions.
 */
function getHandlePosition(
  index: number,
  total: number,
  half: number,
): { position: Position; style: React.CSSProperties } {
  // For 2 conditions: left and right
  // For 3: left, bottom, right
  // For 4+: left, bottom-left, bottom-right, right, etc.
  if (total === 1) {
    return { position: Position.Bottom, style: { left: '50%', bottom: -6 } };
  }
  if (total === 2) {
    if (index === 0) return { position: Position.Left, style: { left: -6, top: '50%' } };
    return { position: Position.Right, style: { right: -6, left: 'auto', top: '50%' } };
  }
  if (total === 3) {
    if (index === 0) return { position: Position.Left, style: { left: -6, top: '50%' } };
    if (index === 1) return { position: Position.Bottom, style: { left: '50%', bottom: -6 } };
    return { position: Position.Right, style: { right: -6, left: 'auto', top: '50%' } };
  }
  // 4+ conditions: spread evenly on bottom-left, bottom, bottom-right, right, left
  const positions = [
    { position: Position.Left, style: { left: -6, top: '50%' } },
    { position: Position.Bottom, style: { left: '30%', bottom: -6 } },
    { position: Position.Bottom, style: { left: '70%', bottom: -6 } },
    { position: Position.Right, style: { right: -6, left: 'auto', top: '50%' } },
    { position: Position.Bottom, style: { left: '50%', bottom: -6 } },
    { position: Position.Left, style: { left: -6, top: '70%' } },
  ];
  return positions[index % positions.length] as any;
}

/** Tag label position offset — placed outside the diamond near each handle */
function getTagPosition(
  index: number,
  total: number,
  size: number,
): React.CSSProperties {
  if (total === 1) {
    return { left: '50%', bottom: -20, transform: 'translateX(-50%)' };
  }
  if (total === 2) {
    if (index === 0) return { left: -8, top: '50%', transform: 'translate(-100%, -50%)' };
    return { right: -8, top: '50%', transform: 'translate(100%, -50%)' };
  }
  if (total === 3) {
    if (index === 0) return { left: -8, top: '50%', transform: 'translate(-100%, -50%)' };
    if (index === 1) return { left: '50%', bottom: -20, transform: 'translateX(-50%)' };
    return { right: -8, top: '50%', transform: 'translate(100%, -50%)' };
  }
  const tagPositions: React.CSSProperties[] = [
    { left: -8, top: '50%', transform: 'translate(-100%, -50%)' },
    { left: '30%', bottom: -20, transform: 'translateX(-50%)' },
    { left: '70%', bottom: -20, transform: 'translateX(-50%)' },
    { right: -8, top: '50%', transform: 'translate(100%, -50%)' },
    { left: '50%', bottom: -20, transform: 'translateX(-50%)' },
    { left: -8, top: '70%', transform: 'translate(-100%, -50%)' },
  ];
  return tagPositions[index % tagPositions.length];
}
