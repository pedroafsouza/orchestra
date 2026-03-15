import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { OrchestraFlowSchema } from '@orchestra/shared';
import { requireAuth } from '@/lib/session';

/** GET — list flows for a project */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const flows = await prisma.flow.findMany({
    where: { projectId: params.id },
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

/** POST — create a new flow version in a project */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const flow = OrchestraFlowSchema.parse(body);

    const latest = await prisma.flow.findFirst({
      where: { projectId: params.id, name: flow.name },
      orderBy: { version: 'desc' },
    });

    const nextVersion = latest ? latest.version + 1 : 1;

    const record = await prisma.flow.create({
      data: {
        name: flow.name,
        version: nextVersion,
        data: { ...flow, version: nextVersion } as any,
        published: false,
        projectId: params.id,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid flow schema', details: err },
        { status: 400 }
      );
    }
    console.error('[projects/:id/flows] POST error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
