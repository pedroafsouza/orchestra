import { useEffect } from 'react';
import { useFlowStore, type OrchestraNodeData } from '@/store/flowStore';
import { useScreenStore } from './screenStore';
import { ComponentPalette } from './ComponentPalette';
import { DevicePreview } from './DevicePreview';
import { StyleEditor } from './StyleEditor';
import { ComponentTree } from './ComponentTree';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  nodeId: string;
  onClose: () => void;
}

export function ScreenBuilderModal({ nodeId, onClose }: Props) {
  const nodes = useFlowStore((s) => s.nodes);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const node = nodes.find((n) => n.id === nodeId);

  const setComponents = useScreenStore((s) => s.setComponents);
  const components = useScreenStore((s) => s.components);
  const backgroundColor = useScreenStore((s) => s.backgroundColor);
  const setBackgroundColor = useScreenStore((s) => s.setBackgroundColor);
  const selectComponent = useScreenStore((s) => s.selectComponent);

  useEffect(() => {
    const data = node?.data as unknown as OrchestraNodeData;
    if (data?.props?.screenDefinition) {
      setComponents(data.props.screenDefinition.rootComponents || []);
      setBackgroundColor(data.props.screenDefinition.backgroundColor || '#0f172a');
    } else {
      setComponents([]);
      setBackgroundColor('#0f172a');
    }
    selectComponent(null);
  }, [nodeId]);

  const handleSave = () => {
    updateNodeData(nodeId, {
      props: {
        ...(node?.data as unknown as OrchestraNodeData).props,
        screenDefinition: {
          rootComponents: components,
          backgroundColor,
          scrollable: true,
        },
      },
    });
    onClose();
  };

  if (!node) return null;
  const nodeData = node.data as unknown as OrchestraNodeData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[95vw] h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border
        bg-background border-border">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 shrink-0 border-b
          bg-card border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              Screen Builder
            </h2>
            <span className="text-xs text-muted-foreground">
              {nodeData.label} ({nodeData.nodeType})
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              <X className="w-3 h-3" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-3 h-3" />
              Save Screen
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col w-56 shrink-0">
            <ComponentPalette />
            <ComponentTree />
          </div>
          <DevicePreview />
          <StyleEditor />
        </div>
      </div>
    </div>
  );
}
