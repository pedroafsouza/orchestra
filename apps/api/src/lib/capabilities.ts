import type { OrchestraFlow, OrchestraNode } from '@orchestra/shared';

/** Maps node types to required capabilities */
const NODE_CAPABILITY_MAP: Record<string, string> = {
  map: 'mapbox',
  photo_gallery: 'camera',
};

/** Maps node types for older client versions */
const VERSION_NODE_MAP: Record<string, Record<string, string>> = {
  // Before 1.1.0, use legacy alternatives
  '< 1.1.0': {
    map: 'legacy_map',
  },
};

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function pruneFlow(
  flow: OrchestraFlow,
  capabilities: string[],
  clientVersion: string
): OrchestraFlow {
  // Filter nodes by capability
  const supportedNodes = flow.nodes.filter((node) => {
    const required = NODE_CAPABILITY_MAP[node.type];
    return !required || capabilities.includes(required);
  });

  // Version mapping
  const mappedNodes: OrchestraNode[] = supportedNodes.map((node) => {
    if (compareVersions(clientVersion, '1.1.0') < 0) {
      const mapping = VERSION_NODE_MAP['< 1.1.0'];
      if (mapping && mapping[node.type]) {
        return { ...node, type: mapping[node.type] as any };
      }
    }
    return node;
  });

  const validNodeIds = new Set(mappedNodes.map((n) => n.id));

  // Prune edges referencing removed nodes
  const validEdges = flow.edges.filter(
    (e) => validNodeIds.has(e.source) && validNodeIds.has(e.target)
  );

  return {
    ...flow,
    nodes: mappedNodes,
    edges: validEdges,
  };
}
