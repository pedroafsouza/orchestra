import { COMPONENT_DEFAULTS, type ScreenComponentType } from '@orchestra/shared';
import { useScreenStore } from './screenStore';

const CATEGORIES: { label: string; types: ScreenComponentType[] }[] = [
  {
    label: 'Basic',
    types: ['text', 'button', 'image', 'icon', 'spacer', 'divider'],
  },
  {
    label: 'Input',
    types: ['input', 'combobox'],
  },
  {
    label: 'Layout',
    types: ['container', 'card', 'horizontal_scroll', 'carousel', 'hero'],
  },
  {
    label: 'Data',
    types: ['list', 'gallery', 'avatar', 'badge', 'video'],
  },
];

export function ComponentPalette() {
  const addComponent = useScreenStore((s) => s.addComponent);

  return (
    <div className="w-56 bg-primary-800 border-r border-primary-700 overflow-y-auto p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-3">
        Components
      </h3>
      {CATEGORIES.map((cat) => (
        <div key={cat.label} className="mb-4">
          <p className="text-[10px] uppercase tracking-widest text-primary-500 mb-1.5">
            {cat.label}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {cat.types.map((type) => {
              const def = COMPONENT_DEFAULTS[type];
              return (
                <button
                  key={type}
                  className="flex flex-col items-center gap-0.5 px-2 py-2 bg-primary-700 hover:bg-primary-600 rounded-md transition-colors text-center"
                  onClick={() => addComponent(type)}
                  title={def.label}
                >
                  <span className="text-base">{def.icon}</span>
                  <span className="text-[10px] text-primary-300 leading-tight">
                    {def.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
