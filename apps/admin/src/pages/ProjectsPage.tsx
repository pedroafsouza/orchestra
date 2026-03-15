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
import { Plus, FolderKanban, Users, Trash2 } from 'lucide-react';

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

// Get initials (up to 2 chars) from project name
function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, setProjects, addProject, removeProject } = useProjectStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const project = await api('/api/projects', {
        method: 'POST',
        body: { name: newName, ...(selectedTemplate ? { templateId: selectedTemplate } : {}) },
      });
      addProject(project);
      setNewName('');
      setShowCreate(false);
      setSelectedTemplate(null);
      navigate(`/project/${project.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleCreateFromTemplate = async (tpl: TemplateSummary) => {
    try {
      const project = await api('/api/projects', {
        method: 'POST',
        body: { name: tpl.name, templateId: tpl.id },
      });
      addProject(project);
      setShowCreate(false);
      setSelectedTemplate(null);
      navigate(`/project/${project.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create project');
    }
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {showCreate && (
          <Card className="mb-6">
            <CardContent className="p-5">
              <div className="flex gap-3 mb-5">
                <Input
                  placeholder="Project name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
                <Button onClick={handleCreate}>Create</Button>
                <Button variant="secondary" onClick={() => { setShowCreate(false); setSelectedTemplate(null); }}>
                  Cancel
                </Button>
              </div>

              {/* Start from — Blank or template */}
              <div className="mb-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Start from
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  <button
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedTemplate === null
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                    onClick={() => setSelectedTemplate(null)}
                  >
                    <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                    <p className="text-sm font-medium">Blank</p>
                    <p className="text-[10px] text-muted-foreground">Empty project</p>
                  </button>
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedTemplate === tpl.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                      onClick={() => setSelectedTemplate(tpl.id)}
                    >
                      <div className="text-2xl mb-1">{tpl.icon}</div>
                      <p className="text-sm font-medium">{tpl.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{tpl.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick-use template cards */}
              {templates.length > 0 && (
                <div className="mt-5 pt-4 border-t">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Or quick-start from a template
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border
                          hover:border-primary hover:bg-primary/5 transition-all text-left group"
                        onClick={() => handleCreateFromTemplate(tpl)}
                      >
                        <span className="text-2xl shrink-0">{tpl.icon}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">
                            {tpl.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">{tpl.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg mb-2">No projects yet</p>
            <p className="text-sm">Create your first project to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => {
              const gradient = getGradient(project.name);
              const initials = getInitials(project.name);
              return (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group overflow-hidden"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  {/* Decorative banner */}
                  <div className={`h-28 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                    {/* Abstract decorative shapes */}
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                    <div className="absolute right-10 -bottom-4 w-16 h-16 rounded-full bg-white/10" />
                    <div className="absolute left-4 bottom-3 text-3xl font-bold text-white/30 tracking-wider">
                      {initials}
                    </div>
                    {/* Delete button */}
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
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" />
                        {project._count?.flows ?? 0} flows
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project._count?.members ?? 0} members
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

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
