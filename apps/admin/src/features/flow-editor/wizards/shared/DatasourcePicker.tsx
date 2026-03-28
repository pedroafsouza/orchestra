import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Database, Loader2 } from 'lucide-react';

interface DatasourceField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
}

export interface DatasourceInfo {
  id: string;
  name: string;
  fields: DatasourceField[];
}

interface DatasourcePickerProps {
  projectId: string;
  value: string | null;
  onChange: (ds: DatasourceInfo) => void;
}

export function DatasourcePicker({ projectId, value, onChange }: DatasourcePickerProps) {
  const [datasources, setDatasources] = useState<DatasourceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api<DatasourceInfo[]>(`/api/projects/${projectId}/datasources`)
      .then((data) => {
        if (!cancelled) {
          setDatasources(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load datasources');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading datasources...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive py-8 text-center">
        {error}
      </div>
    );
  }

  if (datasources.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No datasources found. Create one in the project settings first.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {datasources.map((ds) => (
        <button
          key={ds.id}
          type="button"
          onClick={() => onChange(ds)}
          className={`
            w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
            cursor-pointer text-left
            hover:scale-[1.01] hover:shadow-md
            ${
              value === ds.id
                ? 'border-indigo-500 shadow-md shadow-indigo-500/15 bg-indigo-500/5'
                : 'border-border/60 hover:border-indigo-400/40 bg-card'
            }
          `}
        >
          <div
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors
              ${value === ds.id ? 'bg-indigo-500/15 text-indigo-400' : 'bg-muted text-muted-foreground'}
            `}
          >
            <Database className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold truncate ${value === ds.id ? 'text-indigo-300' : 'text-foreground'}`}>
              {ds.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {ds.fields.length} field{ds.fields.length !== 1 ? 's' : ''}
            </div>
          </div>

          {value === ds.id && (
            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
