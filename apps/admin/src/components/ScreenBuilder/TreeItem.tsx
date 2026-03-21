import { COMPONENT_DEFAULTS } from '@orchestra/shared';
import { useScreenStore } from './screenStore';
import type { ScreenComponent } from '@orchestra/shared';
import type { LucideIcon } from 'lucide-react';
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
  ToggleLeft,
  Calendar,
  SlidersHorizontal,
  PanelBottom,
} from 'lucide-react';

export const COMPONENT_ICONS: Record<string, LucideIcon> = {
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
  switch: ToggleLeft,
  date_picker: Calendar,
  slider: SlidersHorizontal,
  tab_bar: PanelBottom,
};

export function TreeItem({
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
