import { useFlowStore } from '@/store/flowStore';
import { OrchestraFlowSchema } from '@orchestra/shared';
import { api } from '@/lib/api';
import { ThemeToggle } from './ThemeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faDownload, faRocket } from '@fortawesome/free-solid-svg-icons';

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
    <header className="h-14 flex items-center justify-between px-4 border-b
      bg-white border-primary-200
      dark:bg-primary-900 dark:border-primary-700">
      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-1.5 text-primary-500 hover:text-primary-800 dark:text-primary-400 dark:hover:text-white text-sm transition-colors"
          onClick={onBack}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
          Back
        </button>
        <span className="text-primary-300 dark:text-primary-600">|</span>
        <span className="text-lg font-bold text-accent-600 dark:text-accent-400">Orchestra</span>
        <input
          className="px-2 py-1 text-sm rounded-lg border
            bg-primary-50 border-primary-300 text-primary-800
            dark:bg-primary-800 dark:border-primary-600 dark:text-white
            focus:outline-none focus:ring-1 focus:ring-accent-500"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
        />
        <span className="text-xs text-primary-400 dark:text-primary-500 italic">
          Double-click a node to edit its screen
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg transition-colors
            bg-primary-100 hover:bg-primary-200 text-primary-700
            dark:bg-primary-700 dark:hover:bg-primary-600 dark:text-white"
          onClick={handleExport}
        >
          <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
          Export
        </button>
        <button
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg bg-accent-600 hover:bg-accent-500 text-white font-medium transition-colors"
          onClick={handleDeploy}
        >
          <FontAwesomeIcon icon={faRocket} className="w-3.5 h-3.5" />
          Deploy
        </button>
      </div>
    </header>
  );
}
