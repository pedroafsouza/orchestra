import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { refreshIfStale } from '@/lib/datasource-fetch';

/**
 * Public endpoint — returns draft diagram + datasources for a project by GUID.
 * Used by the mobile preview iframe in the admin.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { guid: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { guid: params.guid },
      include: {
        datasources: {
          include: { entries: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Lazy-refresh stale REST datasources (non-blocking, best-effort)
    const restDatasources = project.datasources.filter(
      (ds) => ds.sourceType === 'rest' && ds.sourceConfig
    );
    if (restDatasources.length > 0) {
      await Promise.allSettled(
        restDatasources.map((ds) => refreshIfStale(ds.id))
      );

      // Re-fetch entries if any REST datasources were refreshed
      const refreshedProject = await prisma.project.findUnique({
        where: { guid: params.guid },
        include: {
          datasources: {
            include: { entries: { orderBy: { sortOrder: 'asc' } } },
          },
        },
      });
      if (refreshedProject) {
        const diagram = (refreshedProject.diagram as any) || { nodes: [], edges: [] };
        return NextResponse.json({
          projectId: refreshedProject.id,
          projectName: refreshedProject.name,
          guid: refreshedProject.guid,
          diagram,
          datasources: refreshedProject.datasources.map((ds) => ({
            id: ds.id,
            name: ds.name,
            fields: ds.fields,
            entries: ds.entries.map((e) => e.data),
          })),
        });
      }
    }

    const diagram = (project.diagram as any) || { nodes: [], edges: [] };

    return NextResponse.json({
      projectId: project.id,
      projectName: project.name,
      guid: project.guid,
      diagram,
      datasources: project.datasources.map((ds) => ({
        id: ds.id,
        name: ds.name,
        fields: ds.fields,
        entries: ds.entries.map((e) => e.data),
      })),
    });
  } catch (error) {
    console.error('[preview/:guid] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
