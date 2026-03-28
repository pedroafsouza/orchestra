import { Panel } from '@xyflow/react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowLeft,
  Grid3X3,
} from 'lucide-react';
import type { LayoutDirection } from '../store/flowStore';

interface LayoutToolbarProps {
  onAutoLayout: (direction: LayoutDirection) => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
}

const LAYOUT_BUTTONS: { direction: LayoutDirection; icon: typeof ArrowDown; label: string }[] = [
  { direction: 'TB', icon: ArrowDown, label: 'Layout: Top to Bottom' },
  { direction: 'BT', icon: ArrowUp, label: 'Layout: Bottom to Top' },
  { direction: 'LR', icon: ArrowRight, label: 'Layout: Left to Right' },
  { direction: 'RL', icon: ArrowLeft, label: 'Layout: Right to Left' },
];

export function LayoutToolbar({ onAutoLayout, snapToGrid, onToggleSnap }: LayoutToolbarProps) {
  return (
    <Panel position="top-left" className="flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-1 shadow-sm">
      {LAYOUT_BUTTONS.map(({ direction, icon: Icon, label }) => (
        <button
          key={direction}
          onClick={() => onAutoLayout(direction)}
          title={label}
          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
      <div className="w-px h-5 bg-border mx-0.5" />
      <button
        onClick={onToggleSnap}
        title={snapToGrid ? 'Disable snap to grid' : 'Enable snap to grid'}
        className={`p-1.5 rounded transition-colors ${
          snapToGrid
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
    </Panel>
  );
}
