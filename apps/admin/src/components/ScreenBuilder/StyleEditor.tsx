import { useScreenStore } from './screenStore';
import { COMPONENT_DEFAULTS, type ScreenComponentType } from '@orchestra/shared';
import type { Breakpoint, ComponentStyle } from '@orchestra/shared';
import { ActionTrigger, ActionType } from '@orchestra/shared';
import { useFlowStore } from '@/store/flowStore';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const selectCls = 'h-8 w-full rounded-md border border-input bg-background px-2 text-sm';

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
      <Label className="w-20 shrink-0 text-[10px] text-muted-foreground">{label}</Label>
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded border border-input cursor-pointer"
      />
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#hex"
        className="flex-1 h-7 px-2 text-xs"
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
      <Label className="w-20 shrink-0 text-[10px] text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value === '' ? undefined : Number(e.target.value))
        }
        min={min}
        max={max}
        step={step}
        className="flex-1 h-7 px-2 text-xs"
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
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      <div className="grid grid-cols-4 gap-1">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <div key={side} className="flex flex-col items-center">
            <Input
              type="number"
              value={(v as any)[side] ?? ''}
              onChange={(e) =>
                update(side, e.target.value === '' ? undefined : Number(e.target.value))
              }
              className="w-full h-7 px-1 text-[10px] text-center"
            />
            <span className="text-[8px] text-muted-foreground">{side[0].toUpperCase()}</span>
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
  const updateComponentActions = useScreenStore((s) => s.updateComponentActions);
  const updateComponentStyle = useScreenStore((s) => s.updateComponentStyle);
  const removeComponent = useScreenStore((s) => s.removeComponent);
  const addChildComponent = useScreenStore((s) => s.addChildComponent);
  const backgroundColor = useScreenStore((s) => s.backgroundColor);
  const setBackgroundColor = useScreenStore((s) => s.setBackgroundColor);
  const flowNodes = useFlowStore((s) => s.nodes);

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

  const canHaveActions =
    selected?.type === 'button' ||
    selected?.type === 'checkbox' ||
    selected?.type === 'input';

  const sectionTitle = 'text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2';

  return (
    <ScrollArea className="w-64 border-l border bg-card">
      <div className="p-3">
        {/* Screen background */}
        <div className="mb-4 pb-3">
          <h3 className={sectionTitle}>Screen</h3>
          <ColorInput label="Background" value={backgroundColor} onChange={setBackgroundColor} />
        </div>
        <Separator className="mb-4" />

        {!selected ? (
          <p className="text-xs text-muted-foreground italic">
            Click a component in the preview to edit it.
          </p>
        ) : (
          <>
            {/* Component info */}
            <div className="mb-3 pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground">
                  {COMPONENT_DEFAULTS[selected.type]?.label || selected.type}
                </h3>
                <button
                  className="text-destructive hover:text-destructive/80"
                  onClick={() => removeComponent(selected.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground font-mono">{selected.id}</p>
            </div>
            <Separator className="mb-3" />

            {/* Breakpoint indicator */}
            <div className="mb-3">
              <p className="text-[10px] text-muted-foreground">
                Editing styles for:{' '}
                <span className="text-primary font-medium">{editingBreakpoint}</span>
              </p>
            </div>

            {/* Props editor */}
            <div className="mb-4">
              <h4 className={sectionTitle}>Properties</h4>
              {Object.entries(selected.props).map(([key, value]) => {
                // Special: navigateTo on buttons -> show node selector
                if (key === 'navigateTo' && selected.type === 'button') {
                  return (
                    <div key={key} className="mb-1.5">
                      <Label className="text-[10px] text-muted-foreground">Navigate To</Label>
                      <select
                        value={value || ''}
                        onChange={(e) =>
                          updateComponentProps(selected.id, { navigateTo: e.target.value })
                        }
                        className={selectCls}
                      >
                        <option value="">None</option>
                        {flowNodes.map((n) => (
                          <option key={n.id} value={n.id}>
                            {(n.data as any).label} ({n.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={key} className="mb-1.5">
                    <Label className="text-[10px] text-muted-foreground">{key}</Label>
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
                        <span className="text-xs text-foreground">{key}</span>
                      </label>
                    ) : typeof value === 'number' ? (
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) =>
                          updateComponentProps(selected.id, { [key]: Number(e.target.value) })
                        }
                        className="w-full h-7 px-2 text-xs"
                      />
                    ) : typeof value === 'string' ? (
                      <Input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          updateComponentProps(selected.id, { [key]: e.target.value })
                        }
                        className="w-full h-7 px-2 text-xs"
                      />
                    ) : (
                      <Input
                        type="text"
                        value={JSON.stringify(value)}
                        onChange={(e) => {
                          try {
                            updateComponentProps(selected.id, { [key]: JSON.parse(e.target.value) });
                          } catch {
                            updateComponentProps(selected.id, { [key]: e.target.value });
                          }
                        }}
                        className="w-full h-7 px-2 text-xs"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Style editor */}
            <div className="mb-4">
              <h4 className={sectionTitle}>Style</h4>
              <div className="space-y-2">
                <ColorInput label="Background" value={currentStyle.backgroundColor || ''} onChange={(v) => updateStyle({ backgroundColor: v })} />
                <ColorInput label="Text Color" value={currentStyle.textColor || ''} onChange={(v) => updateStyle({ textColor: v })} />
                <NumberInput label="Font Size" value={currentStyle.fontSize} onChange={(v) => updateStyle({ fontSize: v })} min={8} max={96} />
                <div className="flex items-center gap-2">
                  <Label className="w-20 shrink-0 text-[10px] text-muted-foreground">Weight</Label>
                  <select
                    value={currentStyle.fontWeight || ''}
                    onChange={(e) => updateStyle({ fontWeight: (e.target.value || undefined) as any })}
                    className={selectCls}
                  >
                    <option value="">Default</option>
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    {['100','200','300','400','500','600','700','800','900'].map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="w-20 shrink-0 text-[10px] text-muted-foreground">Align</Label>
                  <select
                    value={currentStyle.textAlign || ''}
                    onChange={(e) => updateStyle({ textAlign: (e.target.value || undefined) as any })}
                    className={selectCls}
                  >
                    <option value="">Default</option>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <NumberInput label="Opacity" value={currentStyle.opacity} onChange={(v) => updateStyle({ opacity: v })} min={0} max={1} step={0.1} />
              </div>
            </div>

            {/* Spacing */}
            <div className="mb-4">
              <h4 className={sectionTitle}>Spacing</h4>
              <SpacingEditor label="Padding" value={currentStyle.padding} onChange={(v) => updateStyle({ padding: v })} />
              <SpacingEditor label="Margin" value={currentStyle.margin} onChange={(v) => updateStyle({ margin: v })} />
            </div>

            {/* Border */}
            <div className="mb-4">
              <h4 className={sectionTitle}>Border</h4>
              <NumberInput label="Width" value={currentStyle.border?.width} onChange={(v) => updateStyle({ border: { ...currentStyle.border, width: v } })} min={0} />
              <div className="mt-1">
                <ColorInput label="Color" value={currentStyle.border?.color || ''} onChange={(v) => updateStyle({ border: { ...currentStyle.border, color: v } })} />
              </div>
              <div className="mt-1">
                <NumberInput label="Radius" value={currentStyle.border?.radius} onChange={(v) => updateStyle({ border: { ...currentStyle.border, radius: v } })} min={0} />
              </div>
            </div>

            {/* Shadow */}
            <div className="mb-4">
              <h4 className={sectionTitle}>Shadow</h4>
              <NumberInput label="Offset X" value={currentStyle.shadow?.offsetX} onChange={(v) => updateStyle({ shadow: { ...currentStyle.shadow, offsetX: v } })} />
              <div className="mt-1"><NumberInput label="Offset Y" value={currentStyle.shadow?.offsetY} onChange={(v) => updateStyle({ shadow: { ...currentStyle.shadow, offsetY: v } })} /></div>
              <div className="mt-1"><NumberInput label="Blur" value={currentStyle.shadow?.blur} onChange={(v) => updateStyle({ shadow: { ...currentStyle.shadow, blur: v } })} min={0} /></div>
              <div className="mt-1"><ColorInput label="Color" value={currentStyle.shadow?.color || ''} onChange={(v) => updateStyle({ shadow: { ...currentStyle.shadow, color: v } })} /></div>
            </div>

            {/* Add child (for containers) */}
            {canHaveChildren && (
              <div className="mb-4">
                <Separator className="mb-3" />
                <h4 className={sectionTitle}>Add Child</h4>
                <div className="grid grid-cols-3 gap-1">
                  {(['text', 'button', 'image', 'input', 'checkbox', 'icon', 'card'] as ScreenComponentType[]).map(
                    (t) => (
                      <Button
                        key={t}
                        variant="secondary"
                        size="xs"
                        className="text-[10px]"
                        onClick={() => addChildComponent(selected.id, t)}
                      >
                        {COMPONENT_DEFAULTS[t].label}
                      </Button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Actions editor */}
            {canHaveActions && (
              <div className="mb-4">
                <Separator className="mb-3" />
                <div className="flex items-center justify-between mb-2">
                  <h4 className={sectionTitle + ' mb-0'}>Actions</h4>
                  <button
                    className="text-primary hover:text-primary/80"
                    onClick={() => {
                      const actions = [...(selected.actions || [])];
                      actions.push({ trigger: 'onPress', type: 'NAVIGATE', payload: {} });
                      updateComponentActions(selected.id, actions);
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                {(selected.actions || []).length === 0 && (
                  <p className="text-[10px] text-muted-foreground italic">
                    No actions configured.
                  </p>
                )}
                {(selected.actions || []).map((action: any, idx: number) => (
                  <div
                    key={idx}
                    className="mb-2 p-2 rounded-lg border bg-secondary"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono text-muted-foreground">#{idx + 1}</span>
                      <button
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => {
                          const actions = [...(selected.actions || [])];
                          actions.splice(idx, 1);
                          updateComponentActions(selected.id, actions);
                        }}
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="mb-1">
                      <Label className="text-[10px] text-muted-foreground">Trigger</Label>
                      <select
                        value={action.trigger || 'onPress'}
                        onChange={(e) => {
                          const actions = [...(selected.actions || [])];
                          actions[idx] = { ...actions[idx], trigger: e.target.value };
                          updateComponentActions(selected.id, actions);
                        }}
                        className={selectCls}
                      >
                        {ActionTrigger.options.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-1">
                      <Label className="text-[10px] text-muted-foreground">Type</Label>
                      <select
                        value={action.type || 'NAVIGATE'}
                        onChange={(e) => {
                          const actions = [...(selected.actions || [])];
                          actions[idx] = { ...actions[idx], type: e.target.value };
                          updateComponentActions(selected.id, actions);
                        }}
                        className={selectCls}
                      >
                        {ActionType.options.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Payload (JSON)</Label>
                      <Input
                        type="text"
                        value={typeof action.payload === 'string' ? action.payload : JSON.stringify(action.payload || {})}
                        onChange={(e) => {
                          const actions = [...(selected.actions || [])];
                          try {
                            actions[idx] = { ...actions[idx], payload: JSON.parse(e.target.value) };
                          } catch {
                            actions[idx] = { ...actions[idx], payload: e.target.value };
                          }
                          updateComponentActions(selected.id, actions);
                        }}
                        className="w-full h-7 px-2 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ScrollArea>
  );
}
