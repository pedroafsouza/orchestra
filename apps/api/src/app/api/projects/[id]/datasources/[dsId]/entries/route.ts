import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { requireAuth } from '@/lib/session';

/** GET — list entries for a datasource */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; dsId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const entries = await prisma.datasourceEntry.findMany({
    where: { datasourceId: params.dsId },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json(entries);
}

/** POST — create a new entry */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; dsId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();

    // Get count for sort order
    const count = await prisma.datasourceEntry.count({
      where: { datasourceId: params.dsId },
    });

    const entry = await prisma.datasourceEntry.create({
      data: {
        datasourceId: params.dsId,
        data: body.data || {},
        sortOrder: count,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    console.error('[entries] POST error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** PUT — update an entry (expects { entryId, data }) */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; dsId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { entryId, data } = body;

    const entry = await prisma.datasourceEntry.update({
      where: { id: entryId },
      data: { data },
    });

    return NextResponse.json(entry);
  } catch (err) {
    console.error('[entries] PUT error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** DELETE — delete an entry (expects ?entryId=...) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; dsId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const entryId = searchParams.get('entryId');
  if (!entryId) {
    return NextResponse.json({ error: 'entryId required' }, { status: 400 });
  }

  await prisma.datasourceEntry.delete({ where: { id: entryId } });

  return NextResponse.json({ ok: true });
}
