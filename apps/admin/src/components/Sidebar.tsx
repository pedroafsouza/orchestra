import { useFlowStore, type OrchestraNodeData } from '@/store/flowStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NodePalette } from '@/components/flow/NodePalette';
import { PropsEditor } from '@/components/flow/PropsEditor';
import { ActionsEditor } from '@/components/flow/ActionsEditor';

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
