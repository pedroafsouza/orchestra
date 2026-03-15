import { NextResponse } from 'next/server';
import { TEMPLATES } from '@orchestra/shared';

/** GET /api/templates — returns available project templates */
export async function GET() {
  const summaries = TEMPLATES.map(({ id, name, description, icon }) => ({
    id,
    name,
    description,
    icon,
  }));
  return NextResponse.json(summaries);
}
