import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { requireAuth } from '@/lib/session';
import { z } from 'zod';

const UpdateDatasourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  fields: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        type: z.enum([
          'text',
          'number',
          'image_url',
          'boolean',
          'date',
          'rich_text',
          'url',
          'geolocation',
        ]),
        required: z.boolean().optional(),
      })
    )
    .optional(),
});

/** PUT — update a datasource (name, fields) */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; dsId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const data = UpdateDatasourceSchema.parse(body);

    const ds = await prisma.datasource.update({
      where: { id: params.dsId, projectId: params.id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.fields ? { fields: data.fields as any } : {}),
      },
    });

    return NextResponse.json(ds);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.issues },
        { status: 400 }
      );
    }
    console.error('[datasource] PUT error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** DELETE — delete a datasource and all its entries */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; dsId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    await prisma.datasourceEntry.deleteMany({
      where: { datasourceId: params.dsId },
    });
    await prisma.datasource.delete({
      where: { id: params.dsId, projectId: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[datasource] DELETE error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
