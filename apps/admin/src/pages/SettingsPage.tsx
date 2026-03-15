import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import { ArrowLeft, Save, Trash2, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function SettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject } = useProjectStore();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!projectId) return;
    api(`/api/projects/${projectId}`)
      .then((p) => {
        setCurrentProject(p);
        setName(p.name);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleSave = async () => {
    if (!name.trim() || !projectId) return;
    try {
      const updated = await api(`/api/projects/${projectId}`, {
        method: 'PUT',
        body: { name },
      });
      setCurrentProject({ ...currentProject!, name: updated.name });
      toast({ title: 'Settings saved', variant: 'success' });
    } catch (err) {
      toast({ title: 'Failed to save', description: String(err), variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;
    try {
      await api(`/api/projects/${projectId}`, { method: 'DELETE' });
      navigate('/');
    } catch (err) {
      toast({ title: 'Failed to delete', description: String(err), variant: 'destructive' });
    }
  };

  const handleCopyGuid = () => {
    if (!currentProject) return;
    navigator.clipboard.writeText(currentProject.guid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b flex items-center justify-between px-6 bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${projectId}`)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Dashboard
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <span className="font-semibold">Settings</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-2xl mx-auto p-8 space-y-6">
        {/* General */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">General</h2>
            <div className="space-y-2">
              <Label>Project name</Label>
              <div className="flex gap-3">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1.5" />
                  Save
                </Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Project ID (GUID)</Label>
              <div className="flex gap-3">
                <Input value={currentProject.guid} readOnly className="font-mono text-sm" />
                <Button variant="outline" onClick={handleCopyGuid}>
                  {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this ID to fetch the published flow via the API.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoint */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">API Endpoint</h2>
            <div className="rounded-lg bg-muted px-4 py-3 font-mono text-sm text-primary">
              GET /api/flow/{currentProject.guid}/latest
            </div>
            <p className="text-xs text-muted-foreground">
              Use this endpoint in your mobile app to fetch the published flow for this project.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">
              Deleting this project will permanently remove all flows, datasources, entries, and
              published versions. This action cannot be undone.
            </p>
            <Button variant="destructive" onClick={() => setShowDelete(true)}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Project
            </Button>
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{currentProject.name}"</strong>? This action
              cannot be undone.
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
