import { create } from 'zustand';
import type { ScreenComponent, Breakpoint } from './types';
import { COMPONENT_DEFAULTS, type ScreenComponentType } from '@orchestra/shared';

interface ScreenStore {
  components: ScreenComponent[];
  selectedComponentId: string | null;
  activeBreakpoint: Breakpoint;
  backgroundColor: string;

  setComponents: (components: ScreenComponent[]) => void;
  addComponent: (type: ScreenComponentType, index?: number) => void;
  removeComponent: (id: string) => void;
  moveComponent: (fromIndex: number, toIndex: number) => void;
  selectComponent: (id: string | null) => void;
  updateComponent: (id: string, updates: Partial<ScreenComponent>) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  updateComponentStyle: (id: string, breakpoint: 'base' | Breakpoint, style: Record<string, any>) => void;
  setActiveBreakpoint: (bp: Breakpoint) => void;
  setBackgroundColor: (color: string) => void;
  addChildComponent: (parentId: string, type: ScreenComponentType) => void;
}

let componentIdCounter = 0;

function generateId(): string {
  return `sc_${++componentIdCounter}_${Date.now().toString(36)}`;
}

function updateDeep(
  components: ScreenComponent[],
  id: string,
  updater: (c: ScreenComponent) => ScreenComponent
): ScreenComponent[] {
  return components.map((c) => {
    if (c.id === id) return updater(c);
    if (c.children?.length) {
      return { ...c, children: updateDeep(c.children, id, updater) };
    }
    return c;
  });
}

function removeDeep(components: ScreenComponent[], id: string): ScreenComponent[] {
  return components
    .filter((c) => c.id !== id)
    .map((c) => {
      if (c.children?.length) {
        return { ...c, children: removeDeep(c.children, id) };
      }
      return c;
    });
}

export const useScreenStore = create<ScreenStore>((set, get) => ({
  components: [],
  selectedComponentId: null,
  activeBreakpoint: 'phone',
  backgroundColor: '#0f172a',

  setComponents: (components) => set({ components }),

  addComponent: (type, index) => {
    const defaults = COMPONENT_DEFAULTS[type];
    const newComponent: ScreenComponent = {
      id: generateId(),
      type,
      props: { ...defaults.props },
      style: { base: {} },
      children: type === 'container' || type === 'card' || type === 'horizontal_scroll' || type === 'carousel' || type === 'hero'
        ? []
        : undefined,
    };
    const { components } = get();
    const updated = [...components];
    if (index !== undefined) {
      updated.splice(index, 0, newComponent);
    } else {
      updated.push(newComponent);
    }
    set({ components: updated, selectedComponentId: newComponent.id });
  },

  removeComponent: (id) => {
    set({
      components: removeDeep(get().components, id),
      selectedComponentId: get().selectedComponentId === id ? null : get().selectedComponentId,
    });
  },

  moveComponent: (fromIndex, toIndex) => {
    const { components } = get();
    const updated = [...components];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    set({ components: updated });
  },

  selectComponent: (id) => set({ selectedComponentId: id }),

  updateComponent: (id, updates) => {
    set({
      components: updateDeep(get().components, id, (c) => ({ ...c, ...updates })),
    });
  },

  updateComponentProps: (id, props) => {
    set({
      components: updateDeep(get().components, id, (c) => ({
        ...c,
        props: { ...c.props, ...props },
      })),
    });
  },

  updateComponentStyle: (id, breakpoint, style) => {
    set({
      components: updateDeep(get().components, id, (c) => ({
        ...c,
        style: {
          ...c.style,
          [breakpoint]: { ...(c.style?.[breakpoint] || {}), ...style },
        },
      })),
    });
  },

  setActiveBreakpoint: (bp) => set({ activeBreakpoint: bp }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),

  addChildComponent: (parentId, type) => {
    const defaults = COMPONENT_DEFAULTS[type];
    const newChild: ScreenComponent = {
      id: generateId(),
      type,
      props: { ...defaults.props },
      style: { base: {} },
      children: type === 'container' || type === 'card' ? [] : undefined,
    };
    set({
      components: updateDeep(get().components, parentId, (c) => ({
        ...c,
        children: [...(c.children || []), newChild],
      })),
      selectedComponentId: newChild.id,
    });
  },
}));
