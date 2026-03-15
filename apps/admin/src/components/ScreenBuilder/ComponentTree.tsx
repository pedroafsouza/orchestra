import { useScreenStore } from './screenStore';
import { COMPONENT_DEFAULTS } from '@orchestra/shared';
import type { ScreenComponent } from '@orchestra/shared';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

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
            ? 'bg-accent-100 text-accent-700 dark:bg-accent-600/30 dark:text-accent-300'
            : 'text-primary-600 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-700'
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
    <div className="flex-1 overflow-y-auto p-1 border-t
      bg-primary-50 border-primary-200
      dark:bg-primary-850 dark:border-primary-700">
      <p className="text-[9px] uppercase tracking-widest text-primary-400 dark:text-primary-500 px-2 py-1">
        Layer Tree
      </p>
      {components.length === 0 ? (
        <p className="text-[10px] text-primary-400 dark:text-primary-500 px-2 py-2 italic">
          No components yet
        </p>
      ) : (
        <>
          {components.map((comp, index) => (
            <div key={comp.id} className="relative group">
              {index > 0 && (
                <button
                  className="absolute -top-1 right-1 opacity-0 group-hover:opacity-100 text-primary-400 hover:text-primary-800 dark:hover:text-white z-10"
                  onClick={() => moveComponent(index, index - 1)}
                  title="Move up"
                >
                  <FontAwesomeIcon icon={faChevronUp} className="w-2.5 h-2.5" />
                </button>
              )}
              {index < components.length - 1 && (
                <button
                  className="absolute -bottom-1 right-1 opacity-0 group-hover:opacity-100 text-primary-400 hover:text-primary-800 dark:hover:text-white z-10"
                  onClick={() => moveComponent(index, index + 1)}
                  title="Move down"
                >
                  <FontAwesomeIcon icon={faChevronDown} className="w-2.5 h-2.5" />
                </button>
              )}
              <TreeItem component={comp} depth={0} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
