import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { DeviceFrame } from './components/DeviceFrame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrchestraNodeData } from '@/features/flow-editor/store/flowStore';
import type { Node } from '@xyflow/react';

type Breakpoint = 'phone' | 'tablet' | 'desktop';

const EXPO_BASE_URL = 'http://localhost:8081';

export function PreviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [nodes, setNodes] = useState<Node<OrchestraNodeData>[]>([]);
  const [projectName, setProjectName] = useState('');
  const [projectGuid, setProjectGuid] = useState('');
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('phone');
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const navigateToNode = useCallback((nodeId: string) => {
    setActiveNodeId(nodeId);
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'ORCHESTRA_NAVIGATE_TO_NODE', nodeId },
      '*'
    );
  }, []);

  useEffect(() => {
    if (!projectId) return;

    async function load() {
      try {
        const [project, diagram] = await Promise.all([
          api<{ name: string; guid: string }>(`/api/projects/${projectId}`),
          api<{ nodes: Node<OrchestraNodeData>[] }>(
            `/api/projects/${projectId}/diagram`
          ),
        ]);

        setProjectName(project.name);
        setProjectGuid(project.guid);
        setNodes(diagram.nodes || []);
        if (diagram.nodes?.length > 0) {
          setActiveNodeId(diagram.nodes[0].id);
        }
      } catch (err) {
        console.error('[PreviewPage] failed to load:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projectId]);

  const handleReset = useCallback(() => {
    setIframeKey((k) => k + 1);
  }, []);

  const previewUrl = projectGuid
    ? `${EXPO_BASE_URL}/preview/${projectGuid}`
    : '';

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
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={handleReset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
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
              onClick={() => navigateToNode(node.id)}
              className={cn(
                'w-full text-left text-sm px-3 py-2 rounded-md mb-1 transition-colors cursor-pointer',
                activeNodeId === node.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {node.data.label}
            </button>
          ))}
        </aside>

        {/* Preview area */}
        <div className="flex-1 flex items-center justify-center bg-secondary p-6">
          <DeviceFrame breakpoint={breakpoint} backgroundColor="#0f172a">
            {previewUrl ? (
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={previewUrl}
                title="Orchestra Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#0f172a',
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No preview available
              </div>
            )}
          </DeviceFrame>
        </div>
      </div>
    </div>
  );
}
