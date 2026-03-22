import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { requireAuth } from '@/lib/session';
import { z } from 'zod';

const CreateDatasourceSchema = z.object({
  name: z.string().min(1).max(100),
  fields: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(['text', 'number', 'image_url', 'boolean', 'date', 'rich_text', 'url', 'geolocation']),
      required: z.boolean().optional(),
    })
  ),
  sourceType: z.enum(['manual', 'rest']).default('manual'),
  sourceConfig: z.any().optional(),
});

/** GET — list datasources for a project */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const datasources = await prisma.datasource.findMany({
    where: { projectId: params.id },
    include: { _count: { select: { entries: true } } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(datasources);
}

/** POST — create a new datasource */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, fields, sourceType, sourceConfig } = CreateDatasourceSchema.parse(body);

    const ds = await prisma.datasource.create({
      data: {
        name,
        projectId: params.id,
        fields: fields as any,
        sourceType,
        ...(sourceConfig ? { sourceConfig: sourceConfig as any } : {}),
      },
    });

    return NextResponse.json(ds, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.issues },
        { status: 400 }
      );
    }
    console.error('[datasources] POST error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
