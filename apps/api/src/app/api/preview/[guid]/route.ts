import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';

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
