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

export function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, setProjects, addProject, removeProject } = useProjectStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [creatingFromTemplate, setCreatingFromTemplate] = useState(false);
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
    setCreatingFromTemplate(true);
    try {
      const project = await api('/api/projects', {
        method: 'POST',
        body: { name: tpl.name, templateId: tpl.id },
      });
      addProject(project);
      navigate(`/project/${project.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreatingFromTemplate(false);
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
              <div className="flex gap-3 mb-4">
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

              <div>
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
            </CardContent>
          </Card>
        )}

        {/* Example templates */}
        {templates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Start from an example
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {templates.map((tpl) => (
                <Card
                  key={tpl.id}
                  className="border-dashed border-2 cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                  onClick={() => handleCreateFromTemplate(tpl)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{tpl.icon}</span>
                      <div>
                        <p className="font-semibold group-hover:text-primary transition-colors">
                          {tpl.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{tpl.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                      Use template →
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg mb-2">No projects yet</p>
            <p className="text-sm">Create your first project to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ id: project.id, name: project.name });
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-3">
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
            ))}
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
