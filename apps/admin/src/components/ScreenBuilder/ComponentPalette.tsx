import { useState } from 'react';
import { COMPONENT_DEFAULTS, type ScreenComponentType } from '@orchestra/shared';
import { useScreenStore } from './screenStore';
import {
  Type,
  MousePointer,
  Image,
  Star,
  GripHorizontal,
  Minus,
  Keyboard,
  ChevronDown,
  Box,
  CreditCard,
  ArrowLeftRight,
  Film,
  ImagePlay,
  List,
  Images,
  CircleUser,
  Tag as TagIcon,
  DollarSign,
  MapPin,
  Video,
  CheckSquare,
  Search,
  Layers,
  LayoutGrid,
  ChevronUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import type { ScreenComponent } from '@orchestra/shared';

const COMPONENT_ICONS: Record<string, LucideIcon> = {
  text: Type,
  button: MousePointer,
  image: Image,
  icon: Star,
  spacer: GripHorizontal,
  divider: Minus,
  input: Keyboard,
  combobox: ChevronDown,
  container: Box,
  card: CreditCard,
  horizontal_scroll: ArrowLeftRight,
  carousel: Film,
  hero: ImagePlay,
  list: List,
  gallery: Images,
  avatar: CircleUser,
  badge: TagIcon,
  video: Video,
  checkbox: CheckSquare,
  rating_stars: Star,
  price_tag: DollarSign,
  map_view: MapPin,
  chip: TagIcon,
};

const CATEGORIES: { label: string; types: ScreenComponentType[] }[] = [
  {
    label: 'Commonly used',
    types: ['text', 'button', 'image', 'input', 'container', 'card', 'list'],
  },
  {
    label: 'Basic',
    types: ['icon', 'spacer', 'divider', 'chip', 'badge', 'avatar'],
  },
  {
    label: 'Inputs',
    types: ['input', 'combobox', 'checkbox'],
  },
  {
    label: 'Layout',
    types: ['container', 'card', 'horizontal_scroll', 'carousel', 'hero'],
  },
  {
    label: 'Data & Media',
    types: ['list', 'gallery', 'video', 'rating_stars', 'price_tag', 'map_view'],
  },
];

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
        className={`w-full text-left px-2 py-1.5 text-[11px] flex items-center gap-1.5 rounded-md transition-colors ${
          isSelected
            ? 'bg-primary/15 text-primary'
            : 'text-foreground hover:bg-secondary'
        }`}
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => selectComponent(component.id)}
      >
        {COMPONENT_ICONS[component.type] && (() => {
          const Icon = COMPONENT_ICONS[component.type];
          return <Icon className="w-3 h-3 opacity-50 shrink-0" />;
        })()}
        <span className="truncate">
          {def?.label || component.type}
          {component.props.content || component.props.label
            ? ` — ${(component.props.content || component.props.label).slice(0, 20)}`
            : ''}
        </span>
      </button>
      {component.children?.map((child) => (
        <TreeItem key={child.id} component={child} depth={depth + 1} />
      ))}
    </>
  );
}

function LayersPanel() {
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

export function ComponentPalette() {
  const addComponent = useScreenStore((s) => s.addComponent);
  const [activeTab, setActiveTab] = useState<'components' | 'layers'>('components');
  const [search, setSearch] = useState('');

  const filteredCategories = CATEGORIES.map((cat) => ({
    ...cat,
    types: cat.types.filter((type) => {
      if (!search) return true;
      const label = COMPONENT_DEFAULTS[type]?.label || type;
      return label.toLowerCase().includes(search.toLowerCase());
    }),
  })).filter((cat) => cat.types.length > 0);

  return (
    <div className="w-[280px] shrink-0 border-r border-border bg-card flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'components'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('components')}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Components
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'layers'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('layers')}
        >
          <Layers className="w-3.5 h-3.5" />
          Layers
        </button>
      </div>

      {/* Search (components tab only) */}
      {activeTab === 'components' && (
        <div className="px-3 pt-3 pb-1 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        {activeTab === 'components' ? (
          <div className="px-3 py-2">
            {filteredCategories.map((cat) => (
              <div key={cat.label} className="mb-5">
                <p className="text-[11px] font-medium text-muted-foreground mb-2">
                  {cat.label}
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {cat.types.map((type) => {
                    const def = COMPONENT_DEFAULTS[type];
                    const Icon = COMPONENT_ICONS[type];
                    return (
                      <button
                        key={type}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg border border-transparent hover:border-border hover:bg-secondary/60 transition-colors cursor-pointer group"
                        onClick={() => addComponent(type)}
                        title={def.label}
                      >
                        <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center group-hover:bg-background transition-colors">
                          {Icon && <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />}
                        </div>
                        <span className="text-[10px] leading-tight text-muted-foreground group-hover:text-foreground text-center truncate w-full">
                          {def.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <LayersPanel />
        )}
      </ScrollArea>
    </div>
  );
}
