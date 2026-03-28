import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { requireAuth } from '@/lib/session';
import { readFile } from '@/lib/storage';

/** GET — serve the actual binary file */
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

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const buffer = await readFile(asset.storagePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': asset.mimeType,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${asset.filename}"`,
      },
    });
  } catch (err) {
    console.error('[asset/file] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
