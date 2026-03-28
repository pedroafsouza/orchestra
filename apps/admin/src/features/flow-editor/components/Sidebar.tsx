import { useFlowStore, type OrchestraNodeData } from '../store/flowStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { NodePalette } from './NodePalette';
import { PropsEditor } from './PropsEditor';
import { ActionsEditor } from './ActionsEditor';
import { DecisionEditor } from './DecisionEditor';
import { ChevronRight, ChevronLeft, Trash2, AlertTriangle } from 'lucide-react';
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
  const deleteNode = useFlowStore((s) => s.deleteNode);

  return (
    <>
      <Separator className="mb-4" />
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {data.label}
          </h2>
          <p className="text-[10px] text-muted-foreground capitalize">
            {data.nodeType?.replace('_', ' ')} node
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Delete node"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogHeader>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-center">
                Delete &ldquo;{data.label}&rdquo;?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                This will permanently remove this screen and all connected
                edges. Any navigation references to this node will be cleared.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center gap-2">
              <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteNode(nodeId)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
