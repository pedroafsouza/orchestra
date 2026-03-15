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

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  setSelectedNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<OrchestraNodeData>) => void;
  setFlowName: (name: string) => void;
  getExportJSON: () => any;
  loadDiagram: (projectId: string) => Promise<void>;
  saveDiagram: () => void;
}

let nodeIdCounter = 0;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(state: FlowState) {
  if (!state.projectId) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const { nodes, edges, flowName, projectId } = state;
    if (!projectId) return;
    api(`/api/projects/${projectId}/diagram`, {
      method: 'PUT',
      body: { nodes, edges, flowName },
    }).catch((err) => console.warn('[auto-save] failed:', err));
  }, 1000);
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  flowName: 'Untitled Flow',
  projectId: null,
  loaded: false,

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
        });
      } else {
        set({ nodes: [], edges: [], flowName: 'Untitled Flow', loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  saveDiagram: () => scheduleSave(get()),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<OrchestraNodeData>[] });
    scheduleSave(get());
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
    scheduleSave(get());
  },

  onConnect: (connection) => {
    set({ edges: addEdge(connection, get().edges) });
    scheduleSave(get());
  },

  addNode: (type, position) => {
    const id = `node_${++nodeIdCounter}`;
    const { nodes } = get();
    // Place new nodes to the right of existing ones
    let x = position.x;
    let y = position.y;
    if (nodes.length > 0) {
      const maxX = Math.max(...nodes.map((n) => n.position.x));
      const avgY = nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length;
      x = maxX + 250;
      y = avgY;
    }
    const newNode: Node<OrchestraNodeData> = {
      id,
      type: 'orchestra',
      position: { x, y },
      data: {
        label: `${type} node`,
        nodeType: type,
        props: {},
        actions: [],
      },
    };
    set({ nodes: [...nodes, newNode] });
    scheduleSave(get());
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
    scheduleSave(get());
  },

  setFlowName: (name) => {
    set({ flowName: name });
    scheduleSave(get());
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
      })),
    };
  },
}));
