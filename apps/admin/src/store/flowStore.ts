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

export interface OrchestraNodeData {
  label: string;
  nodeType: NodeType;
  props: Record<string, any>;
  actions: OrchestraAction[];
  [key: string]: unknown;
}

interface FlowState {
  nodes: Node<OrchestraNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  flowName: string;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  setSelectedNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<OrchestraNodeData>) => void;
  setFlowName: (name: string) => void;
  getExportJSON: () => any;
}

let nodeIdCounter = 0;

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  flowName: 'Untitled Flow',

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<OrchestraNodeData>[] }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) =>
    set({ edges: addEdge(connection, get().edges) }),

  addNode: (type, position) => {
    const id = `node_${++nodeIdCounter}`;
    const newNode: Node<OrchestraNodeData> = {
      id,
      type: 'orchestra',
      position,
      data: {
        label: `${type} node`,
        nodeType: type,
        props: {},
        actions: [],
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) =>
    set({
      nodes: get().nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    }),

  setFlowName: (name) => set({ flowName: name }),

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
