import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import {
  OrchestraFlowSchema,
  ClientCapabilitiesSchema,
  maskSecrets,
} from '@orchestra/shared';
import { pruneFlow } from '@/lib/capabilities';

export async function GET(request: NextRequest) {
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

    // Fetch the latest published flow
    const flowRecord = await prisma.flow.findFirst({
      where: { published: true },
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

    const response = {
      flow: prunedFlow,
      config: {
        mapboxToken: capabilities.includes('mapbox')
          ? process.env.MAPBOX_ACCESS_TOKEN
          : undefined,
      },
    };

    console.log(
      '[flow/latest] Served flow:',
      maskSecrets(JSON.stringify({ flowId: flow.id, version: flow.version }))
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('[flow/latest] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
