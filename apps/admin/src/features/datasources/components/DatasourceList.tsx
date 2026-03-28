import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Globe } from 'lucide-react';

import type { Datasource } from '../hooks/useDatasources';

interface DatasourceListProps {
  datasources: Datasource[];
  selectedDsId: string | null;
  onSelect: (ds: Datasource) => void;
  onShowCreate: () => void;
}

export function DatasourceList({ datasources, selectedDsId, onSelect, onShowCreate }: DatasourceListProps) {
  return (
    <div className="w-64 border-r bg-card/60 backdrop-blur-sm">
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Collections
            </h3>
            <Button
              variant="ghost"
              size="xs"
              className="gap-1 text-primary"
              onClick={onShowCreate}
            >
              <Plus className="w-3 h-3" />
              New
            </Button>
          </div>

          {datasources.map((ds) => (
            <button
              key={ds.id}
              className={`w-full text-left px-3 py-2 rounded-md mb-1 text-sm transition-colors ${
                selectedDsId === ds.id
                  ? 'bg-secondary text-secondary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-secondary/50'
              }`}
              onClick={() => onSelect(ds)}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-medium truncate">{ds.name}</span>
                {ds.sourceType === 'rest' && (
                  <Globe className="w-3 h-3 text-primary shrink-0" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {ds._count?.entries ?? 0} rows
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
