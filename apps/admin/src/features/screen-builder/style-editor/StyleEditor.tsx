import { useScreenStore } from '../screenStore';
import { COMPONENT_DEFAULTS, type ScreenComponentType } from '@orchestra/shared';
import type { ComponentStyle } from '@orchestra/shared';
import { useFlowStore } from '@/features/flow-editor/store/flowStore';
import { Trash2, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Section } from './Section';
import { FieldRow } from './FieldRow';
import { ColorField } from './ColorField';
import { SpacingEditor } from './SpacingEditor';
import { AppearanceSection } from './AppearanceSection';
import { InteractionSection } from './InteractionSection';

const selectCls = 'h-8 w-full rounded-md border border-input bg-background px-2 text-xs';

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

  // No component selected — show screen-level settings
  if (!selected) {
    return (
      <div className="w-[300px] shrink-0 border-l border-border bg-card flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs font-semibold text-foreground">Screen</h3>
        </div>
        <div className="px-4 py-3">
          <ColorField label="Background" value={backgroundColor} onChange={setBackgroundColor} />
          <p className="text-xs text-muted-foreground italic mt-4">
            Select a component on the canvas to edit its properties.
          </p>
        </div>
      </div>
    );
  }

  const componentLabel = COMPONENT_DEFAULTS[selected.type]?.label || selected.type;

  return (
    <div className="w-[300px] shrink-0 border-l border-border bg-card flex flex-col h-full">
      {/* Component header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <h3 className="text-xs font-semibold text-foreground">{componentLabel}</h3>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-secondary text-destructive hover:text-destructive/80 transition-colors"
            onClick={() => removeComponent(selected.id)}
            title="Delete component"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-secondary text-muted-foreground transition-colors">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Content section */}
        <Section title="Content">
          {/* Component ID */}
          <FieldRow label="ID">
            <Input
              value={selected.id}
              readOnly
              className="h-8 px-2 text-xs font-mono bg-secondary/50"
            />
          </FieldRow>

          {/* Breakpoint indicator */}
          <FieldRow label="Breakpoint">
            <span className="text-xs text-primary font-medium capitalize">{editingBreakpoint}</span>
          </FieldRow>

          {/* Component props */}
          {Object.entries(selected.props).map(([key, value]) => {
            // navigateTo on buttons -> node selector
            if (key === 'navigateTo' && selected.type === 'button') {
              return (
                <FieldRow key={key} label="Navigate To">
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
                </FieldRow>
              );
            }

            const labelText = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');

            if (typeof value === 'boolean') {
              return (
                <FieldRow key={key} label={labelText}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        updateComponentProps(selected.id, { [key]: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-xs text-foreground">{value ? 'On' : 'Off'}</span>
                  </label>
                </FieldRow>
              );
            }

            if (typeof value === 'number') {
              return (
                <FieldRow key={key} label={labelText}>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      updateComponentProps(selected.id, { [key]: Number(e.target.value) })
                    }
                    className="h-8 px-2 text-xs"
                  />
                </FieldRow>
              );
            }

            if (typeof value === 'string') {
              return (
                <FieldRow key={key} label={labelText}>
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      updateComponentProps(selected.id, { [key]: e.target.value })
                    }
                    className="h-8 px-2 text-xs"
                  />
                </FieldRow>
              );
            }

            return (
              <FieldRow key={key} label={labelText}>
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
                  className="h-8 px-2 text-xs"
                />
              </FieldRow>
            );
          })}

          {/* Add children (for containers) */}
          {canHaveChildren && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-[11px] text-muted-foreground mb-2">Add child component</p>
              <div className="grid grid-cols-3 gap-1.5">
                {(['text', 'button', 'image', 'input', 'checkbox', 'icon', 'card', 'chip', 'badge'] as ScreenComponentType[]).map(
                  (t) => (
                    <button
                      key={t}
                      className="text-[10px] px-2 py-1.5 rounded-md border border-border hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => addChildComponent(selected.id, t)}
                    >
                      {COMPONENT_DEFAULTS[t].label}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </Section>

        {/* Interaction section */}
        {canHaveActions && (
          <InteractionSection
            selectedId={selected.id}
            actions={selected.actions || []}
            updateComponentActions={updateComponentActions}
          />
        )}

        {/* Appearance section */}
        <AppearanceSection currentStyle={currentStyle} updateStyle={updateStyle} />

        {/* Spacing section */}
        <Section title="Spacing" defaultOpen={false}>
          <SpacingEditor label="Padding" value={currentStyle.padding} onChange={(v) => updateStyle({ padding: v })} />
          <SpacingEditor label="Margin" value={currentStyle.margin} onChange={(v) => updateStyle({ margin: v })} />
        </Section>

        {/* Border section */}
        <Section title="Border" defaultOpen={false}>
          <FieldRow label="Width">
            <Input
              type="number"
              value={currentStyle.border?.width ?? ''}
              onChange={(e) => updateStyle({ border: { ...currentStyle.border, width: e.target.value === '' ? undefined : Number(e.target.value) } })}
              min={0}
              className="h-8 px-2 text-xs"
            />
          </FieldRow>
          <ColorField label="Color" value={currentStyle.border?.color || ''} onChange={(v) => updateStyle({ border: { ...currentStyle.border, color: v } })} />
          <FieldRow label="Radius">
            <Input
              type="number"
              value={currentStyle.border?.radius ?? ''}
              onChange={(e) => updateStyle({ border: { ...currentStyle.border, radius: e.target.value === '' ? undefined : Number(e.target.value) } })}
              min={0}
              className="h-8 px-2 text-xs"
            />
          </FieldRow>
        </Section>

        {/* Shadow section */}
        <Section title="Shadow" defaultOpen={false}>
          <FieldRow label="Offset X">
            <Input
              type="number"
              value={currentStyle.shadow?.offsetX ?? ''}
              onChange={(e) => updateStyle({ shadow: { ...currentStyle.shadow, offsetX: e.target.value === '' ? undefined : Number(e.target.value) } })}
              className="h-8 px-2 text-xs"
            />
          </FieldRow>
          <FieldRow label="Offset Y">
            <Input
              type="number"
              value={currentStyle.shadow?.offsetY ?? ''}
              onChange={(e) => updateStyle({ shadow: { ...currentStyle.shadow, offsetY: e.target.value === '' ? undefined : Number(e.target.value) } })}
              className="h-8 px-2 text-xs"
            />
          </FieldRow>
          <FieldRow label="Blur">
            <Input
              type="number"
              value={currentStyle.shadow?.blur ?? ''}
              onChange={(e) => updateStyle({ shadow: { ...currentStyle.shadow, blur: e.target.value === '' ? undefined : Number(e.target.value) } })}
              min={0}
              className="h-8 px-2 text-xs"
            />
          </FieldRow>
          <ColorField label="Color" value={currentStyle.shadow?.color || ''} onChange={(v) => updateStyle({ shadow: { ...currentStyle.shadow, color: v } })} />
        </Section>
      </ScrollArea>
    </div>
  );
}
