import { Input } from '@/components/ui/input';
import { FieldRow } from './FieldRow';

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <FieldRow label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded border border-input cursor-pointer shrink-0"
        />
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex"
          className="flex-1 h-8 px-2 text-xs"
        />
      </div>
    </FieldRow>
  );
}
