import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { requireAuth } from '@/lib/session';
import { readFile } from '@/lib/storage';

/** GET — serve the thumbnail file */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; assetId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const asset = await prisma.asset.findFirst({
      where: { id: params.assetId, projectId: params.id },
    });

    if (!asset || !asset.thumbPath) {
      return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 });
    }

    const buffer = await readFile(asset.thumbPath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('[asset/thumb] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
