import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { OrchestraFlowSchema } from '@orchestra/shared';

/** GET all flows */
export async function GET() {
  const flows = await prisma.flow.findMany({
    orderBy: [{ name: 'asc' }, { version: 'desc' }],
    select: {
      id: true,
      name: true,
      version: true,
      published: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(flows);
}

/** POST — create or update a flow (new version) */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const flow = OrchestraFlowSchema.parse(body);

    // Find latest version for this flow name
    const latest = await prisma.flow.findFirst({
      where: { name: flow.name },
      orderBy: { version: 'desc' },
    });

    const nextVersion = latest ? latest.version + 1 : 1;

    if (!body.projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    const record = await prisma.flow.create({
      data: {
        name: flow.name,
        version: nextVersion,
        data: { ...flow, version: nextVersion } as any,
        published: false,
        projectId: body.projectId,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid flow schema', details: error },
        { status: 400 }
      );
    }
    console.error('[flow] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
