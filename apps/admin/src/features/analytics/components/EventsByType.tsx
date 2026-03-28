import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface EventsByTypeProps {
  data: { eventType: string; count: number }[];
}

const TYPE_COLORS: Record<string, string> = {
  page_view: 'hsl(var(--primary))',
  button_click: '#f59e0b',
  navigation: '#8b5cf6',
  form_submit: '#10b981',
  datasource_action: '#06b6d4',
  checkbox_toggle: '#ec4899',
  switch_toggle: '#f97316',
  session_start: '#6366f1',
  session_end: '#64748b',
};

function formatLabel(type: string) {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function EventsByType({ data }: EventsByTypeProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatLabel(d.eventType),
    fill: TYPE_COLORS[d.eventType] || '#94a3b8',
  }));

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold mb-4">Events by Type</h3>
        {formatted.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-12">
            No events recorded yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={formatted} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {formatted.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
