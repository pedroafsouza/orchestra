import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/features/projects/projectStore';
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
import { ArrowLeft, Save, Trash2, Copy, Check, RotateCcw, Clock, Rocket } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FlowVersion {
  id: string;
  version: number;
  published: boolean;
  createdAt: string;
  name: string;
}

export function SettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject } = useProjectStore();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [flowVersions, setFlowVersions] = useState<FlowVersion[]>([]);
  const [republishing, setRepublishing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      api(`/api/projects/${projectId}`),
      api<FlowVersion[]>(`/api/projects/${projectId}/flows`).catch(() => []),
    ])
      .then(([p, flows]) => {
        setCurrentProject(p);
        setName(p.name);
        setFlowVersions((flows || []).sort((a: FlowVersion, b: FlowVersion) => b.version - a.version));
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

  const handleRepublish = async (flowId: string, version: number) => {
    setRepublishing(flowId);
    try {
      await api(`/api/flow/${flowId}/publish`, { method: 'POST' });
      // Refresh versions
      const flows = await api<FlowVersion[]>(`/api/projects/${projectId}/flows`);
      setFlowVersions((flows || []).sort((a: FlowVersion, b: FlowVersion) => b.version - a.version));
      toast({ title: `Version ${version} republished`, variant: 'success' });
    } catch (err) {
      toast({ title: 'Failed to republish', description: String(err), variant: 'destructive' });
    } finally {
      setRepublishing(null);
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

        {/* Deploy History */}
        {flowVersions.length > 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Deploy History</h2>
              </div>
              <div className="divide-y divide-border rounded-lg border overflow-hidden">
                {flowVersions.map((flow) => (
                  <div
                    key={flow.id}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-medium">v{flow.version}</span>
                      {flow.published && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Live
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(flow.createdAt).toLocaleString()}
                      </span>
                      {!flow.published && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={republishing === flow.id}
                          onClick={() => handleRepublish(flow.id, flow.version)}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          {republishing === flow.id ? 'Publishing...' : 'Rollback'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Click "Rollback" to republish a previous version.
              </p>
            </CardContent>
          </Card>
        )}

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
