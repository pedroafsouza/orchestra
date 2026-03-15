import { useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '@/store/flowStore';
import { OrchestraNode } from '@/components/OrchestraNode';
import { Sidebar } from '@/components/Sidebar';
import { Toolbar } from '@/components/Toolbar';
import { ScreenBuilderModal } from '@/components/ScreenBuilder/ScreenBuilderModal';
import { useParams, useNavigate } from 'react-router-dom';

const nodeTypes = {
  orchestra: OrchestraNode,
};

export function FlowEditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);

  const [screenBuilderNodeId, setScreenBuilderNodeId] = useState<string | null>(null);

  const handleNodeDoubleClick = (_event: React.MouseEvent, node: any) => {
    setScreenBuilderNodeId(node.id);
  };

  return (
    <div className="h-screen flex flex-col bg-primary-950">
      <Toolbar
        projectId={projectId!}
        onBack={() => navigate(`/project/${projectId}`)}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onPaneClick={() => setSelectedNode(null)}
            onNodeDoubleClick={handleNodeDoubleClick}
            fitView
            className="bg-primary-950"
          >
            <Background
              variant={BackgroundVariant.Dots}
              color="#334155"
              gap={20}
            />
            <Controls className="!bg-primary-800 !border-primary-600 !text-white" />
            <MiniMap
              className="!bg-primary-800"
              nodeColor="#6366f1"
              maskColor="rgba(0, 0, 0, 0.4)"
            />
          </ReactFlow>
        </div>
        <Sidebar />
      </div>

      {screenBuilderNodeId && (
        <ScreenBuilderModal
          nodeId={screenBuilderNodeId}
          onClose={() => setScreenBuilderNodeId(null)}
        />
      )}
    </div>
  );
}
