import { create } from 'zustand';
import type { OrchestraFlow, OrchestraNode } from '@orchestra/shared';

interface OrchestraState {
  flow: OrchestraFlow | null;
  currentNodeId: string | null;
  context: Record<string, any>;
  config: { mapboxToken?: string };
  loading: boolean;
  error: string | null;

  setFlow: (flow: OrchestraFlow, config?: { mapboxToken?: string }) => void;
  setCurrentNode: (nodeId: string) => void;
  setContext: (key: string, value: any) => void;
  mergeContext: (data: Record<string, any>) => void;
  getCurrentNode: () => OrchestraNode | null;
  getNodeById: (id: string) => OrchestraNode | undefined;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useOrchestraStore = create<OrchestraState>((set, get) => ({
  flow: null,
  currentNodeId: null,
  context: {},
  config: {},
  loading: false,
  error: null,

  setFlow: (flow, config) =>
    set({
      flow,
      currentNodeId: flow.entryNodeId,
      config: config || {},
      error: null,
    }),

  setCurrentNode: (nodeId) => set({ currentNodeId: nodeId }),

  setContext: (key, value) =>
    set({ context: { ...get().context, [key]: value } }),

  mergeContext: (data) =>
    set({ context: { ...get().context, ...data } }),

  getCurrentNode: () => {
    const { flow, currentNodeId } = get();
    if (!flow || !currentNodeId) return null;
    return flow.nodes.find((n) => n.id === currentNodeId) ?? null;
  },

  getNodeById: (id) => {
    const { flow } = get();
    return flow?.nodes.find((n) => n.id === id);
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      flow: null,
      currentNodeId: null,
      context: {},
      config: {},
      loading: false,
      error: null,
    }),
}));
