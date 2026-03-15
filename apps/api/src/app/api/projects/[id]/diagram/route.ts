import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { requireAuth } from '@/lib/session';

/** GET — load the draft diagram state for a project */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const project = await prisma.project.findUnique({
    where: { id: params.id },
  });

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json((project as any).diagram || null);
}

/** PUT — save the draft diagram state */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await request.json();

  const project = await prisma.project.update({
    where: { id: params.id },
    data: { diagram: body },
  });

  return NextResponse.json({ ok: true });
}
