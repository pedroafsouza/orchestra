import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';

/** POST — ingest a batch of analytics events (public endpoint for mobile preview) */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const events: any[] = body.events;

  if (!Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: 'events array required' }, { status: 400 });
  }

  // Cap batch size to prevent abuse
  const batch = events.slice(0, 100).map((e) => ({
    projectId: params.id,
    sessionId: String(e.sessionId || ''),
    eventType: String(e.eventType || 'unknown'),
    nodeId: e.nodeId || null,
    componentId: e.componentId || null,
    metadata: e.metadata || null,
    deviceInfo: e.deviceInfo || null,
    timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
  }));

  await prisma.analyticsEvent.createMany({ data: batch });

  return NextResponse.json({ ok: true, count: batch.length });
}
