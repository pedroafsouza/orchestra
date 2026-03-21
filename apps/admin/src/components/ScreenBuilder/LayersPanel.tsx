import { useScreenStore } from './screenStore';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TreeItem } from './TreeItem';

export function LayersPanel() {
  const components = useScreenStore((s) => s.components);
  const moveComponent = useScreenStore((s) => s.moveComponent);

  return (
    <div className="p-2">
      {components.length === 0 ? (
        <p className="text-xs text-muted-foreground px-2 py-4 text-center italic">
          No components yet. Add one from the Components tab.
        </p>
      ) : (
        components.map((comp, index) => (
          <div key={comp.id} className="relative group">
            {index > 0 && (
              <button
                className="absolute -top-0.5 right-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground z-10 p-0.5"
                onClick={() => moveComponent(index, index - 1)}
                title="Move up"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
            )}
            {index < components.length - 1 && (
              <button
                className="absolute -bottom-0.5 right-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground z-10 p-0.5"
                onClick={() => moveComponent(index, index + 1)}
                title="Move down"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            )}
            <TreeItem component={comp} depth={0} />
          </div>
        ))
      )}
    </div>
  );
}
