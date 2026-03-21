import { describe, it, expect } from 'vitest';
import { TEMPLATES } from './index';
import { ScreenComponentSchema } from '../schemas/screen';

describe('template integrity', () => {
  for (const template of TEMPLATES) {
    describe(template.name, () => {
      it('has required metadata', () => {
        expect(template.id).toBeTruthy();
        expect(template.name).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(template.icon).toBeTruthy();
      });

      it('has at least one node', () => {
        expect(template.nodes.length).toBeGreaterThan(0);
      });

      it('all edge sources and targets reference existing nodes', () => {
        const nodeIds = new Set(template.nodes.map((n) => n.id));
        for (const edge of template.edges) {
          expect(nodeIds.has(edge.source)).toBe(true);
          expect(nodeIds.has(edge.target)).toBe(true);
        }
      });

      it('all nodes have valid screen definitions', () => {
        for (const node of template.nodes) {
          expect(node.screen).toBeDefined();
          expect(Array.isArray(node.screen.rootComponents)).toBe(true);
        }
      });

      it('all root components pass Zod validation', () => {
        for (const node of template.nodes) {
          for (const comp of node.screen.rootComponents) {
            const result = ScreenComponentSchema.safeParse(comp);
            if (!result.success) {
              throw new Error(
                `Node "${node.label}" component "${comp.id}" (${comp.type}) failed: ${result.error.message}`,
              );
            }
          }
        }
      });

      it('all datasources have fields and unique names', () => {
        const names = new Set<string>();
        for (const ds of template.datasources) {
          expect(ds.name).toBeTruthy();
          expect(ds.fields.length).toBeGreaterThan(0);
          expect(names.has(ds.name)).toBe(false);
          names.add(ds.name);
        }
      });

      it('datasource field mappings reference existing datasources', () => {
        const dsIds = new Set(template.datasources.map((d) => d.id));

        function checkComponent(comp: any) {
          if (comp.datasource?.datasourceId) {
            expect(dsIds.has(comp.datasource.datasourceId)).toBe(true);
          }
          if (comp.children) {
            for (const child of comp.children) {
              checkComponent(child);
            }
          }
        }

        for (const node of template.nodes) {
          for (const comp of node.screen.rootComponents) {
            checkComponent(comp);
          }
        }
      });

      it('node IDs are unique', () => {
        const ids = template.nodes.map((n) => n.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  }
});
