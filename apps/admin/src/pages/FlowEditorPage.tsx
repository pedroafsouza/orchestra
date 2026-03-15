import { useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
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
  const theme = useThemeStore((s) => s.theme);
  const loadDiagram = useFlowStore((s) => s.loadDiagram);
  const loaded = useFlowStore((s) => s.loaded);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);

  const [screenBuilderNodeId, setScreenBuilderNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) loadDiagram(projectId);
  }, [projectId]);

  const handleNodeDoubleClick = (_event: React.MouseEvent, node: any) => {
    setScreenBuilderNodeId(node.id);
  };

  const isDark = theme === 'dark';

  return (
    <div className="h-screen flex flex-col bg-secondary">
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
            className={isDark ? 'bg-background' : 'bg-secondary'}
          >
            <Background
              variant={BackgroundVariant.Dots}
              color={isDark ? 'hsl(217 33% 22%)' : 'hsl(214 32% 78%)'}
              gap={20}
            />
            <Controls />
            <MiniMap
              className={isDark ? '!bg-card' : '!bg-card'}
              nodeColor="hsl(var(--primary))"
              maskColor={isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.08)'}
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
