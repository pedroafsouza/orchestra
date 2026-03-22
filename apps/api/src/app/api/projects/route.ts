import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { requireAuth } from '@/lib/session';
import { TEMPLATES, cloneTemplate, ProjectTemplateSchema } from '@orchestra/shared';
import type { ProjectTemplate } from '@orchestra/shared';
import { z } from 'zod';

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  templateId: z.string().optional(),
  template: ProjectTemplateSchema.optional(),
});

/** GET — list projects for the current user */
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id;

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    include: {
      _count: { select: { flows: true, members: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(projects);
}

/** POST — create a new project (optionally from a template) */
export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, templateId, template: rawTemplate } = CreateProjectSchema.parse(body);
    const userId = (session!.user as any).id;

    const project = await prisma.project.create({
      data: {
        name,
        ownerId: userId,
        members: {
          create: { userId, role: 'owner' },
        },
      },
    });

    // Resolve template: either from registry (templateId) or raw AI-generated template
    const template = rawTemplate
      ? (rawTemplate as ProjectTemplate)
      : templateId
        ? TEMPLATES.find((t) => t.id === templateId)
        : undefined;

    // If a template was provided, hydrate the project with template data
    if (template) {
        const cloned = cloneTemplate(template);

        // Create datasources and sample entries
        for (const ds of cloned.datasources) {
          const created = await prisma.datasource.create({
            data: {
              name: ds.name,
              projectId: project.id,
              fields: ds.fields as any,
            },
          });

          // Update idMap so screen components reference the real DB id
          // ds.id is the original template ID, ds.newId is the clone-generated ID
          // Screen components reference the generated ID, so map that to the real DB id
          cloned.idMap.set(ds.id, created.id);
          cloned.idMap.set(ds.newId, created.id);

          // Create sample entries
          for (let i = 0; i < ds.sampleEntries.length; i++) {
            await prisma.datasourceEntry.create({
              data: {
                datasourceId: created.id,
                data: ds.sampleEntries[i] as any,
                sortOrder: i,
              },
            });
          }
        }

        // Fix datasource IDs in screen components now that we have real DB IDs
        function fixDatasourceIds(c: any): any {
          const updated = { ...c };
          if (c.datasource?.datasourceId) {
            updated.datasource = {
              ...c.datasource,
              datasourceId: cloned.idMap.get(c.datasource.datasourceId) || c.datasource.datasourceId,
            };
          }
          if (c.actions) {
            updated.actions = c.actions.map((a: any) => ({
              ...a,
              payload: a.payload?.datasourceId
                ? { ...a.payload, datasourceId: cloned.idMap.get(a.payload.datasourceId) || a.payload.datasourceId }
                : a.payload,
            }));
          }
          if (c.children) {
            updated.children = c.children.map(fixDatasourceIds);
          }
          return updated;
        }

        // Build the diagram JSON (compatible with XYFlow)
        const diagramNodes = cloned.nodes.map((node: any) => ({
          id: node.newId,
          type: node.type === 'decision' ? 'decision' : 'orchestra',
          position: node.position,
          data: {
            label: node.label,
            nodeType: node.type,
            props: {
              ...(node.props || {}),
              screenDefinition: {
                rootComponents: node.screen.rootComponents.map(fixDatasourceIds),
                backgroundColor: node.screen.backgroundColor || '#0f172a',
                scrollable: true,
              },
            },
            actions: [],
          },
        }));

        const diagramEdges = cloned.edges.map((edge: any) => ({
          id: edge.newId,
          source: edge.source,
          target: edge.target,
          type: 'labeled',
          animated: false,
          ...(edge.sourceHandle ? { sourceHandle: edge.sourceHandle } : {}),
          ...(edge.targetHandle ? { targetHandle: edge.targetHandle } : {}),
          ...(edge.data ? { data: edge.data } : {}),
        }));

        // Save diagram to project
        await prisma.project.update({
          where: { id: project.id },
          data: {
            diagram: { nodes: diagramNodes, edges: diagramEdges, flowName: name } as any,
          },
        });
    }

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.issues },
        { status: 400 }
      );
    }
    console.error('[projects] POST error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
