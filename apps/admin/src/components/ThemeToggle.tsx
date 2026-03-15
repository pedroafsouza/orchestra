import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useThemeStore } from '@/store/themeStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-700 text-primary-500 dark:text-primary-400 transition-colors"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="w-4 h-4" />
    </button>
  );
}
