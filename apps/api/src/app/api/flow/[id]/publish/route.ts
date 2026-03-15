import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';

/** POST — publish a specific flow version */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const flow = await prisma.flow.findUnique({
      where: { id: params.id },
    });

    if (!flow) {
      return NextResponse.json({ error: 'Flow not found' }, { status: 404 });
    }

    // Unpublish all other versions of this flow name
    await prisma.flow.updateMany({
      where: { name: flow.name, published: true },
      data: { published: false },
    });

    // Publish this version
    const updated = await prisma.flow.update({
      where: { id: params.id },
      data: { published: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[flow/publish] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
