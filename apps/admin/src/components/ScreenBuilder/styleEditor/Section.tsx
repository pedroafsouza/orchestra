import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function Section({
  title,
  defaultOpen = true,
  children,
  actions,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-secondary/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-[11px] font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-1">
          {actions}
          {open ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}
