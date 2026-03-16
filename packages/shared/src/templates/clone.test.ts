import { describe, it, expect } from 'vitest';
import { cloneTemplate } from './clone';
import type { ProjectTemplate } from './types';

const MINIMAL_TEMPLATE: ProjectTemplate = {
  id: 'test',
  name: 'Test Template',
  description: 'A minimal template for testing',
  icon: 'T',
  datasources: [
    {
      id: 'ds_items',
      name: 'Items',
      fields: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'count', label: 'Count', type: 'number' },
      ],
      sampleEntries: [
        { title: 'Item 1', count: 10 },
        { title: 'Item 2', count: 20 },
      ],
    },
  ],
  nodes: [
    {
      id: 'node_list',
      label: 'List',
      type: 'landing',
      position: { x: 0, y: 0 },
      screen: {
        rootComponents: [
          {
            id: 'sc_1',
            type: 'text',
            props: { content: 'Hello' },
          },
          {
            id: 'sc_2',
            type: 'button',
            props: { label: 'Go', navigateTo: 'node_detail' },
          },
          {
            id: 'sc_3',
            type: 'list',
            props: { direction: 'vertical' },
            datasource: {
              datasourceId: 'ds_items',
              fieldMappings: { content: 'title' },
            },
            children: [
              {
                id: 'sc_4',
                type: 'text',
                props: { content: '{{title}}' },
                datasource: {
                  datasourceId: 'ds_items',
                  fieldMappings: { content: 'title' },
                },
              },
            ],
          },
        ],
      },
    },
    {
      id: 'node_detail',
      label: 'Detail',
      type: 'list',
      position: { x: 300, y: 0 },
      screen: {
        rootComponents: [
          {
            id: 'sc_5',
            type: 'button',
            props: { label: 'Back', navigateTo: 'node_list' },
          },
        ],
      },
    },
  ],
  edges: [
    { id: 'edge_1', source: 'node_list', target: 'node_detail' },
    { id: 'edge_2', source: 'node_detail', target: 'node_list' },
  ],
};

describe('cloneTemplate', () => {
  it('returns new IDs for all datasources', () => {
    const result = cloneTemplate(MINIMAL_TEMPLATE);
    expect(result.datasources).toHaveLength(1);
    expect(result.datasources[0].newId).not.toBe('ds_items');
    expect(result.datasources[0].newId).toContain('ds_');
  });

  it('preserves datasource fields and sample entries', () => {
    const result = cloneTemplate(MINIMAL_TEMPLATE);
    expect(result.datasources[0].fields).toEqual(MINIMAL_TEMPLATE.datasources[0].fields);
    expect(result.datasources[0].sampleEntries).toHaveLength(2);
    expect(result.datasources[0].sampleEntries[0].title).toBe('Item 1');
  });

  it('does not mutate sample entries', () => {
    const result = cloneTemplate(MINIMAL_TEMPLATE);
    result.datasources[0].sampleEntries[0].title = 'CHANGED';
    expect(MINIMAL_TEMPLATE.datasources[0].sampleEntries[0].title).toBe('Item 1');
  });

  it('returns new IDs for all nodes', () => {
    const result = cloneTemplate(MINIMAL_TEMPLATE);
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0].newId).not.toBe('node_list');
    expect(result.nodes[1].newId).not.toBe('node_detail');
  });

  it('remaps component IDs recursively', () => {
    const result = cloneTemplate(MINIMAL_TEMPLATE);
    const listNode = result.nodes[0];
    const rootIds = listNode.screen.rootComponents.map((c) => c.id);
    // All IDs should be new
    expect(rootIds).not.toContain('sc_1');
    expect(rootIds).not.toContain('sc_2');
    expect(rootIds).not.toContain('sc_3');
    // Children should also be remapped
    const listComp = listNode.screen.rootComponents[2];
    expect(listComp.children![0].id).not.toBe('sc_4');
  });

  it('remaps datasource references in components', () => {
    const result = cloneTemplate(MINIMAL_TEMPLATE);
    const listComp = result.nodes[0].screen.rootComponents[2];
    // datasourceId should be remapped
    expect(listComp.datasource!.datasourceId).not.toBe('ds_items');
    // Child datasource refs too
    expect(listComp.children![0].datasource!.datasourceId).not.toBe('ds_items');
    // Both should point to the same new ID
    expect(listComp.datasource!.datasourceId).toBe(listComp.children![0].datasource!.datasourceId);
  });

  it('fixes navigateTo references in buttons', () => {
    const result = cloneTemplate(MINIMAL_TEMPLATE);
    const goButton = result.nodes[0].screen.rootComponents[1];
    const backButton = result.nodes[1].screen.rootComponents[0];
    // navigateTo should point to the new node IDs
    expect(goButton.props.navigateTo).toBe(result.nodes[1].newId);
    expect(backButton.props.navigateTo).toBe(result.nodes[0].newId);
  });

  it('remaps edge sources and targets', () => {
    const result = cloneTemplate(MINIMAL_TEMPLATE);
    expect(result.edges).toHaveLength(2);
    expect(result.edges[0].source).toBe(result.nodes[0].newId);
    expect(result.edges[0].target).toBe(result.nodes[1].newId);
    expect(result.edges[1].source).toBe(result.nodes[1].newId);
    expect(result.edges[1].target).toBe(result.nodes[0].newId);
  });

  it('provides a complete idMap', () => {
    const result = cloneTemplate(MINIMAL_TEMPLATE);
    // Should contain mappings for datasources, nodes, edges, and components
    expect(result.idMap.has('ds_items')).toBe(true);
    expect(result.idMap.has('node_list')).toBe(true);
    expect(result.idMap.has('node_detail')).toBe(true);
    expect(result.idMap.has('edge_1')).toBe(true);
    expect(result.idMap.has('sc_1')).toBe(true);
  });

  it('preserves edge sourceHandle and targetHandle', () => {
    const templateWithHandles: ProjectTemplate = {
      ...MINIMAL_TEMPLATE,
      edges: [
        { id: 'e1', source: 'node_list', target: 'node_detail', sourceHandle: 'right', targetHandle: 'target-left' },
      ],
    };
    const result = cloneTemplate(templateWithHandles);
    expect(result.edges[0].sourceHandle).toBe('right');
    expect(result.edges[0].targetHandle).toBe('target-left');
  });
});
