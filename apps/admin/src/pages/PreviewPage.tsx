import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { PreviewRuntime } from '@/components/Preview/PreviewRuntime';
import { DeviceFrame } from '@/components/Preview/DeviceFrame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Smartphone, Tablet, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrchestraNodeData } from '@/store/flowStore';
import type { Node, Edge } from '@xyflow/react';

type Breakpoint = 'phone' | 'tablet' | 'desktop';

interface DatasourceEntry {
  id: string;
  [key: string]: any;
}

interface Datasource {
  id: string;
  name: string;
}

export function PreviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [nodes, setNodes] = useState<Node<OrchestraNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [datasourceData, setDatasourceData] = useState<Map<string, DatasourceEntry[]>>(new Map());
  const [projectName, setProjectName] = useState('');
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('phone');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    async function load() {
      try {
        const [project, diagram, datasources] = await Promise.all([
          api<{ name: string }>(`/api/projects/${projectId}`),
          api<{ nodes: Node<OrchestraNodeData>[]; edges: Edge[] }>(
            `/api/projects/${projectId}/diagram`
          ),
          api<Datasource[]>(`/api/projects/${projectId}/datasources`),
        ]);

        setProjectName(project.name);
        setNodes(diagram.nodes || []);
        setEdges(diagram.edges || []);

        // Find entry node: first node with nodeType 'landing', or the first node
        const entryNode =
          (diagram.nodes || []).find(
            (n: Node<OrchestraNodeData>) => n.data.nodeType === 'landing'
          ) || (diagram.nodes || [])[0];
        if (entryNode) {
          setCurrentNodeId(entryNode.id);
        }

        // Load entries for each datasource
        const dsMap = new Map<string, DatasourceEntry[]>();
        await Promise.all(
          (datasources || []).map(async (ds: Datasource) => {
            try {
              const entries = await api<{ id: string; data: Record<string, any> }[]>(
                `/api/projects/${projectId}/datasources/${ds.id}/entries`
              );
              // Flatten: merge entry.data fields to top level so runtime can access entry.title etc.
              dsMap.set(
                ds.id,
                (entries || []).map((e) => ({ id: e.id, ...e.data }))
              );
            } catch {
              dsMap.set(ds.id, []);
            }
          })
        );
        setDatasourceData(dsMap);
      } catch (err) {
        console.error('[PreviewPage] failed to load:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projectId]);

  const handleAction = useCallback(
    (action: { type: string; datasourceId?: string; entryId?: string; values?: Record<string, any> }) => {
      if (action.type === 'NAVIGATE' && action.values?.nodeId) {
        setCurrentNodeId(action.values.nodeId);
        return;
      }

      if (action.type === 'DATASOURCE_ADD' && action.datasourceId && action.values) {
        setDatasourceData((prev) => {
          const next = new Map(prev);
          const entries = [...(next.get(action.datasourceId!) || [])];
          entries.push({ id: crypto.randomUUID(), ...action.values });
          next.set(action.datasourceId!, entries);
          return next;
        });
        return;
      }

      if (action.type === 'DATASOURCE_UPDATE' && action.datasourceId && action.entryId && action.values) {
        setDatasourceData((prev) => {
          const next = new Map(prev);
          const entries = (next.get(action.datasourceId!) || []).map((entry) =>
            entry.id === action.entryId ? { ...entry, ...action.values } : entry
          );
          next.set(action.datasourceId!, entries);
          return next;
        });
        return;
      }
    },
    []
  );

  const currentNode = nodes.find((n) => n.id === currentNodeId);
  const screenDef = currentNode?.data?.props?.screenDefinition ?? {
    rootComponents: [],
    backgroundColor: undefined,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        Loading preview...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-5 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => navigate(`/project/${projectId}`)}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <span className="font-semibold">{projectName}</span>
          <Badge variant="secondary">Preview</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={breakpoint === 'phone' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setBreakpoint('phone')}
          >
            <Smartphone className="h-3.5 w-3.5 mr-1" />
            Phone
          </Button>
          <Button
            variant={breakpoint === 'tablet' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setBreakpoint('tablet')}
          >
            <Tablet className="h-3.5 w-3.5 mr-1" />
            Tablet
          </Button>
          <Button
            variant={breakpoint === 'desktop' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setBreakpoint('desktop')}
          >
            <Monitor className="h-3.5 w-3.5 mr-1" />
            Desktop
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Screen navigator sidebar */}
        <aside className="w-48 border-r bg-card p-3 overflow-y-auto shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Screens
          </p>
          {nodes.map((node) => (
            <button
              key={node.id}
              className={cn(
                'w-full text-left text-sm px-3 py-2 rounded-md mb-1 transition-colors',
                currentNodeId === node.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-secondary'
              )}
              onClick={() => setCurrentNodeId(node.id)}
            >
              {node.data.label}
            </button>
          ))}
        </aside>

        {/* Preview area */}
        <div className="flex-1 flex items-center justify-center bg-secondary p-6">
          <DeviceFrame breakpoint={breakpoint} backgroundColor={screenDef.backgroundColor}>
            <PreviewRuntime
              rootComponents={screenDef.rootComponents || []}
              backgroundColor={screenDef.backgroundColor}
              breakpoint={breakpoint}
              datasourceData={datasourceData}
              onNavigate={(nodeId: string) => setCurrentNodeId(nodeId)}
              onAction={handleAction}
            />
          </DeviceFrame>
        </div>
      </div>
    </div>
  );
}
