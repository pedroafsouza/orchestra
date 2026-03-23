import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { SessionStats } from '@/components/analytics/SessionStats';
import { EventTimeline } from '@/components/analytics/EventTimeline';
import { EventsByType } from '@/components/analytics/EventsByType';
import { TopScreens } from '@/components/analytics/TopScreens';
import { NavigationFlow } from '@/components/analytics/NavigationFlow';
import type { AnalyticsSummary } from '@orchestra/shared';

const PERIOD_OPTIONS = [
  { label: '7d', days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

export function AnalyticsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject } = useProjectStore();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!projectId) return;
    if (!currentProject || currentProject.id !== projectId) {
      api(`/api/projects/${projectId}`)
        .then(setCurrentProject)
        .catch(() => navigate('/'));
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    fetchAnalytics();
  }, [projectId, days]);

  async function fetchAnalytics() {
    if (!projectId) return;
    setLoading(true);
    try {
      const result = await api<AnalyticsSummary>(
        `/api/projects/${projectId}/analytics?days=${days}`,
      );
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b flex items-center justify-between px-6 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => navigate(`/project/${projectId}`)}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Button>
          <span className="text-border">/</span>
          <span className="font-semibold">
            {currentProject?.name ?? 'Project'}
          </span>
          <span className="text-border">/</span>
          <span className="text-sm text-muted-foreground">Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                onClick={() => setDays(opt.days)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  days === opt.days
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
            />
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8 space-y-6">
        {loading && !data ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <>
            <SessionStats data={data} />
            <EventTimeline data={data.eventsByDay} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <EventsByType data={data.eventsByType} />
              <NavigationFlow paths={data.navigationPaths} />
            </div>
            <TopScreens
              screens={data.topScreens}
              components={data.topComponents}
            />
          </>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-sm">No analytics data available yet.</p>
            <p className="text-xs mt-1">
              Events will appear here once users interact with the Live Preview.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
