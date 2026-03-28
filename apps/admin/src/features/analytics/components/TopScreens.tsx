import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TopScreensProps {
  screens: { nodeId: string; count: number }[];
  components: { componentId: string; eventType: string; count: number }[];
  nodeLabels?: Record<string, string>;
}

export function TopScreens({ screens, components, nodeLabels = {} }: TopScreensProps) {
  const maxScreenCount = screens[0]?.count || 1;
  const maxCompCount = components[0]?.count || 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-4">Top Screens</h3>
          {screens.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              No page views yet.
            </p>
          ) : (
            <div className="space-y-3">
              {screens.map((s, i) => (
                <div key={s.nodeId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium truncate" title={s.nodeId}>
                      {nodeLabels[s.nodeId] || s.nodeId}
                    </span>
                    <span className="text-muted-foreground ml-2 shrink-0">
                      {s.count}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        i === 0
                          ? 'bg-primary'
                          : 'bg-primary/60',
                      )}
                      style={{ width: `${(s.count / maxScreenCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-4">Top Components</h3>
          {components.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              No interactions yet.
            </p>
          ) : (
            <div className="space-y-3">
              {components.map((c, i) => (
                <div key={`${c.componentId}-${c.eventType}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium truncate">
                      {c.componentId}
                    </span>
                    <span className="text-muted-foreground ml-2 shrink-0">
                      {c.count} {c.eventType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        i === 0
                          ? 'bg-amber-500'
                          : 'bg-amber-500/60',
                      )}
                      style={{ width: `${(c.count / maxCompCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
