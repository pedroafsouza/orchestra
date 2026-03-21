import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Type, Hash, ToggleLeft, Calendar, Image, FileText, Link, MapPin } from 'lucide-react';
import type { DatasourceField, DatasourceFieldType } from '@orchestra/shared';

const FIELD_TYPES: DatasourceFieldType[] = [
  'text',
  'number',
  'image_url',
  'boolean',
  'date',
  'rich_text',
  'url',
  'geolocation',
];

const FIELD_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  text: Type,
  number: Hash,
  boolean: ToggleLeft,
  date: Calendar,
  image_url: Image,
  rich_text: FileText,
  url: Link,
  geolocation: MapPin,
};

interface SchemaEditorProps {
  fields: DatasourceField[];
  onAddField: (field: DatasourceField) => void;
  onRemoveField: (fieldKey: string) => void;
}

export function SchemaEditor({ fields, onAddField, onRemoveField }: SchemaEditorProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Collection Fields
        </h3>
        <div className="space-y-2 mb-3">
          {fields.map((f) => {
            const IconComponent = FIELD_TYPE_ICONS[f.type];
            return (
              <div key={f.key} className="flex items-center gap-2 text-sm">
                <div className="w-6 flex justify-center">
                  {IconComponent && <IconComponent className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
                <span className="font-mono text-xs text-muted-foreground w-28 truncate">{f.key}</span>
                <span className="flex-1 truncate">{f.label}</span>
                <Badge variant="secondary" className="text-[10px]">{f.type}</Badge>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onRemoveField(f.key)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input
            className="h-7 text-xs flex-1"
            placeholder="Field key..."
            id="new-field-key"
          />
          <Input
            className="h-7 text-xs flex-1"
            placeholder="Label..."
            id="new-field-label"
          />
          <select
            className="rounded-md border border-input bg-background text-xs h-7 px-2"
            id="new-field-type"
            defaultValue="text"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <Button
            variant="secondary"
            size="sm"
            className="gap-1 h-7 text-xs"
            onClick={() => {
              const keyEl = document.getElementById('new-field-key') as HTMLInputElement;
              const labelEl = document.getElementById('new-field-label') as HTMLInputElement;
              const typeEl = document.getElementById('new-field-type') as HTMLSelectElement;
              if (!keyEl.value.trim() || !labelEl.value.trim()) return;
              onAddField({
                key: keyEl.value.trim(),
                label: labelEl.value.trim(),
                type: typeEl.value as DatasourceFieldType,
              });
              keyEl.value = '';
              labelEl.value = '';
            }}
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { FIELD_TYPES, FIELD_TYPE_ICONS };
