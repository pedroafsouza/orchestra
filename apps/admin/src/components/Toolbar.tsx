import { useState } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { OrchestraFlowSchema } from '@orchestra/shared';
import { api } from '@/lib/api';
import { ThemeToggle } from './ThemeToggle';
import { ArrowLeft, Download, Rocket, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';


interface ToolbarProps {
  projectId: string;
  onBack: () => void;
}

export function Toolbar({ projectId, onBack }: ToolbarProps) {
  const flowName = useFlowStore((s) => s.flowName);
  const setFlowName = useFlowStore((s) => s.setFlowName);
  const getExportJSON = useFlowStore((s) => s.getExportJSON);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    const json = getExportJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flowName.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeploy = async () => {
    const json = getExportJSON();

    const result = OrchestraFlowSchema.safeParse(json);
    if (!result.success) {
      toast({
        title: 'Schema validation failed',
        description: result.error.issues.map((i) => i.message).join(', '),
        variant: 'destructive',
      });
      return;
    }

    setDeploying(true);
    try {
      const record = await api(`/api/projects/${projectId}/flows`, {
        method: 'POST',
        body: json,
      });

      await api(`/api/flow/${record.id}/publish`, { method: 'POST' });

      toast({
        title: `Flow deployed successfully (v${record.version})`,
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Deploy failed',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    } finally {
      setDeploying(false);
    }
  };

  const handleLivePreview = async () => {
    setPreviewLoading(true);
    try {
      // Pre-flight check 1: At least one node
      if (nodes.length === 0) {
        toast({ title: 'Cannot preview', description: 'No nodes in the flow. Add at least one node.', variant: 'destructive' });
        return;
      }

      // Pre-flight check 2: Entry node exists (landing type preferred)
      const hasLanding = nodes.some((n) => n.data.nodeType === 'landing');
      if (!hasLanding) {
        toast({ title: 'Cannot preview', description: 'No landing node found. Add a landing node as the entry point.', variant: 'destructive' });
        return;
      }

      // Pre-flight check 3: All navigateTo references are valid
      const nodeIds = new Set(nodes.map((n) => n.id));
      const invalidRefs: string[] = [];
      for (const node of nodes) {
        const screen = node.data.props?.screenDefinition;
        if (screen?.rootComponents) {
          checkNavigateRefs(screen.rootComponents, nodeIds, invalidRefs);
        }
      }
      if (invalidRefs.length > 0) {
        toast({ title: 'Cannot preview', description: `Invalid navigation references: ${invalidRefs.join(', ')}`, variant: 'destructive' });
        return;
      }

      // Pre-flight check 4: Flow is deployed
      try {
        const flows = await api(`/api/projects/${projectId}/flows`);
        const hasPublished = Array.isArray(flows) && flows.some((f: any) => f.published);
        if (!hasPublished) {
          toast({ title: 'Cannot preview', description: 'Please deploy your flow first before previewing.', variant: 'destructive' });
          return;
        }
      } catch {
        toast({ title: 'Cannot preview', description: 'Please deploy your flow first before previewing.', variant: 'destructive' });
        return;
      }

      // All checks passed — open preview in admin
      window.open(`/project/${projectId}/preview`, '_blank');
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b bg-card/80 backdrop-blur-md border-border">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>
        <span className="text-muted-foreground/40">|</span>
        <span className="text-lg font-bold text-primary">Orchestra</span>
        <Input
          className="h-8 w-48 text-sm"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
        />
        <span className="text-xs text-muted-foreground italic">
          Double-click a node to edit its screen
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="outline"
          size="sm"
          onClick={handleLivePreview}
          disabled={previewLoading}
          className="gap-1.5"
        >
          {previewLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          Live Preview
        </Button>
        <Button variant="secondary" size="sm" onClick={handleExport} className="gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
        <Button size="sm" onClick={handleDeploy} disabled={deploying} className="gap-1.5">
          {deploying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
          {deploying ? 'Deploying...' : 'Deploy'}
        </Button>
      </div>
    </header>
  );
}

/** Recursively check that all navigateTo props reference valid node IDs */
function checkNavigateRefs(
  components: any[],
  validIds: Set<string>,
  invalid: string[],
) {
  for (const c of components) {
    if (c.type === 'button' && c.props?.navigateTo) {
      if (!validIds.has(c.props.navigateTo)) {
        invalid.push(`Button "${c.props.label || c.id}" → "${c.props.navigateTo}" (not found)`);
      }
    }
    if (c.children) {
      checkNavigateRefs(c.children, validIds, invalid);
    }
  }
}
