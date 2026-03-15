import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { OrchestraFlowSchema, maskSecrets } from '@orchestra/shared';
import { pruneFlow } from '@/lib/capabilities';

/** Public endpoint — no auth required. Used by mobile clients. */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const capabilitiesHeader = request.headers.get('x-client-capabilities');
    const appVersion = request.headers.get('x-app-version') || '1.0.0';

    let capabilities: string[] = [];
    if (capabilitiesHeader) {
      try {
        capabilities = JSON.parse(capabilitiesHeader);
      } catch {
        return NextResponse.json(
          { error: 'Invalid X-Client-Capabilities header' },
          { status: 400 }
        );
      }
    }

    // Find project by GUID
    const project = await prisma.project.findUnique({
      where: { guid: params.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch latest published flow for this project
    const flowRecord = await prisma.flow.findFirst({
      where: { projectId: project.id, published: true },
      orderBy: [{ version: 'desc' }],
    });

    if (!flowRecord) {
      return NextResponse.json(
        { error: 'No published flow found' },
        { status: 404 }
      );
    }

    const flow = OrchestraFlowSchema.parse(flowRecord.data);
    const prunedFlow = pruneFlow(flow, capabilities, appVersion);

    // Fetch datasources for this project
    const datasources = await prisma.datasource.findMany({
      where: { projectId: project.id },
      include: { entries: { orderBy: { sortOrder: 'asc' } } },
    });

    const response = {
      flow: prunedFlow,
      config: {
        mapboxToken: capabilities.includes('mapbox')
          ? process.env.MAPBOX_ACCESS_TOKEN
          : undefined,
      },
      datasources: datasources.map((ds) => ({
        id: ds.id,
        name: ds.name,
        fields: ds.fields,
        entries: ds.entries.map((e) => e.data),
      })),
    };

    console.log(
      '[flow/:id/latest] Served:',
      maskSecrets(JSON.stringify({ projectId: params.id, flowId: flow.id }))
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('[flow/:id/latest] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
