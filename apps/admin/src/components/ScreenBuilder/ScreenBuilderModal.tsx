import { useEffect } from 'react';
import { useFlowStore, type OrchestraNodeData } from '@/store/flowStore';
import { useScreenStore } from './screenStore';
import { ComponentPalette } from './ComponentPalette';
import { DevicePreview } from './DevicePreview';
import { StyleEditor } from './StyleEditor';
import { ComponentTree } from './ComponentTree';

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

  // Load existing screen data from node
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
      <div className="w-[95vw] h-[92vh] bg-primary-950 rounded-2xl border border-primary-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-primary-900 border-b border-primary-700 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-white">
              Screen Builder — {nodeData.label}
            </h2>
            <span className="text-xs text-primary-500">
              ({nodeData.nodeType})
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-xs bg-primary-700 hover:bg-primary-600 rounded text-white transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-1 text-xs bg-accent-600 hover:bg-accent-500 rounded text-white font-medium transition-colors"
              onClick={handleSave}
            >
              Save Screen
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Palette + Component Tree */}
          <div className="flex flex-col w-56 shrink-0">
            <ComponentPalette />
            <ComponentTree />
          </div>

          {/* Center: Device Preview */}
          <DevicePreview />

          {/* Right: Style Editor */}
          <StyleEditor />
        </div>
      </div>
    </div>
  );
}
