import { Label } from '@/components/ui/label';

export function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <Label className="w-24 shrink-0 text-[11px] text-muted-foreground">{label}</Label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
