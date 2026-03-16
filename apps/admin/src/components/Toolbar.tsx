import { useState } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { OrchestraFlowSchema } from '@orchestra/shared';
import { api } from '@/lib/api';
import { ThemeToggle } from './ThemeToggle';
import { ArrowLeft, Download, Rocket, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EXPO_DEV_URL = import.meta.env.VITE_EXPO_DEV_URL || 'http://localhost:8081';

interface ToolbarProps {
  projectId: string;
  projectGuid: string;
  onBack: () => void;
}

export function Toolbar({ projectId, projectGuid, onBack }: ToolbarProps) {
  const flowName = useFlowStore((s) => s.flowName);
  const setFlowName = useFlowStore((s) => s.setFlowName);
  const getExportJSON = useFlowStore((s) => s.getExportJSON);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const [previewLoading, setPreviewLoading] = useState(false);

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
      alert(`Schema validation failed:\n${JSON.stringify(result.error.issues, null, 2)}`);
      return;
    }

    try {
      const record = await api(`/api/projects/${projectId}/flows`, {
        method: 'POST',
        body: json,
      });

      await api(`/api/flow/${record.id}/publish`, { method: 'POST' });

      alert(`Flow deployed! Version: ${record.version}`);
    } catch (err) {
      alert(`Deploy error: ${err instanceof Error ? err.message : err}`);
    }
  };

  const handleLivePreview = async () => {
    setPreviewLoading(true);
    try {
      // Pre-flight check 1: At least one node
      if (nodes.length === 0) {
        alert('Cannot preview: No nodes in the flow. Add at least one node.');
        return;
      }

      // Pre-flight check 2: Entry node exists (landing type preferred)
      const hasLanding = nodes.some((n) => n.data.nodeType === 'landing');
      if (!hasLanding) {
        alert('Cannot preview: No landing node found. Add a landing node as the entry point.');
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
        alert(`Cannot preview: Invalid navigation references found:\n${invalidRefs.join('\n')}`);
        return;
      }

      // Pre-flight check 4: Flow is deployed
      try {
        const flows = await api(`/api/projects/${projectId}/flows`);
        const hasPublished = Array.isArray(flows) && flows.some((f: any) => f.published);
        if (!hasPublished) {
          alert('Please deploy your flow first before previewing.');
          return;
        }
      } catch {
        alert('Please deploy your flow first before previewing.');
        return;
      }

      // Pre-flight check 5: Expo dev server is reachable
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await fetch(EXPO_DEV_URL, { mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeout);
      } catch {
        alert(
          `Expo dev server is not reachable at ${EXPO_DEV_URL}.\n\n` +
          'Start it with: cd apps/mobile && npm start -- --web\n\n' +
          'Or set VITE_EXPO_DEV_URL in your .env to the correct address.'
        );
        return;
      }

      // All checks passed — open preview
      window.open(`${EXPO_DEV_URL}/preview/${projectGuid}`, '_blank');
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b bg-card border-border">
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
        <Button size="sm" onClick={handleDeploy} className="gap-1.5">
          <Rocket className="w-3.5 h-3.5" />
          Deploy
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
