import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { requireAuth } from '@/lib/session';

/** GET — query aggregated analytics for a project */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAuth();
  if (error) return error;

  const url = new URL(request.url);
  const days = Math.min(Number(url.searchParams.get('days') || '30'), 90);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const projectId = params.id;

  // Run all queries in parallel
  const [totalEvents, sessions, byType, byDay, topScreens, topComponents, navPaths] =
    await Promise.all([
      // Total events
      prisma.analyticsEvent.count({
        where: { projectId, timestamp: { gte: since } },
      }),

      // Unique sessions
      prisma.analyticsEvent.findMany({
        where: { projectId, timestamp: { gte: since } },
        distinct: ['sessionId'],
        select: { sessionId: true },
      }),

      // Events by type
      prisma.analyticsEvent.groupBy({
        by: ['eventType'],
        where: { projectId, timestamp: { gte: since } },
        _count: true,
        orderBy: { _count: { eventType: 'desc' } },
      }),

      // Events by day — limit rows to prevent OOM on large datasets
      prisma.analyticsEvent.findMany({
        where: { projectId, timestamp: { gte: since } },
        select: { timestamp: true },
        orderBy: { timestamp: 'asc' },
        take: 50_000,
      }),

      // Top screens
      prisma.analyticsEvent.groupBy({
        by: ['nodeId'],
        where: {
          projectId,
          timestamp: { gte: since },
          eventType: 'page_view',
          nodeId: { not: null },
        },
        _count: true,
        orderBy: { _count: { nodeId: 'desc' } },
        take: 10,
      }),

      // Top components
      prisma.analyticsEvent.groupBy({
        by: ['componentId', 'eventType'],
        where: {
          projectId,
          timestamp: { gte: since },
          componentId: { not: null },
          eventType: { in: ['button_click', 'checkbox_toggle', 'switch_toggle'] },
        },
        _count: true,
        orderBy: { _count: { componentId: 'desc' } },
        take: 10,
      }),

      // Navigation paths
      prisma.analyticsEvent.findMany({
        where: {
          projectId,
          timestamp: { gte: since },
          eventType: 'navigation',
        },
        select: { metadata: true },
      }),
    ]);

  // Aggregate events by day
  const dailyCounts = new Map<string, number>();
  for (const e of byDay) {
    const day = e.timestamp.toISOString().slice(0, 10);
    dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
  }

  // Aggregate navigation paths
  const pathCounts = new Map<string, { source: string; target: string; count: number }>();
  for (const e of navPaths) {
    const meta = e.metadata as any;
    if (meta?.sourceNodeId && meta?.targetNodeId) {
      const key = `${meta.sourceNodeId}->${meta.targetNodeId}`;
      const existing = pathCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        pathCounts.set(key, {
          source: meta.sourceNodeId,
          target: meta.targetNodeId,
          count: 1,
        });
      }
    }
  }

  return NextResponse.json({
    totalEvents,
    totalSessions: sessions.length,
    eventsByType: byType.map((g) => ({
      eventType: g.eventType,
      count: g._count,
    })),
    eventsByDay: Array.from(dailyCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    topScreens: topScreens.map((g) => ({
      nodeId: g.nodeId!,
      count: g._count,
    })),
    topComponents: topComponents.map((g) => ({
      componentId: g.componentId!,
      eventType: g.eventType,
      count: g._count,
    })),
    navigationPaths: Array.from(pathCounts.values()),
  });
}
