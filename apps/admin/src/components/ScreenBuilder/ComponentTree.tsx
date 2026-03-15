import { useScreenStore } from './screenStore';
import { COMPONENT_DEFAULTS } from '@orchestra/shared';
import type { ScreenComponent } from '@orchestra/shared';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

function TreeItem({
  component,
  depth,
}: {
  component: ScreenComponent;
  depth: number;
}) {
  const selectComponent = useScreenStore((s) => s.selectComponent);
  const selectedComponentId = useScreenStore((s) => s.selectedComponentId);
  const isSelected = selectedComponentId === component.id;
  const def = COMPONENT_DEFAULTS[component.type];

  return (
    <>
      <button
        className={`w-full text-left px-2 py-1 text-[11px] flex items-center gap-1.5 rounded-md transition-colors ${
          isSelected
            ? 'bg-accent text-accent-foreground'
            : 'text-foreground hover:bg-secondary'
        }`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => selectComponent(component.id)}
      >
        <span className="truncate">
          {def?.label || component.type}
          {component.props.content || component.props.label
            ? ` — ${component.props.content || component.props.label}`
            : ''}
        </span>
      </button>
      {component.children?.map((child) => (
        <TreeItem key={child.id} component={child} depth={depth + 1} />
      ))}
    </>
  );
}

export function ComponentTree() {
  const components = useScreenStore((s) => s.components);
  const moveComponent = useScreenStore((s) => s.moveComponent);

  return (
    <ScrollArea className="flex-1 border-t bg-secondary border-border">
      <div className="p-1">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground px-2 py-1">
          Layer Tree
        </p>
        {components.length === 0 ? (
          <p className="text-[10px] text-muted-foreground px-2 py-2 italic">
            No components yet
          </p>
        ) : (
          <>
            {components.map((comp, index) => (
              <div key={comp.id} className="relative group">
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="absolute -top-1 right-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground z-10"
                    onClick={() => moveComponent(index, index - 1)}
                    title="Move up"
                  >
                    <ChevronUp className="w-2.5 h-2.5" />
                  </Button>
                )}
                {index < components.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="absolute -bottom-1 right-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground z-10"
                    onClick={() => moveComponent(index, index + 1)}
                    title="Move down"
                  >
                    <ChevronDown className="w-2.5 h-2.5" />
                  </Button>
                )}
                <TreeItem component={comp} depth={0} />
              </div>
            ))}
          </>
        )}
      </div>
    </ScrollArea>
  );
}
