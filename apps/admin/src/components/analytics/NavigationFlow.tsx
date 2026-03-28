import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationFlowProps {
  paths: { source: string; target: string; count: number }[];
  nodeLabels?: Record<string, string>;
}

export function NavigationFlow({ paths, nodeLabels = {} }: NavigationFlowProps) {
  const sorted = [...paths].sort((a, b) => b.count - a.count).slice(0, 10);
  const maxCount = sorted[0]?.count || 1;

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold mb-4">Navigation Paths</h3>
        {sorted.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No navigation events yet.
          </p>
        ) : (
          <div className="space-y-2">
            {sorted.map((p) => (
              <div
                key={`${p.source}-${p.target}`}
                className="flex items-center gap-2 text-xs"
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium truncate" title={p.source}>
                    {nodeLabels[p.source] || p.source}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="px-2 py-1 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium truncate" title={p.target}>
                    {nodeLabels[p.target] || p.target}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(p.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-8 text-right">{p.count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
