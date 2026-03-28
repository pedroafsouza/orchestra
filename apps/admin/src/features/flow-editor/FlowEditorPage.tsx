import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore, type LayoutDirection } from './store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { useProjectStore } from '@/features/projects/projectStore';
import { OrchestraNode, getNodeColor } from './components/OrchestraNode';
import { DecisionNode, getConditionColor } from './components/DecisionNode';
import { LabeledEdge, MARKER_EXPLICIT, MARKER_CONDITION, MARKER_IMPLICIT } from './edge/LabeledEdge';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { LayoutToolbar } from './components/LayoutToolbar';
import { ScreenBuilderModal } from '@/features/screen-builder/ScreenBuilderModal';
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
  const deleteNode = useFlowStore((s) => s.deleteNode);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);

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
      // Don't handle keys when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      // Delete selected node with Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault();
        deleteNode(selectedNodeId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, deleteNode, selectedNodeId]);

  const handleNodeDoubleClick = (_event: React.MouseEvent, node: any) => {
    setScreenBuilderNodeId(node.id);
  };

  const isDark = theme === 'dark';

  const defaultEdgeOptions = useMemo(() => ({
    type: 'labeled',
    animated: false,
    style: {},
    markerEnd: undefined,
  }), []);

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
        // Styling is handled entirely inside LabeledEdge based on tier
        style: {},
        data: {
          ...((e as any).data || {}),
        },
      };
    });
  }, [edges, implicitEdges]);

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
            <EdgeMarkerDefs />
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

/**
 * SVG marker definitions for the three edge tiers.
 * Rendered inside ReactFlow so markers are available in the same SVG context.
 */
function EdgeMarkerDefs() {
  // 6 condition colors from DecisionNode
  const conditionCount = 6;

  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        {/* Explicit edge arrow: 20x20 filled triangle, primary color */}
        <marker
          id={MARKER_EXPLICIT}
          viewBox="0 0 20 20"
          refX={18}
          refY={10}
          markerWidth={20}
          markerHeight={20}
          orient="auto-start-reverse"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 2 4 L 18 10 L 2 16 Z" fill="hsl(var(--primary))" />
        </marker>

        {/* Condition edge arrows: 20x20 filled, one per condition color */}
        {Array.from({ length: conditionCount }).map((_, i) => (
          <marker
            key={`cond-${i}`}
            id={MARKER_CONDITION(i)}
            viewBox="0 0 20 20"
            refX={18}
            refY={10}
            markerWidth={20}
            markerHeight={20}
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path d="M 2 4 L 18 10 L 2 16 Z" fill={getConditionColor(i)} />
          </marker>
        ))}

        {/* Implicit edge arrow: 14x14 open (unfilled) triangle, muted */}
        <marker
          id={MARKER_IMPLICIT}
          viewBox="0 0 14 14"
          refX={12}
          refY={7}
          markerWidth={14}
          markerHeight={14}
          orient="auto-start-reverse"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 2 3 L 12 7 L 2 11"
            fill="none"
            stroke="hsl(var(--muted-foreground) / 0.4)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </marker>
      </defs>
    </svg>
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
