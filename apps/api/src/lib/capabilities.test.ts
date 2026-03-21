import { describe, it, expect } from 'vitest';
import { pruneFlow } from './capabilities';
import type { OrchestraFlow } from '@orchestra/shared';

function makeFlow(overrides: Partial<OrchestraFlow> = {}): OrchestraFlow {
  return {
    id: 'flow-1',
    version: 1,
    name: 'Test Flow',
    entryNodeId: 'n1',
    nodes: [],
    edges: [],
    ...overrides,
  };
}

describe('pruneFlow', () => {
  it('keeps nodes that require no capabilities', () => {
    const flow = makeFlow({
      nodes: [
        { id: 'n1', type: 'landing', props: {}, actions: [] },
        { id: 'n2', type: 'list', props: {}, actions: [] },
      ],
    });
    const result = pruneFlow(flow, [], '1.0.0');
    expect(result.nodes).toHaveLength(2);
  });

  it('removes map node when mapbox capability is absent', () => {
    const flow = makeFlow({
      nodes: [
        { id: 'n1', type: 'landing', props: {}, actions: [] },
        { id: 'n2', type: 'map', props: {}, actions: [] },
      ],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    });
    const result = pruneFlow(flow, [], '1.0.0');
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].id).toBe('n1');
  });

  it('keeps map node when mapbox capability is present', () => {
    const flow = makeFlow({
      nodes: [
        { id: 'n1', type: 'landing', props: {}, actions: [] },
        { id: 'n2', type: 'map', props: {}, actions: [] },
      ],
    });
    const result = pruneFlow(flow, ['mapbox'], '1.1.0');
    expect(result.nodes).toHaveLength(2);
  });

  it('removes photo_gallery when camera capability is absent', () => {
    const flow = makeFlow({
      nodes: [{ id: 'n1', type: 'photo_gallery', props: {}, actions: [] }],
    });
    const result = pruneFlow(flow, [], '1.0.0');
    expect(result.nodes).toHaveLength(0);
  });

  it('prunes edges referencing removed nodes', () => {
    const flow = makeFlow({
      nodes: [
        { id: 'n1', type: 'landing', props: {}, actions: [] },
        { id: 'n2', type: 'map', props: {}, actions: [] },
        { id: 'n3', type: 'list', props: {}, actions: [] },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n1', target: 'n3' },
        { id: 'e3', source: 'n2', target: 'n3' },
      ],
    });
    const result = pruneFlow(flow, [], '1.1.0');
    // n2 (map) removed → e1 and e3 removed
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].id).toBe('e2');
  });

  it('maps map to legacy_map for clients < 1.1.0', () => {
    const flow = makeFlow({
      nodes: [{ id: 'n1', type: 'map', props: {}, actions: [] }],
    });
    const result = pruneFlow(flow, ['mapbox'], '1.0.0');
    expect(result.nodes[0].type).toBe('legacy_map');
  });

  it('does not map for clients >= 1.1.0', () => {
    const flow = makeFlow({
      nodes: [{ id: 'n1', type: 'map', props: {}, actions: [] }],
    });
    const result = pruneFlow(flow, ['mapbox'], '1.1.0');
    expect(result.nodes[0].type).toBe('map');
  });

  it('does not map for clients > 1.1.0', () => {
    const flow = makeFlow({
      nodes: [{ id: 'n1', type: 'map', props: {}, actions: [] }],
    });
    const result = pruneFlow(flow, ['mapbox'], '2.0.0');
    expect(result.nodes[0].type).toBe('map');
  });

  it('preserves flow metadata', () => {
    const flow = makeFlow({ name: 'My App', version: 3 });
    const result = pruneFlow(flow, [], '1.0.0');
    expect(result.name).toBe('My App');
    expect(result.version).toBe(3);
    expect(result.id).toBe('flow-1');
  });
});
