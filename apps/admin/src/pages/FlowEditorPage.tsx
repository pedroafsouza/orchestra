import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  MarkerType,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore, type LayoutDirection } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { useProjectStore } from '@/store/projectStore';
import { OrchestraNode, getNodeColor } from '@/components/OrchestraNode';
import { DecisionNode } from '@/components/DecisionNode';
import { LabeledEdge } from '@/components/LabeledEdge';
import { Sidebar } from '@/components/Sidebar';
import { Toolbar } from '@/components/Toolbar';
import { LayoutToolbar } from '@/components/flow/LayoutToolbar';
import { ScreenBuilderModal } from '@/components/ScreenBuilder/ScreenBuilderModal';
import { useParams, useNavigate } from 'react-router-dom';

const nodeTypes = {
  orchestra: OrchestraNode,
  decision: DecisionNode,
};

const edgeTypes = {
  labeled: LabeledEdge,
};

export function FlowEditorPage() {
  return (
    <ReactFlowProvider>
      <FlowEditorInner />
    </ReactFlowProvider>
  );
}

function FlowEditorInner() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const loadDiagram = useFlowStore((s) => s.loadDiagram);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const undo = useFlowStore((s) => s.undo);
  const redo = useFlowStore((s) => s.redo);
  const autoLayout = useFlowStore((s) => s.autoLayout);

  const [screenBuilderNodeId, setScreenBuilderNodeId] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const { fitView } = useReactFlow();

  const handleAutoLayout = useCallback(
    (direction: LayoutDirection) => {
      autoLayout(direction);
      requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }));
    },
    [autoLayout, fitView],
  );

  useEffect(() => {
    if (projectId) loadDiagram(projectId);
  }, [projectId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const handleNodeDoubleClick = (_event: React.MouseEvent, node: any) => {
    setScreenBuilderNodeId(node.id);
  };

  const isDark = theme === 'dark';
  const edgeColor = isDark ? 'hsl(215 20% 45%)' : 'hsl(215 16% 70%)';

  const defaultEdgeOptions = useMemo(() => ({
    type: 'labeled',
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

  const implicitEdges = useImplicitEdges(nodes, edges);

  const styledEdges = useMemo(() => {
    const allEdges = [...edges, ...implicitEdges];
    return allEdges.map((e) => {
      const isImplicit = (e as any).data?.implicit;
      return {
        ...e,
        type: 'labeled',
        animated: false,
        selectable: !isImplicit,
        deletable: !isImplicit,
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
        data: {
          ...((e as any).data || {}),
        },
      };
    });
  }, [edges, implicitEdges, edgeColor]);

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
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            onPaneClick={() => setSelectedNode(null)}
            onNodeDoubleClick={handleNodeDoubleClick}
            snapToGrid={snapToGrid}
            snapGrid={[20, 20]}
            edgesFocusable
            edgesReconnectable
            fitView
            className={isDark ? 'bg-background' : 'bg-secondary'}
          >
            <Controls />
            <LayoutToolbar
              onAutoLayout={handleAutoLayout}
              snapToGrid={snapToGrid}
              onToggleSnap={() => setSnapToGrid((s) => !s)}
            />
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

/** Derive implicit edges from navigateTo props inside screen definitions */
function useImplicitEdges(nodes: any[], edges: any[]) {
  return useMemo(() => {
    const result: typeof edges = [];
    const existingPairs = new Set(edges.map((e: any) => `${e.source}->${e.target}`));

    for (const node of nodes) {
      const rootComponents =
        (node.data as any).props?.screenDefinition?.rootComponents;
      if (!rootComponents) continue;

      const stack = [...rootComponents];
      while (stack.length > 0) {
        const comp = stack.pop();
        if (!comp) continue;
        const target = comp.props?.navigateTo;
        if (target && typeof target === 'string' && target !== node.id) {
          const pairKey = `${node.id}->${target}`;
          if (!existingPairs.has(pairKey)) {
            existingPairs.add(pairKey);
            const label = comp.props?.label || comp.type || '';
            result.push({
              id: `implicit_${node.id}_${comp.id}_${target}`,
              source: node.id,
              target,
              type: 'labeled',
              animated: false,
              data: { label, implicit: true },
            } as any);
          }
        }
        if (comp.children) stack.push(...comp.children);
      }
    }
    return result;
  }, [nodes, edges]);
}
