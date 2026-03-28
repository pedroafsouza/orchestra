import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { requireAuth } from '@/lib/session';
import { writeFile } from '@/lib/storage';

const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif',
  // Video
  'video/mp4', 'video/webm', 'video/quicktime',
  // Audio
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/json',
]);

function deriveCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : 'bin';
}

function assetUrl(projectId: string, assetId: string, type: 'file' | 'thumb') {
  return `/api/projects/${projectId}/assets/${assetId}/${type}`;
}

/** POST — upload a file */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `MIME type "${file.type}" is not allowed` },
        { status: 400 }
      );
    }

    const projectId = params.id;
    const category = deriveCategory(file.type);
    const ext = getExtension(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create asset record first to get the ID
    const asset = await prisma.asset.create({
      data: {
        projectId,
        filename: file.name,
        storagePath: '', // will update after we know the ID
        mimeType: file.type,
        category,
        size: buffer.length,
      },
    });

    const storagePath = `${projectId}/${asset.id}.${ext}`;
    await writeFile(storagePath, buffer);

    // Try to get image dimensions and generate thumbnail
    let width: number | undefined;
    let height: number | undefined;
    let thumbPath: string | undefined;

    if (category === 'image' && !file.type.includes('svg')) {
      try {
        const sharp = (await import('sharp')).default;
        const metadata = await sharp(buffer).metadata();
        width = metadata.width;
        height = metadata.height;

        // Generate thumbnail (max 200px wide)
        const thumbBuffer = await sharp(buffer)
          .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 70 })
          .toBuffer();
        thumbPath = `${projectId}/${asset.id}_thumb.jpg`;
        await writeFile(thumbPath, thumbBuffer);
      } catch {
        // sharp not available or image processing failed — skip
      }
    }

    // Update asset with storage path and optional image metadata
    const updated = await prisma.asset.update({
      where: { id: asset.id },
      data: {
        storagePath,
        ...(width != null ? { width } : {}),
        ...(height != null ? { height } : {}),
        ...(thumbPath ? { thumbPath } : {}),
      },
    });

    return NextResponse.json(
      {
        ...updated,
        url: assetUrl(projectId, updated.id, 'file'),
        thumbUrl: updated.thumbPath ? assetUrl(projectId, updated.id, 'thumb') : null,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[assets] POST error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** GET — list assets for a project */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    const where: any = { projectId: params.id };
    if (category) where.category = category;
    if (search) where.filename = { contains: search, mode: 'insensitive' };
    if (tag) where.tags = { has: tag };

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const result = assets.map((a) => ({
      ...a,
      url: assetUrl(params.id, a.id, 'file'),
      thumbUrl: a.thumbPath ? assetUrl(params.id, a.id, 'thumb') : null,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error('[assets] GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
