import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, PenLine, Database, Play, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProjectDashboardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject } = useProjectStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    api(`/api/projects/${projectId}`)
      .then(setCurrentProject)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        Loading...
      </div>
    );
  }

  const cards = [
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
      icon: Settings,
      iconBg: 'bg-muted text-muted-foreground',
      title: 'Settings',
      desc: 'Team members, deploy config, API keys',
      onClick: () => navigate(`/project/${projectId}/settings`),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b flex items-center justify-between px-6 bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Projects
          </Button>
          <span className="text-border">/</span>
          <span className="font-semibold">{currentProject.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {currentProject.guid}
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="cursor-pointer text-left transition-all group hover:shadow-md hover:border-primary/50"
                onClick={card.onClick}
              >
                <CardContent className="p-6">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                      card.iconBg
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{card.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Deploy Endpoint
            </h2>
            <code className="block px-4 py-3 rounded-lg text-sm text-primary font-mono bg-muted">
              GET /api/flow/{currentProject.guid}/latest
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Use this endpoint in your mobile app to fetch the published flow for this project.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
