import { Input } from '@/components/ui/input';

export function SpacingEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: { top?: number; right?: number; bottom?: number; left?: number };
  onChange: (v: any) => void;
}) {
  const v = value || {};
  const update = (side: string, n: number | undefined) => {
    onChange({ ...v, [side]: n });
  };

  return (
    <div className="mb-2">
      <p className="text-[11px] text-muted-foreground mb-1.5">{label}</p>
      <div className="grid grid-cols-4 gap-1.5">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <div key={side} className="flex flex-col items-center gap-0.5">
            <Input
              type="number"
              value={(v as any)[side] ?? ''}
              onChange={(e) =>
                update(side, e.target.value === '' ? undefined : Number(e.target.value))
              }
              className="w-full h-7 px-1 text-[10px] text-center"
            />
            <span className="text-[9px] text-muted-foreground uppercase">{side[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
