import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, FolderKanban, Users, Trash2, ClipboardList, Home, Search, ArrowUpDown, Clock, X } from 'lucide-react';

interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Deterministic gradient based on project name for a nice visual banner
const GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-600',
  'from-sky-500 to-blue-600',
  'from-pink-500 to-fuchsia-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-emerald-600',
  'from-violet-500 to-indigo-600',
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

// SVG illustration for template cards
function TemplateIllustration({ templateId }: { templateId: string }) {
  if (templateId === 'todo-list') {
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
        <ClipboardList className="w-5 h-5 text-white" />
      </div>
    );
  }
  if (templateId === 'bnb') {
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-md shadow-rose-500/20">
        <Home className="w-5 h-5 text-white" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-md">
      <Plus className="w-5 h-5 text-white" />
    </div>
  );
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

/* ── Create Project Flyout ── */
function CreateProjectFlyout({
  open,
  onClose,
  templates,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  templates: TemplateSummary[];
  onCreated: (project: any) => void;
}) {
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Reset state when flyout opens
  useEffect(() => {
    if (open) {
      setName('');
      setSelectedTemplate(null);
      setCreating(false);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const project = await api('/api/projects', {
        method: 'POST',
        body: { name, ...(selectedTemplate ? { templateId: selectedTemplate } : {}) },
      });
      onCreated(project);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create project');
      setCreating(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Flyout panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-foreground">New Project</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Project name */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Project name
            </label>
            <Input
              placeholder="My awesome app..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
              className="h-10"
            />
          </div>

          {/* Template selection */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Start from
            </p>
            <div className="space-y-2">
              {/* Blank option */}
              <button
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                  selectedTemplate === null
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
                onClick={() => setSelectedTemplate(null)}
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Blank</p>
                  <p className="text-[11px] text-muted-foreground">Empty project</p>
                </div>
              </button>

              {/* Templates */}
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                    selectedTemplate === tpl.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setSelectedTemplate(tpl.id)}
                >
                  <div className="shrink-0">
                    <TemplateIllustration templateId={tpl.id} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{tpl.name}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{tpl.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-border shrink-0">
          <Button
            className="flex-1"
            disabled={!name.trim() || creating}
            onClick={handleCreate}
          >
            {creating ? 'Creating...' : 'Create Project'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, setProjects, addProject, removeProject } = useProjectStore();
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'updated'>('updated');

  useEffect(() => {
    api('/api/projects')
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/templates`)
      .then((r) => r.json())
      .then(setTemplates)
      .catch((err) => console.error('Failed to fetch templates:', err));
  }, []);

  const handleProjectCreated = (project: any) => {
    addProject(project);
    setShowCreate(false);
    navigate(`/project/${project.id}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api(`/api/projects/${deleteTarget.id}`, { method: 'DELETE' });
      removeProject(deleteTarget.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredProjects = projects
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) =>
      sortBy === 'name'
        ? a.name.localeCompare(b.name)
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b flex items-center justify-between px-6 bg-card">
        <span className="text-lg font-bold text-primary">Orchestra</span>
        <ThemeToggle />
      </header>

      <main className="max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Search + Sort bar */}
        {projects.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === 'name' ? 'updated' : 'name')}
            >
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
              {sortBy === 'name' ? 'Name' : 'Last updated'}
            </Button>
          </div>
        )}

        {filteredProjects.length === 0 && projects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg mb-2">No projects yet</p>
            <p className="text-sm">Create your first project to get started.</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No projects matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const gradient = getGradient(project.name);
              const initials = getInitials(project.name);
              return (
                <Card
                  key={project.id}
                  className="cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-200 group overflow-hidden"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  {/* Decorative banner */}
                  <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-black/10 blur-sm" />
                    <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-white/10" />
                    <div className="absolute right-12 -bottom-6 w-20 h-20 rounded-full bg-black/10 blur-sm" />
                    <div className="absolute right-14 -bottom-4 w-16 h-16 rounded-full bg-white/10" />
                    <div className="absolute -left-4 top-6 w-14 h-14 rounded-2xl rotate-12 bg-white/[0.07]" />
                    <div className="absolute left-20 -top-3 w-10 h-10 rounded-lg rotate-45 bg-white/[0.06]" />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute left-4 bottom-3 text-3xl font-extrabold text-white/25 tracking-wider drop-shadow-sm">
                      {initials}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/70 hover:text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ id: project.id, name: project.name });
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold group-hover:text-primary transition-colors mb-0.5">
                      {project.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-mono mb-3">
                      {project.guid}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" />
                        {project._count?.flows ?? 0} flows
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project._count?.members ?? 0} members
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        {timeAgo(project.updatedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Project Flyout */}
      <CreateProjectFlyout
        open={showCreate}
        onClose={() => setShowCreate(false)}
        templates={templates}
        onCreated={handleProjectCreated}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>? This action cannot be undone and will remove all flows, datasources, and data associated with this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
