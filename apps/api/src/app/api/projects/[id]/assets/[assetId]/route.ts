import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { requireAuth } from '@/lib/session';
import { deleteFile } from '@/lib/storage';
import { z } from 'zod';

const UpdateAssetSchema = z.object({
  alt: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

function assetUrl(projectId: string, assetId: string, type: 'file' | 'thumb') {
  return `/api/projects/${projectId}/assets/${assetId}/${type}`;
}

/** GET — get asset metadata */
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

    return NextResponse.json({
      ...asset,
      url: assetUrl(params.id, asset.id, 'file'),
      thumbUrl: asset.thumbPath ? assetUrl(params.id, asset.id, 'thumb') : null,
    });
  } catch (err) {
    console.error('[asset] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PATCH — update alt text and tags */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; assetId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const data = UpdateAssetSchema.parse(body);

    const asset = await prisma.asset.update({
      where: { id: params.assetId, projectId: params.id },
      data: {
        ...(data.alt !== undefined ? { alt: data.alt } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
      },
    });

    return NextResponse.json({
      ...asset,
      url: assetUrl(params.id, asset.id, 'file'),
      thumbUrl: asset.thumbPath ? assetUrl(params.id, asset.id, 'thumb') : null,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.issues },
        { status: 400 }
      );
    }
    console.error('[asset] PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE — delete asset record and files */
export async function DELETE(
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

    // Delete files from disk
    await deleteFile(asset.storagePath);
    if (asset.thumbPath) {
      await deleteFile(asset.thumbPath);
    }

    // Delete DB record
    await prisma.asset.delete({ where: { id: asset.id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[asset] DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
