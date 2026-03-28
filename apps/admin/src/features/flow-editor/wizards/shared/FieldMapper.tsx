interface FieldOption {
  key: string;
  name: string;
  type: string;
}

interface Slot {
  key: string;
  label: string;
  types?: string[];
}

interface FieldMapperProps {
  fields: FieldOption[];
  slots: Slot[];
  mapping: Record<string, string>;
  onChange: (mapping: Record<string, string>) => void;
}

export function FieldMapper({ fields, slots, mapping, onChange }: FieldMapperProps) {
  const handleChange = (slotKey: string, fieldKey: string) => {
    onChange({ ...mapping, [slotKey]: fieldKey });
  };

  return (
    <div className="space-y-3">
      {slots.map((slot) => {
        const compatibleFields = slot.types
          ? fields.filter((f) => slot.types!.includes(f.type))
          : fields;

        return (
          <div key={slot.key} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/60">
            <div className="w-28 shrink-0">
              <div className="text-xs font-medium text-foreground">{slot.label}</div>
              {slot.types && (
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {slot.types.join(', ')}
                </div>
              )}
            </div>

            <div className="text-muted-foreground text-xs shrink-0">→</div>

            <select
              value={mapping[slot.key] || ''}
              onChange={(e) => handleChange(slot.key, e.target.value)}
              className="flex-1 h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
            >
              <option value="">-- None --</option>
              {compatibleFields.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.name} ({f.type})
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
