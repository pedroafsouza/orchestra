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
  Tag,
  Video,
  CheckSquare,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  badge: Tag,
  video: Video,
  checkbox: CheckSquare,
};

const CATEGORIES: { label: string; types: ScreenComponentType[] }[] = [
  {
    label: 'Basic',
    types: ['text', 'button', 'image', 'icon', 'spacer', 'divider'],
  },
  {
    label: 'Input',
    types: ['input', 'combobox', 'checkbox'],
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
    <ScrollArea className="w-44 border-r bg-card border-border">
      <div className="p-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Components
        </h3>
        {CATEGORIES.map((cat) => (
          <div key={cat.label} className="mb-3">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
              {cat.label}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {cat.types.map((type) => {
                const def = COMPONENT_DEFAULTS[type];
                const Icon = COMPONENT_ICONS[type];
                return (
                  <Button
                    key={type}
                    variant="secondary"
                    size="sm"
                    className="flex flex-col items-center gap-0.5 h-auto px-1 py-1.5 text-[9px]"
                    onClick={() => addComponent(type)}
                    title={def.label}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 opacity-70" />}
                    <span className="leading-tight truncate w-full text-center">
                      {def.label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
