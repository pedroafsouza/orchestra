import { useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { OrchestraNode, getNodeColor } from '@/components/OrchestraNode';
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

  const edgeColor = isDark ? 'hsl(215 20% 45%)' : 'hsl(215 16% 70%)';

  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep',
    animated: false,
    style: {
      stroke: edgeColor,
      strokeWidth: 1.5,
      strokeDasharray: '6 4',
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: edgeColor,
      width: 16,
      height: 16,
    },
  }), [edgeColor]);

  // Ensure existing edges have markers (for edges loaded from DB)
  const styledEdges = useMemo(() =>
    edges.map((e) => ({
      ...e,
      type: e.type || 'smoothstep',
      animated: false,
      style: {
        stroke: edgeColor,
        strokeWidth: 1.5,
        strokeDasharray: '6 4',
        ...((e as any).style || {}),
      },
      markerEnd: (e as any).markerEnd || {
        type: MarkerType.ArrowClosed,
        color: edgeColor,
        width: 16,
        height: 16,
      },
    })),
    [edges, edgeColor]
  );

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
            edges={styledEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
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
              nodeColor={(node) => {
                const data = node.data as any;
                return getNodeColor(data?.nodeType || '');
              }}
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
