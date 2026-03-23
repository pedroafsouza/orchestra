import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  PenLine,
  Database,
  Play,
  Settings,
  LayoutDashboard,
  Table2,
  Clock,
  Copy,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface DashboardStats {
  screens: number;
  datasources: number;
  entries: number;
  lastUpdated: string;
}

/* ─── Stat Card ─── */

function StatCard({
  icon: Icon,
  value,
  label,
  color,
  tint,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color: string;
  tint: string;
}) {
  return (
    <Card className={cn('border', tint)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', tint)}>
          <Icon className={cn('h-4 w-4', color)} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Action Card ─── */

function ActionCard({
  icon: Icon,
  iconBg,
  title,
  desc,
  onClick,
}: {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer text-left transition-all duration-200 group shadow-sm dark:shadow-black/20 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/40"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold group-hover:text-primary transition-colors mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

/* ─── Dashboard Header ─── */

function DashboardHeader({
  projectName,
  projectGuid,
  onBack,
}: {
  projectName: string;
  projectGuid: string;
  onBack: () => void;
}) {
  return (
    <header className="h-14 border-b flex items-center justify-between px-6 bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Projects
        </Button>
        <span className="text-border">/</span>
        <span className="font-semibold">{projectName}</span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground"
          onClick={() => navigator.clipboard.writeText(projectGuid)}
          title="Copy project ID"
        >
          <Copy className="h-3 w-3" />
          Copy ID
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}

/* ─── Deploy Endpoint ─── */

function DeployEndpoint({ endpoint }: { endpoint: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(`GET ${endpoint}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Badge variant="secondary" className="shrink-0 text-[10px] uppercase tracking-wider">
            GET
          </Badge>
          <code className="text-sm font-mono text-primary truncate">{endpoint}</code>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Fetch the published flow for this project
          </p>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={handleCopy}>
            <Copy className="h-3 w-3" />
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main Page ─── */

export function ProjectDashboardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject } = useProjectStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!projectId) return;
    api(`/api/projects/${projectId}`)
      .then(setCurrentProject)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (!projectId || !currentProject) return;

    Promise.all([
      api<any>(`/api/projects/${projectId}/diagram`).catch(() => null),
      api<any[]>(`/api/projects/${projectId}/datasources`).catch(() => []),
    ]).then(([diagram, datasources]) => {
      const screens = diagram?.nodes?.length ?? 0;
      const dsList = Array.isArray(datasources) ? datasources : [];
      const dsCount = dsList.length;
      const entries = dsList.reduce(
        (sum: number, ds: any) => sum + (ds._count?.entries ?? 0),
        0,
      );
      setStats({
        screens,
        datasources: dsCount,
        entries,
        lastUpdated: currentProject.updatedAt,
      });
    });
  }, [projectId, currentProject]);

  if (loading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        Loading...
      </div>
    );
  }

  const actionCards = [
    {
      icon: PenLine,
      iconBg: 'bg-primary/10 text-primary',
      title: 'Flow Editor',
      desc: 'Design screen flows and navigation graphs',
      onClick: () => navigate(`/project/${projectId}/flow`),
    },
    {
      icon: Database,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      title: 'Datasources',
      desc: 'Manage collections and content',
      onClick: () => navigate(`/project/${projectId}/datasources`),
    },
    {
      icon: Play,
      iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      title: 'Live Preview',
      desc: 'Test your app in an interactive simulator',
      onClick: () => navigate(`/project/${projectId}/preview`),
    },
    {
      icon: BarChart3,
      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
      title: 'Analytics',
      desc: 'Track user interactions and view insights',
      onClick: () => navigate(`/project/${projectId}/analytics`),
    },
    {
      icon: Settings,
      iconBg: 'bg-muted text-muted-foreground',
      title: 'Settings',
      desc: 'Team members, deploy config, API keys',
      onClick: () => navigate(`/project/${projectId}/settings`),
    },
  ];

  const statCards = [
    {
      icon: LayoutDashboard,
      value: stats?.screens ?? '-',
      label: 'Screens',
      color: 'text-primary',
      tint: 'bg-primary/5 border-primary/20',
    },
    {
      icon: Database,
      value: stats?.datasources ?? '-',
      label: 'Datasources',
      color: 'text-emerald-600 dark:text-emerald-400',
      tint: 'bg-emerald-500/5 border-emerald-500/20',
    },
    {
      icon: Table2,
      value: stats?.entries ?? '-',
      label: 'Entries',
      color: 'text-amber-600 dark:text-amber-400',
      tint: 'bg-amber-500/5 border-amber-500/20',
    },
    {
      icon: Clock,
      value: stats?.lastUpdated ? timeAgo(stats.lastUpdated) : '-',
      label: 'Last Updated',
      color: 'text-muted-foreground',
      tint: 'bg-muted/50 border-border',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader
        projectName={currentProject.name}
        projectGuid={currentProject.guid}
        onBack={() => navigate('/')}
      />

      <main className="max-w-5xl mx-auto p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actionCards.map((card) => (
            <ActionCard key={card.title} {...card} />
          ))}
        </div>

        <DeployEndpoint endpoint={`/api/flow/${currentProject.guid}/latest`} />
      </main>
    </div>
  );
}
