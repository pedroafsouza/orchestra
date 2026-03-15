import { useFlowStore } from '@/store/flowStore';
import { OrchestraFlowSchema } from '@orchestra/shared';
import { api } from '@/lib/api';
import { ThemeToggle } from './ThemeToggle';
import { ArrowLeft, Download, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ToolbarProps {
  projectId: string;
  onBack: () => void;
}

export function Toolbar({ projectId, onBack }: ToolbarProps) {
  const flowName = useFlowStore((s) => s.flowName);
  const setFlowName = useFlowStore((s) => s.setFlowName);
  const getExportJSON = useFlowStore((s) => s.getExportJSON);

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
