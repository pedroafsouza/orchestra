import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faList,
  faFileLines,
  faMapLocationDot,
  faImages,
  faCodeBranch,
  faCube,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { OrchestraNodeData } from '@/store/flowStore';
import { useFlowStore } from '@/store/flowStore';
import type { ScreenComponent } from '@orchestra/shared';

const NODE_STYLES: Record<string, { bg: string; accent: string; iconBg: string; icon: IconDefinition }> = {
  landing: {
    bg: 'bg-white dark:bg-slate-800',
    accent: 'bg-indigo-500',
    iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    icon: faHome,
  },
  list: {
    bg: 'bg-white dark:bg-slate-800',
    accent: 'bg-emerald-500',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    icon: faList,
  },
  form: {
    bg: 'bg-white dark:bg-slate-800',
    accent: 'bg-amber-500',
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    icon: faFileLines,
  },
  map: {
    bg: 'bg-white dark:bg-slate-800',
    accent: 'bg-sky-500',
    iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
    icon: faMapLocationDot,
  },
  photo_gallery: {
    bg: 'bg-white dark:bg-slate-800',
    accent: 'bg-rose-500',
    iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
    icon: faImages,
  },
  decision: {
    bg: 'bg-white dark:bg-slate-800',
    accent: 'bg-violet-500',
    iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400',
    icon: faCodeBranch,
  },
};

const DEFAULT_STYLE = {
  bg: 'bg-white dark:bg-slate-800',
  accent: 'bg-gray-500',
  iconBg: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
  icon: faCube,
};

/** Extract button labels with navigateTo from screen definition */
function getButtonLinks(nodeData: OrchestraNodeData): string[] {
  const screenDef = nodeData.props?.screenDefinition;
  if (!screenDef?.rootComponents) return [];
  const links: string[] = [];
  function walk(comps: ScreenComponent[]) {
    for (const c of comps) {
      if (c.type === 'button' && c.props.navigateTo) {
        links.push(c.props.label || 'Button');
      }
      if (c.children) walk(c.children);
    }
  }
  walk(screenDef.rootComponents);
  return links;
}

export function OrchestraNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as OrchestraNodeData;
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const isSelected = selectedNodeId === id;

  const style = NODE_STYLES[nodeData.nodeType] || DEFAULT_STYLE;
  const buttonLinks = getButtonLinks(nodeData);

  return (
    <div
      className={`
        relative rounded-xl min-w-[180px] max-w-[220px] overflow-hidden cursor-pointer
        border border-gray-200 dark:border-slate-600/50
        shadow-sm hover:shadow-lg
        transition-all duration-200
        ${style.bg}
        ${isSelected ? 'ring-2 ring-accent-500 shadow-lg scale-[1.02]' : ''}
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* Top accent bar */}
      <div className={`h-1 ${style.accent}`} />

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-400 dark:!bg-slate-500 !border-2 !border-white dark:!border-slate-800 !-top-1.5"
      />

      <div className="px-4 py-3 flex items-center gap-3">
        {/* Icon circle */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
          <FontAwesomeIcon icon={style.icon} className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            {nodeData.nodeType.replace('_', ' ')}
          </div>
          <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
            {nodeData.label}
          </div>
        </div>
      </div>

      {/* Button links */}
      {buttonLinks.length > 0 && (
        <div className="px-4 pb-1 space-y-1">
          {buttonLinks.map((label, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px] text-accent-600 dark:text-accent-400">
              <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5" />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom info bar */}
      <div className="px-4 pb-2.5 pt-1 flex items-center gap-2">
        <span className="text-[10px] text-gray-400 dark:text-slate-500">
          {nodeData.actions.length > 0 ? `${nodeData.actions.length} action${nodeData.actions.length > 1 ? 's' : ''}` : 'No actions'}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-gray-400 dark:!bg-slate-500 !border-2 !border-white dark:!border-slate-800 !-bottom-1.5"
      />
    </div>
  );
}
