import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFlowStore } from '@/features/flow-editor/store/flowStore';

// Mock the api module to prevent actual network calls
vi.mock('@/lib/api', () => ({
  api: vi.fn(() => Promise.resolve({})),
}));

describe('flowStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    const store = useFlowStore.getState();
    useFlowStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      flowName: 'Untitled Flow',
      projectId: null,
      loaded: false,
    });
  });

  describe('addNode', () => {
    it('adds a node with correct data structure', () => {
      const store = useFlowStore.getState();
      store.addNode('landing', { x: 100, y: 200 });

      const { nodes } = useFlowStore.getState();
      expect(nodes).toHaveLength(1);
      expect(nodes[0].data.nodeType).toBe('landing');
      expect(nodes[0].data.label).toBe('landing node');
      expect(nodes[0].data.props).toEqual({});
      expect(nodes[0].data.actions).toEqual([]);
      expect(nodes[0].type).toBe('orchestra');
    });

    it('selects the newly added node', () => {
      const store = useFlowStore.getState();
      store.addNode('list', { x: 0, y: 0 });

      const { selectedNodeId, nodes } = useFlowStore.getState();
      expect(selectedNodeId).toBe(nodes[0].id);
    });

    it('generates unique IDs for multiple nodes', () => {
      const store = useFlowStore.getState();
      store.addNode('landing', { x: 0, y: 0 });
      store.addNode('list', { x: 200, y: 0 });

      const { nodes } = useFlowStore.getState();
      expect(nodes).toHaveLength(2);
      expect(nodes[0].id).not.toBe(nodes[1].id);
    });
  });

  describe('updateNodeData', () => {
    it('merges partial data into existing node', () => {
      const store = useFlowStore.getState();
      store.addNode('landing', { x: 0, y: 0 });

      const nodeId = useFlowStore.getState().nodes[0].id;
      store.updateNodeData(nodeId, { label: 'Home Screen' });

      const updated = useFlowStore.getState().nodes[0];
      expect(updated.data.label).toBe('Home Screen');
      expect(updated.data.nodeType).toBe('landing'); // preserved
    });

    it('does not affect other nodes', () => {
      const store = useFlowStore.getState();
      store.addNode('landing', { x: 0, y: 0 });
      store.addNode('list', { x: 200, y: 0 });

      const nodes = useFlowStore.getState().nodes;
      store.updateNodeData(nodes[0].id, { label: 'Changed' });

      const updated = useFlowStore.getState().nodes;
      expect(updated[1].data.label).toBe('list node'); // unchanged
    });
  });

  describe('setSelectedNode', () => {
    it('sets selected node ID', () => {
      const store = useFlowStore.getState();
      store.setSelectedNode('node_1');
      expect(useFlowStore.getState().selectedNodeId).toBe('node_1');
    });

    it('clears selection with null', () => {
      const store = useFlowStore.getState();
      store.setSelectedNode('node_1');
      store.setSelectedNode(null);
      expect(useFlowStore.getState().selectedNodeId).toBeNull();
    });
  });

  describe('setFlowName', () => {
    it('updates flow name', () => {
      const store = useFlowStore.getState();
      store.setFlowName('My App Flow');
      expect(useFlowStore.getState().flowName).toBe('My App Flow');
    });
  });

  describe('getExportJSON', () => {
    it('returns correct export structure', () => {
      const store = useFlowStore.getState();
      store.setFlowName('Test Flow');
      store.addNode('landing', { x: 0, y: 0 });
      store.addNode('list', { x: 200, y: 0 });

      const json = store.getExportJSON();
      expect(json.name).toBe('Test Flow');
      expect(json.version).toBe(1);
      expect(json.nodes).toHaveLength(2);
      expect(json.nodes[0].type).toBe('landing');
      expect(json.nodes[1].type).toBe('list');
      expect(json.entryNodeId).toBe(json.nodes[0].id);
    });

    it('exports nodes with correct shape', () => {
      const store = useFlowStore.getState();
      store.addNode('form', { x: 0, y: 0 });
      store.updateNodeData(useFlowStore.getState().nodes[0].id, {
        props: { key: 'value' },
        actions: [{ trigger: 'onPress', type: 'NAVIGATE', payload: {} }],
      });

      const json = store.getExportJSON();
      expect(json.nodes[0].props).toEqual({ key: 'value' });
      expect(json.nodes[0].actions).toHaveLength(1);
    });
  });
});
