import { COMPONENT_DEFAULTS, type ScreenComponentType } from '@orchestra/shared';
import { useScreenStore } from './screenStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFont,
  faHandPointer,
  faImage,
  faStar,
  faGripLines,
  faMinus,
  faKeyboard,
  faChevronDown,
  faBoxOpen,
  faIdCard,
  faArrowsLeftRight,
  faFilm,
  faPhotoFilm,
  faList,
  faImages,
  faCircleUser,
  faTag,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const COMPONENT_ICONS: Record<string, IconDefinition> = {
  text: faFont,
  button: faHandPointer,
  image: faImage,
  icon: faStar,
  spacer: faGripLines,
  divider: faMinus,
  input: faKeyboard,
  combobox: faChevronDown,
  container: faBoxOpen,
  card: faIdCard,
  horizontal_scroll: faArrowsLeftRight,
  carousel: faFilm,
  hero: faPhotoFilm,
  list: faList,
  gallery: faImages,
  avatar: faCircleUser,
  badge: faTag,
  video: faVideo,
};

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
    <div className="w-56 overflow-y-auto p-3 border-r
      bg-white border-primary-200
      dark:bg-primary-800 dark:border-primary-700">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400 mb-3">
        Components
      </h3>
      {CATEGORIES.map((cat) => (
        <div key={cat.label} className="mb-4">
          <p className="text-[10px] uppercase tracking-widest text-primary-400 dark:text-primary-500 mb-1.5">
            {cat.label}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {cat.types.map((type) => {
              const def = COMPONENT_DEFAULTS[type];
              const icon = COMPONENT_ICONS[type];
              return (
                <button
                  key={type}
                  className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg transition-colors text-center
                    bg-primary-50 hover:bg-primary-100 text-primary-600
                    dark:bg-primary-700 dark:hover:bg-primary-600 dark:text-primary-300"
                  onClick={() => addComponent(type)}
                  title={def.label}
                >
                  {icon && <FontAwesomeIcon icon={icon} className="w-4 h-4 opacity-70" />}
                  <span className="text-[10px] leading-tight">
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
