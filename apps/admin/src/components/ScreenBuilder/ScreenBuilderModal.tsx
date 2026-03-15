import { useEffect } from 'react';
import { useFlowStore, type OrchestraNodeData } from '@/store/flowStore';
import { useScreenStore } from './screenStore';
import { ComponentPalette } from './ComponentPalette';
import { DevicePreview } from './DevicePreview';
import { StyleEditor } from './StyleEditor';
import { ComponentTree } from './ComponentTree';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';

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
        bg-primary-50 border-primary-200
        dark:bg-primary-950 dark:border-primary-700">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 shrink-0 border-b
          bg-white border-primary-200
          dark:bg-primary-900 dark:border-primary-700">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-primary-800 dark:text-white">
              Screen Builder
            </h2>
            <span className="text-xs text-primary-400 dark:text-primary-500">
              {nodeData.label} ({nodeData.nodeType})
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg transition-colors
                bg-primary-100 hover:bg-primary-200 text-primary-700
                dark:bg-primary-700 dark:hover:bg-primary-600 dark:text-white"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              Cancel
            </button>
            <button
              className="flex items-center gap-1.5 px-4 py-1 text-xs bg-accent-600 hover:bg-accent-500 rounded-lg text-white font-medium transition-colors"
              onClick={handleSave}
            >
              <FontAwesomeIcon icon={faFloppyDisk} className="w-3 h-3" />
              Save Screen
            </button>
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
