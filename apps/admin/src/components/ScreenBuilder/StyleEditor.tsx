import { useScreenStore } from './screenStore';
import { COMPONENT_DEFAULTS, type ScreenComponentType } from '@orchestra/shared';
import type { Breakpoint, ComponentStyle } from '@orchestra/shared';

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] text-primary-400 w-20 shrink-0">{label}</label>
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded border border-primary-600 cursor-pointer"
      />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#hex"
        className="flex-1 px-2 py-0.5 text-xs bg-primary-700 border border-primary-600 rounded text-white"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] text-primary-400 w-20 shrink-0">{label}</label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value === '' ? undefined : Number(e.target.value))
        }
        min={min}
        max={max}
        step={step}
        className="flex-1 px-2 py-0.5 text-xs bg-primary-700 border border-primary-600 rounded text-white"
      />
    </div>
  );
}

function SpacingEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: { top?: number; right?: number; bottom?: number; left?: number };
  onChange: (v: any) => void;
}) {
  const v = value || {};
  const update = (side: string, n: number | undefined) => {
    onChange({ ...v, [side]: n });
  };

  return (
    <div className="mb-2">
      <p className="text-[10px] text-primary-400 mb-1">{label}</p>
      <div className="grid grid-cols-4 gap-1">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <div key={side} className="flex flex-col items-center">
            <input
              type="number"
              value={(v as any)[side] ?? ''}
              onChange={(e) =>
                update(side, e.target.value === '' ? undefined : Number(e.target.value))
              }
              className="w-full px-1 py-0.5 text-[10px] bg-primary-700 border border-primary-600 rounded text-white text-center"
            />
            <span className="text-[8px] text-primary-500">{side[0].toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StyleEditor() {
  const selectedId = useScreenStore((s) => s.selectedComponentId);
  const components = useScreenStore((s) => s.components);
  const activeBreakpoint = useScreenStore((s) => s.activeBreakpoint);
  const updateComponentProps = useScreenStore((s) => s.updateComponentProps);
  const updateComponentStyle = useScreenStore((s) => s.updateComponentStyle);
  const removeComponent = useScreenStore((s) => s.removeComponent);
  const addChildComponent = useScreenStore((s) => s.addChildComponent);
  const backgroundColor = useScreenStore((s) => s.backgroundColor);
  const setBackgroundColor = useScreenStore((s) => s.setBackgroundColor);

  // Find selected component (flat + nested search)
  function findComponent(
    comps: typeof components,
    id: string
  ): typeof components[0] | null {
    for (const c of comps) {
      if (c.id === id) return c;
      if (c.children) {
        const found = findComponent(c.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  const selected = selectedId ? findComponent(components, selectedId) : null;

  const editingBreakpoint = activeBreakpoint;
  const currentStyle: ComponentStyle =
    selected?.style?.[editingBreakpoint] || selected?.style?.base || {};

  const updateStyle = (updates: Partial<ComponentStyle>) => {
    if (!selectedId) return;
    updateComponentStyle(selectedId, editingBreakpoint, updates);
  };

  const canHaveChildren =
    selected?.type === 'container' ||
    selected?.type === 'card' ||
    selected?.type === 'horizontal_scroll' ||
    selected?.type === 'carousel' ||
    selected?.type === 'hero' ||
    selected?.type === 'list';

  return (
    <div className="w-64 bg-primary-800 border-l border-primary-700 overflow-y-auto p-3">
      {/* Screen background */}
      <div className="mb-4 pb-3 border-b border-primary-700">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-2">
          Screen
        </h3>
        <ColorInput label="Background" value={backgroundColor} onChange={setBackgroundColor} />
      </div>

      {!selected ? (
        <p className="text-xs text-primary-500 italic">
          Click a component in the preview to edit it.
        </p>
      ) : (
        <>
          {/* Component info */}
          <div className="mb-3 pb-2 border-b border-primary-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white">
                {COMPONENT_DEFAULTS[selected.type]?.icon}{' '}
                {COMPONENT_DEFAULTS[selected.type]?.label || selected.type}
              </h3>
              <button
                className="text-[10px] text-red-400 hover:text-red-300"
                onClick={() => removeComponent(selected.id)}
              >
                Delete
              </button>
            </div>
            <p className="text-[9px] text-primary-500 font-mono">{selected.id}</p>
          </div>

          {/* Breakpoint indicator */}
          <div className="mb-3">
            <p className="text-[10px] text-primary-400">
              Editing styles for:{' '}
              <span className="text-accent-400 font-medium">{editingBreakpoint}</span>
            </p>
          </div>

          {/* Props editor */}
          <div className="mb-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary-400 mb-2">
              Properties
            </h4>
            {Object.entries(selected.props).map(([key, value]) => (
              <div key={key} className="mb-1.5">
                <label className="text-[10px] text-primary-400">{key}</label>
                {typeof value === 'boolean' ? (
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        updateComponentProps(selected.id, { [key]: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-xs text-primary-300">{key}</span>
                  </label>
                ) : typeof value === 'number' ? (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      updateComponentProps(selected.id, { [key]: Number(e.target.value) })
                    }
                    className="w-full px-2 py-0.5 text-xs bg-primary-700 border border-primary-600 rounded text-white"
                  />
                ) : typeof value === 'string' ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      updateComponentProps(selected.id, { [key]: e.target.value })
                    }
                    className="w-full px-2 py-0.5 text-xs bg-primary-700 border border-primary-600 rounded text-white"
                  />
                ) : (
                  <input
                    type="text"
                    value={JSON.stringify(value)}
                    onChange={(e) => {
                      try {
                        updateComponentProps(selected.id, { [key]: JSON.parse(e.target.value) });
                      } catch {
                        updateComponentProps(selected.id, { [key]: e.target.value });
                      }
                    }}
                    className="w-full px-2 py-0.5 text-xs bg-primary-700 border border-primary-600 rounded text-white"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Style editor */}
          <div className="mb-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary-400 mb-2">
              Style
            </h4>
            <div className="space-y-2">
              <ColorInput
                label="Background"
                value={currentStyle.backgroundColor || ''}
                onChange={(v) => updateStyle({ backgroundColor: v })}
              />
              <ColorInput
                label="Text Color"
                value={currentStyle.textColor || ''}
                onChange={(v) => updateStyle({ textColor: v })}
              />
              <NumberInput
                label="Font Size"
                value={currentStyle.fontSize}
                onChange={(v) => updateStyle({ fontSize: v })}
                min={8}
                max={96}
              />
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-primary-400 w-20 shrink-0">Weight</label>
                <select
                  value={currentStyle.fontWeight || ''}
                  onChange={(e) => updateStyle({ fontWeight: (e.target.value || undefined) as any })}
                  className="flex-1 px-2 py-0.5 text-xs bg-primary-700 border border-primary-600 rounded text-white"
                >
                  <option value="">Default</option>
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  {['100', '200', '300', '400', '500', '600', '700', '800', '900'].map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-primary-400 w-20 shrink-0">Align</label>
                <select
                  value={currentStyle.textAlign || ''}
                  onChange={(e) => updateStyle({ textAlign: (e.target.value || undefined) as any })}
                  className="flex-1 px-2 py-0.5 text-xs bg-primary-700 border border-primary-600 rounded text-white"
                >
                  <option value="">Default</option>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <NumberInput
                label="Opacity"
                value={currentStyle.opacity}
                onChange={(v) => updateStyle({ opacity: v })}
                min={0}
                max={1}
                step={0.1}
              />
            </div>
          </div>

          {/* Spacing */}
          <div className="mb-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary-400 mb-2">
              Spacing
            </h4>
            <SpacingEditor
              label="Padding"
              value={currentStyle.padding}
              onChange={(v) => updateStyle({ padding: v })}
            />
            <SpacingEditor
              label="Margin"
              value={currentStyle.margin}
              onChange={(v) => updateStyle({ margin: v })}
            />
          </div>

          {/* Border */}
          <div className="mb-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary-400 mb-2">
              Border
            </h4>
            <NumberInput
              label="Width"
              value={currentStyle.border?.width}
              onChange={(v) => updateStyle({ border: { ...currentStyle.border, width: v } })}
              min={0}
            />
            <div className="mt-1">
              <ColorInput
                label="Color"
                value={currentStyle.border?.color || ''}
                onChange={(v) => updateStyle({ border: { ...currentStyle.border, color: v } })}
              />
            </div>
            <div className="mt-1">
              <NumberInput
                label="Radius"
                value={currentStyle.border?.radius}
                onChange={(v) => updateStyle({ border: { ...currentStyle.border, radius: v } })}
                min={0}
              />
            </div>
          </div>

          {/* Shadow */}
          <div className="mb-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary-400 mb-2">
              Shadow
            </h4>
            <NumberInput
              label="Offset X"
              value={currentStyle.shadow?.offsetX}
              onChange={(v) => updateStyle({ shadow: { ...currentStyle.shadow, offsetX: v } })}
            />
            <div className="mt-1">
              <NumberInput
                label="Offset Y"
                value={currentStyle.shadow?.offsetY}
                onChange={(v) => updateStyle({ shadow: { ...currentStyle.shadow, offsetY: v } })}
              />
            </div>
            <div className="mt-1">
              <NumberInput
                label="Blur"
                value={currentStyle.shadow?.blur}
                onChange={(v) => updateStyle({ shadow: { ...currentStyle.shadow, blur: v } })}
                min={0}
              />
            </div>
            <div className="mt-1">
              <ColorInput
                label="Color"
                value={currentStyle.shadow?.color || ''}
                onChange={(v) => updateStyle({ shadow: { ...currentStyle.shadow, color: v } })}
              />
            </div>
          </div>

          {/* Add child (for containers) */}
          {canHaveChildren && (
            <div className="mb-4 pt-3 border-t border-primary-700">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary-400 mb-2">
                Add Child
              </h4>
              <div className="grid grid-cols-3 gap-1">
                {(['text', 'button', 'image', 'input', 'icon', 'card'] as ScreenComponentType[]).map(
                  (t) => (
                    <button
                      key={t}
                      className="px-1 py-1 text-[10px] bg-primary-700 hover:bg-primary-600 rounded text-primary-300 transition-colors"
                      onClick={() => addChildComponent(selected.id, t)}
                    >
                      {COMPONENT_DEFAULTS[t].icon} {COMPONENT_DEFAULTS[t].label}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
