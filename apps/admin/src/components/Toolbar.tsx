import { useFlowStore } from '@/store/flowStore';
import { OrchestraFlowSchema } from '@orchestra/shared';
import { api } from '@/lib/api';

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
    <header className="h-14 bg-primary-900 border-b border-primary-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          className="text-primary-400 hover:text-white text-sm transition-colors"
          onClick={onBack}
        >
          &larr; Back
        </button>
        <span className="text-primary-600">|</span>
        <span className="text-lg font-bold text-accent-400">Orchestra</span>
        <input
          className="px-2 py-1 text-sm bg-primary-800 border border-primary-600 rounded text-white"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
        />
        <span className="text-xs text-primary-500 italic">
          Double-click a node to edit its screen
        </span>
      </div>
      <div className="flex gap-2">
        <button
          className="px-4 py-1.5 text-sm rounded bg-primary-700 hover:bg-primary-600 text-white transition-colors"
          onClick={handleExport}
        >
          Export JSON
        </button>
        <button
          className="px-4 py-1.5 text-sm rounded bg-accent-600 hover:bg-accent-500 text-white font-medium transition-colors"
          onClick={handleDeploy}
        >
          Deploy
        </button>
      </div>
    </header>
  );
}
