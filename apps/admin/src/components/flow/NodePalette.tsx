import { useFlowStore } from '@/store/flowStore';
import type { NodeType } from '@orchestra/shared';
import { Home, List, FileText, Map, Images, GitBranch, LayoutList } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NODE_TYPES: { type: NodeType; label: string; icon: LucideIcon }[] = [
  { type: 'landing', label: 'Landing', icon: Home },
  { type: 'list', label: 'List', icon: List },
  { type: 'form', label: 'Form', icon: FileText },
  { type: 'map', label: 'Map', icon: Map },
  { type: 'photo_gallery', label: 'Gallery', icon: Images },
  { type: 'decision', label: 'Decision', icon: GitBranch },
  { type: 'detail', label: 'Detail', icon: LayoutList },
];

export function NodePalette() {
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
