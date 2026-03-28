import { Card, CardContent } from '@/components/ui/card';
import { Activity, Users, MousePointerClick, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyticsSummary } from '@orchestra/shared';

interface SessionStatsProps {
  data: AnalyticsSummary;
}

export function SessionStats({ data }: SessionStatsProps) {
  const avgEventsPerSession =
    data.totalSessions > 0
      ? Math.round(data.totalEvents / data.totalSessions)
      : 0;

  const clickEvents =
    data.eventsByType.find((e) => e.eventType === 'button_click')?.count ?? 0;

  const cards = [
    {
      icon: Activity,
      label: 'Total Events',
      value: data.totalEvents.toLocaleString(),
      color: 'text-primary',
      tint: 'bg-primary/5 border-primary/20',
    },
    {
      icon: Users,
      label: 'Sessions',
      value: data.totalSessions.toLocaleString(),
      color: 'text-violet-600 dark:text-violet-400',
      tint: 'bg-violet-500/5 border-violet-500/20',
    },
    {
      icon: MousePointerClick,
      label: 'Button Clicks',
      value: clickEvents.toLocaleString(),
      color: 'text-amber-600 dark:text-amber-400',
      tint: 'bg-amber-500/5 border-amber-500/20',
    },
    {
      icon: LayoutDashboard,
      label: 'Avg Events / Session',
      value: avgEventsPerSession.toLocaleString(),
      color: 'text-emerald-600 dark:text-emerald-400',
      tint: 'bg-emerald-500/5 border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className={cn('border', card.tint)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={cn(
                  'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                  card.tint,
                )}
              >
                <Icon className={cn('h-4 w-4', card.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
