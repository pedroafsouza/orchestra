import type { ProjectTemplate, TemplateNode, TemplateEdge, TemplateDatasource } from './types';
import type { ScreenComponent } from '../schemas/screen';

let counter = 0;
function freshId(prefix: string): string {
  return `${prefix}_${++counter}_${Date.now().toString(36)}`;
}

/**
 * Deep-clone a template, remapping every ID to a fresh value.
 * Returns the cloned data ready for database insertion.
 */
export function cloneTemplate(template: ProjectTemplate) {
  const idMap = new Map<string, string>();

  function mapId(oldId: string, prefix: string): string {
    if (!idMap.has(oldId)) {
      idMap.set(oldId, freshId(prefix));
    }
    return idMap.get(oldId)!;
  }

  // Remap datasources
  const datasources: (TemplateDatasource & { newId: string })[] = template.datasources.map((ds) => ({
    ...ds,
    newId: mapId(ds.id, 'ds'),
    sampleEntries: ds.sampleEntries.map((e) => ({ ...e })),
  }));

  // Remap screen components recursively
  function remapComponent(c: ScreenComponent): ScreenComponent {
    const newId = mapId(c.id, 'sc');
    return {
      ...c,
      id: newId,
      datasource: c.datasource
        ? {
            ...c.datasource,
            datasourceId: idMap.get(c.datasource.datasourceId) || c.datasource.datasourceId,
          }
        : undefined,
      actions: c.actions?.map((a: any) => ({
        ...a,
        payload: a.payload?.datasourceId
          ? { ...a.payload, datasourceId: idMap.get(a.payload.datasourceId) || a.payload.datasourceId }
          : a.payload,
      })),
      children: c.children?.map(remapComponent),
    };
  }

  // Remap nodes
  const nodes: (TemplateNode & { newId: string })[] = template.nodes.map((node) => {
    const newId = mapId(node.id, 'node');
    return {
      ...node,
      newId,
      screen: {
        ...node.screen,
        rootComponents: node.screen.rootComponents.map(remapComponent),
      },
    };
  });

  // Now fix navigateTo references in button props
  function fixNavigateRefs(c: ScreenComponent): ScreenComponent {
    const updated = { ...c };
    if (c.type === 'button' && c.props.navigateTo && idMap.has(c.props.navigateTo)) {
      updated.props = { ...c.props, navigateTo: idMap.get(c.props.navigateTo) };
    }
    if (c.children) {
      updated.children = c.children.map(fixNavigateRefs);
    }
    return updated;
  }

  const fixedNodes = nodes.map((node) => ({
    ...node,
    screen: {
      ...node.screen,
      rootComponents: node.screen.rootComponents.map(fixNavigateRefs),
    },
  }));

  // Remap edges
  const edges: (TemplateEdge & { newId: string })[] = template.edges.map((edge) => ({
    ...edge,
    newId: mapId(edge.id, 'edge'),
    source: idMap.get(edge.source) || edge.source,
    target: idMap.get(edge.target) || edge.target,
  }));

  return { datasources, nodes: fixedNodes, edges, idMap };
}
