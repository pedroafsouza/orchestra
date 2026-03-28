import { useFlowStore, type OrchestraNodeData } from '../store/flowStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { NodePalette } from './NodePalette';
import { PropsEditor } from './PropsEditor';
import { ActionsEditor } from './ActionsEditor';
import { DecisionEditor } from './DecisionEditor';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

function CollapsedSidebar({ onExpand }: { onExpand: () => void }) {
  return (
    <div className="w-10 border-l border-border bg-card flex flex-col items-center">
      <Button
        variant="ghost"
        size="sm"
        className="h-10 w-10 p-0 rounded-none border-b border-border text-muted-foreground hover:text-foreground"
        onClick={onExpand}
        title="Expand panel"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-[9px] text-muted-foreground mt-4 [writing-mode:vertical-lr] rotate-180 select-none">
        Nodes Panel
      </span>
    </div>
  );
}

function SidebarHeader({ onCollapse }: { onCollapse: () => void }) {
  return (
    <div className="h-10 flex items-center justify-between px-3 border-b border-border shrink-0">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Nodes
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        onClick={onCollapse}
        title="Collapse panel"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function NodeEditor({
  nodeId,
  data,
}: {
  nodeId: string;
  data: OrchestraNodeData;
}) {
  return (
    <>
      <Separator className="mb-4" />
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">
          {data.label}
        </h2>
        <p className="text-[10px] text-muted-foreground capitalize">
          {data.nodeType?.replace('_', ' ')} node
        </p>
      </div>
      <PropsEditor nodeId={nodeId} data={data} />
      {data.nodeType === 'decision' && (
        <DecisionEditor nodeId={nodeId} data={data} />
      )}
      <ActionsEditor nodeId={nodeId} data={data} />
    </>
  );
}

export function Sidebar() {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const nodes = useFlowStore((s) => s.nodes);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const [collapsed, setCollapsed] = useState(false);

  const nodeData = selectedNode
    ? (selectedNode.data as unknown as OrchestraNodeData)
    : null;

  if (collapsed) {
    return <CollapsedSidebar onExpand={() => setCollapsed(false)} />;
  }

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col">
      <SidebarHeader onCollapse={() => setCollapsed(true)} />

      <ScrollArea className="flex-1">
        <div className="p-4">
          <NodePalette />

          {selectedNode && nodeData ? (
            <NodeEditor nodeId={selectedNode.id} data={nodeData} />
          ) : (
            <p className="text-xs text-muted-foreground italic mt-2">
              Select a node to edit its properties and actions.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
