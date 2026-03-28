import { create } from 'zustand';
import {
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { NodeType, OrchestraAction } from '@orchestra/shared';
import { api } from '@/lib/api';
import Dagre from '@dagrejs/dagre';

export type LayoutDirection = 'TB' | 'LR' | 'BT' | 'RL';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 100;

export interface OrchestraNodeData {
  label: string;
  nodeType: NodeType;
  props: Record<string, any>;
  actions: OrchestraAction[];
  [key: string]: unknown;
}

interface DiagramState {
  nodes: Node<OrchestraNodeData>[];
  edges: Edge[];
  flowName: string;
}

interface FlowState {
  nodes: Node<OrchestraNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  flowName: string;
  projectId: string | null;
  loaded: boolean;
  isDirty: boolean;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: NodeType, position: { x: number; y: number }, initialData?: Partial<OrchestraNodeData>) => void;
  deleteNode: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<OrchestraNodeData>) => void;
  setFlowName: (name: string) => void;
  getExportJSON: () => any;
  loadDiagram: (projectId: string) => Promise<void>;
  saveDiagram: () => Promise<void>;
  autoLayout: (direction: LayoutDirection) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

let nodeIdCounter = 0;

// Undo/redo history
const MAX_HISTORY = 50;
let undoStack: DiagramState[] = [];
let redoStack: DiagramState[] = [];
let isUndoRedo = false;

function pushHistory(state: FlowState) {
  if (isUndoRedo) return;
  undoStack.push({
    nodes: JSON.parse(JSON.stringify(state.nodes)),
    edges: JSON.parse(JSON.stringify(state.edges)),
    flowName: state.flowName,
  });
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack = [];
}

/** Recursively clear navigateTo references to a deleted node in component trees */
function clearNavigateToRefs(components: any[], deletedId: string): any[] {
  return components.map((c) => {
    const updated = { ...c };
    if (updated.props?.navigateTo === deletedId) {
      updated.props = { ...updated.props, navigateTo: '' };
    }
    if (updated.children?.length) {
      updated.children = clearNavigateToRefs(updated.children, deletedId);
    }
    return updated;
  });
}

function markDirty(set: (partial: Partial<FlowState>) => void) {
  set({ isDirty: true });
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  flowName: 'Untitled Flow',
  projectId: null,
  loaded: false,
  isDirty: false,

  loadDiagram: async (projectId: string) => {
    set({ projectId, loaded: false });
    try {
      const data = await api(`/api/projects/${projectId}/diagram`);
      if (data && data.nodes) {
        // Restore nodeIdCounter from existing nodes
        const maxId = data.nodes.reduce((max: number, n: any) => {
          const match = n.id?.match(/node_(\d+)/);
          return match ? Math.max(max, parseInt(match[1])) : max;
        }, 0);
        nodeIdCounter = maxId;

        set({
          nodes: data.nodes,
          edges: data.edges || [],
          flowName: data.flowName || 'Untitled Flow',
          loaded: true,
          isDirty: false,
        });
      } else {
        set({ nodes: [], edges: [], flowName: 'Untitled Flow', loaded: true, isDirty: false });
      }
    } catch {
      set({ loaded: true });
    }
  },

  saveDiagram: async () => {
    const { nodes, edges, flowName, projectId } = get();
    if (!projectId) return;
    await api(`/api/projects/${projectId}/diagram`, {
      method: 'PUT',
      body: { nodes, edges, flowName },
    });
    set({ isDirty: false });
  },

  onNodesChange: (changes) => {
    // Only push history for significant changes (add/remove), not position drags
    const hasStructuralChange = changes.some((c) => c.type === 'remove' || c.type === 'add');
    if (hasStructuralChange) pushHistory(get());
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<OrchestraNodeData>[] });
    markDirty(set);
  },

  onEdgesChange: (changes) => {
    const hasStructuralChange = changes.some((c) => c.type === 'remove' || c.type === 'add');
    if (hasStructuralChange) pushHistory(get());
    set({ edges: applyEdgeChanges(changes, get().edges) });
    markDirty(set);
  },

  onConnect: (connection) => {
    pushHistory(get());
    // Auto-label edges from decision condition handles
    const sourceNode = get().nodes.find((n) => n.id === connection.source);
    let edgeData: Record<string, any> | undefined;
    if (
      sourceNode?.data.nodeType === 'decision' &&
      connection.sourceHandle?.startsWith('condition-')
    ) {
      const idx = parseInt(connection.sourceHandle.split('-')[1]);
      const conditions: { label: string }[] = sourceNode.data.props?.conditions || [];
      const label = conditions[idx]?.label || `Option ${idx + 1}`;
      edgeData = { label, conditionIndex: idx };
    }
    const edge: Edge = {
      ...connection,
      id: `edge_${connection.source}_${connection.sourceHandle || 'bottom'}_${connection.target}_${Date.now()}`,
      source: connection.source,
      target: connection.target,
      type: 'labeled',
      data: edgeData,
    };
    set({ edges: addEdge(edge, get().edges) });
    markDirty(set);
  },

  addNode: (type, position, initialData) => {
    pushHistory(get());
    const id = `node_${++nodeIdCounter}`;
    const { nodes, selectedNodeId } = get();
    let x = position.x;
    let y = position.y;

    if (nodes.length > 0) {
      // If a node is selected, place the new node to the right of it
      const referenceNode = selectedNodeId
        ? nodes.find((n) => n.id === selectedNodeId)
        : null;

      if (referenceNode) {
        x = referenceNode.position.x + 280;
        y = referenceNode.position.y;
      } else {
        // Place to the right of all existing nodes, vertically centered
        const maxX = Math.max(...nodes.map((n) => n.position.x));
        const avgY = nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length;
        x = maxX + 280;
        y = avgY;
      }

      // Avoid overlapping: nudge down if another node is too close
      const tooClose = nodes.some(
        (n) => Math.abs(n.position.x - x) < 200 && Math.abs(n.position.y - y) < 100
      );
      if (tooClose) {
        const maxY = Math.max(...nodes.filter((n) => Math.abs(n.position.x - x) < 200).map((n) => n.position.y));
        y = maxY + 180;
      }
    } else {
      // First node — center of canvas
      x = 250;
      y = 150;
    }

    const newNode: Node<OrchestraNodeData> = {
      id,
      type: type === 'decision' ? 'decision' : 'orchestra',
      position: { x, y },
      data: {
        label: initialData?.label || (type === 'decision' ? 'Decision' : `${type} node`),
        nodeType: type,
        props: initialData?.props || (type === 'decision' ? { conditions: [] } : {}),
        actions: initialData?.actions || [],
        ...initialData,
      },
    };
    set({ nodes: [...nodes, newNode], selectedNodeId: id });
    markDirty(set);
  },

  deleteNode: (id: string) => {
    pushHistory(get());
    const { nodes, edges, selectedNodeId } = get();

    // Remove the node itself
    const newNodes = nodes
      .filter((n) => n.id !== id)
      .map((n) => {
        // Clear navigateTo references pointing to the deleted node in screen definitions
        const screenDef = n.data.props?.screenDefinition;
        if (screenDef?.rootComponents) {
          const cleanedComponents = clearNavigateToRefs(screenDef.rootComponents, id);
          return {
            ...n,
            data: {
              ...n.data,
              props: {
                ...n.data.props,
                screenDefinition: { ...screenDef, rootComponents: cleanedComponents },
              },
            },
          };
        }
        // Clear NAVIGATE action payloads referencing the deleted node
        if (n.data.actions?.length) {
          const cleanedActions = n.data.actions.map((action) => {
            if (action.type === 'NAVIGATE' && action.payload?.targetNodeId === id) {
              return { ...action, payload: { ...action.payload, targetNodeId: '' } };
            }
            return action;
          });
          return { ...n, data: { ...n.data, actions: cleanedActions } };
        }
        return n;
      });

    // Remove all edges connected to the deleted node
    const newEdges = edges.filter((e) => e.source !== id && e.target !== id);

    set({
      nodes: newNodes,
      edges: newEdges,
      selectedNodeId: selectedNodeId === id ? null : selectedNodeId,
    });
    markDirty(set);
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    });
    markDirty(set);
  },

  setFlowName: (name) => {
    set({ flowName: name });
    markDirty(set);
  },

  getExportJSON: () => {
    const { nodes, edges, flowName } = get();
    return {
      id: crypto.randomUUID(),
      version: 1,
      name: flowName,
      entryNodeId: nodes[0]?.id ?? '',
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.nodeType,
        props: n.data.props,
        actions: n.data.actions,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        condition: (e as any).data?.label || undefined,
      })),
    };
  },

  autoLayout: (direction: LayoutDirection) => {
    pushHistory(get());
    const { nodes, edges } = get();
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: direction,
      nodesep: 60,
      ranksep: 100,
      marginx: 40,
      marginy: 40,
    });
    nodes.forEach((node) => {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });
    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });
    Dagre.layout(g);
    const laid = nodes.map((node) => {
      const pos = g.node(node.id);
      return {
        ...node,
        position: {
          x: pos.x - NODE_WIDTH / 2,
          y: pos.y - NODE_HEIGHT / 2,
        },
      };
    });
    set({ nodes: laid as Node<OrchestraNodeData>[] });
    markDirty(set);
  },

  undo: () => {
    if (undoStack.length === 0) return;
    const current = get();
    redoStack.push({
      nodes: JSON.parse(JSON.stringify(current.nodes)),
      edges: JSON.parse(JSON.stringify(current.edges)),
      flowName: current.flowName,
    });
    const prev = undoStack.pop()!;
    isUndoRedo = true;
    set({ nodes: prev.nodes, edges: prev.edges, flowName: prev.flowName });
    isUndoRedo = false;
    markDirty(set);
  },

  redo: () => {
    if (redoStack.length === 0) return;
    const current = get();
    undoStack.push({
      nodes: JSON.parse(JSON.stringify(current.nodes)),
      edges: JSON.parse(JSON.stringify(current.edges)),
      flowName: current.flowName,
    });
    const next = redoStack.pop()!;
    isUndoRedo = true;
    set({ nodes: next.nodes, edges: next.edges, flowName: next.flowName });
    isUndoRedo = false;
    markDirty(set);
  },

  canUndo: () => undoStack.length > 0,
  canRedo: () => redoStack.length > 0,
}));
