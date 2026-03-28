import type { LucideIcon } from 'lucide-react';

interface LayoutPreviewCardProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  gradient: string;
}

export function LayoutPreviewCard({
  icon: Icon,
  label,
  description,
  selected,
  onClick,
  gradient,
}: LayoutPreviewCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl
        border-2 transition-all duration-250 cursor-pointer text-center
        hover:scale-[1.02] hover:shadow-lg
        ${
          selected
            ? 'border-indigo-500 shadow-lg shadow-indigo-500/15 bg-indigo-500/5'
            : 'border-border/60 hover:border-indigo-400/40 bg-card'
        }
      `}
    >
      {/* Gradient background tint */}
      <div
        className={`absolute inset-0 rounded-xl opacity-[0.07] transition-opacity duration-250 ${
          selected ? 'opacity-[0.12]' : 'group-hover:opacity-[0.10]'
        }`}
        style={{ background: gradient }}
      />

      <div
        className={`
          relative w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-200
          ${selected ? 'bg-indigo-500/15 text-indigo-400' : 'bg-muted text-muted-foreground group-hover:text-foreground'}
        `}
      >
        <Icon className="w-6 h-6" />
      </div>

      <div className="relative">
        <div className={`text-sm font-semibold transition-colors ${selected ? 'text-indigo-300' : 'text-foreground'}`}>
          {label}
        </div>
        {description && (
          <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</div>
        )}
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
