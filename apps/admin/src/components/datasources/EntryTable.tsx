import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Plus, Trash2, MapPin } from 'lucide-react';
import type { DatasourceField } from '@orchestra/shared';
import { FIELD_TYPE_ICONS } from './SchemaEditor';

interface Entry {
  id: string;
  data: Record<string, any>;
}

interface EntryTableProps {
  fields: DatasourceField[];
  entries: Entry[];
  filteredEntries: Entry[];
  onAddEntry: () => void;
  onUpdateEntry: (entryId: string, data: Record<string, any>) => void;
  onDeleteEntry: (entryId: string) => void;
  readOnly?: boolean;
}

export function EntryTable({
  fields,
  entries,
  filteredEntries,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  readOnly = false,
}: EntryTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            {fields.map((f) => {
              const IconComponent = FIELD_TYPE_ICONS[f.type];
              return (
                <TableHead
                  key={f.key}
                  className="text-xs font-semibold uppercase"
                >
                  <div className="flex items-center gap-1.5">
                    {IconComponent && (
                      <IconComponent className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    {f.label}
                  </div>
                </TableHead>
              );
            })}
            {!readOnly && (
              <TableHead className="text-right w-20 text-xs font-semibold uppercase">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEntries.map((entry) => (
            <TableRow key={entry.id}>
              {fields.map((f) => (
                <TableCell key={f.key} className="py-2">
                  {readOnly ? (
                    // Read-only display
                    f.type === 'image_url' && entry.data[f.key] ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={entry.data[f.key]}
                          alt=""
                          className="w-8 h-8 rounded object-cover"
                        />
                        <span className="text-xs truncate max-w-[150px]">
                          {entry.data[f.key]}
                        </span>
                      </div>
                    ) : f.type === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={!!entry.data[f.key]}
                        disabled
                      />
                    ) : f.type === 'geolocation' && entry.data[f.key] ? (
                      <span className="text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {entry.data[f.key]?.latitude?.toFixed(4)},{' '}
                        {entry.data[f.key]?.longitude?.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-xs">
                        {entry.data[f.key] ?? ''}
                      </span>
                    )
                  ) : (
                    // Editable display (original)
                    f.type === 'geolocation' ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <Input
                          className="w-24 h-7 text-xs bg-transparent border-transparent hover:border-input focus-visible:border-ring"
                          type="number"
                          step="any"
                          placeholder="Lat"
                          value={entry.data[f.key]?.latitude ?? ''}
                          onChange={(e) =>
                            onUpdateEntry(entry.id, {
                              ...entry.data,
                              [f.key]: {
                                ...(entry.data[f.key] || {}),
                                latitude: Number(e.target.value),
                              },
                            })
                          }
                        />
                        <Input
                          className="w-24 h-7 text-xs bg-transparent border-transparent hover:border-input focus-visible:border-ring"
                          type="number"
                          step="any"
                          placeholder="Lng"
                          value={entry.data[f.key]?.longitude ?? ''}
                          onChange={(e) =>
                            onUpdateEntry(entry.id, {
                              ...entry.data,
                              [f.key]: {
                                ...(entry.data[f.key] || {}),
                                longitude: Number(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    ) : f.type === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={!!entry.data[f.key]}
                        onChange={(e) =>
                          onUpdateEntry(entry.id, {
                            ...entry.data,
                            [f.key]: e.target.checked,
                          })
                        }
                      />
                    ) : f.type === 'image_url' && entry.data[f.key] ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={entry.data[f.key]}
                          alt=""
                          className="w-8 h-8 rounded object-cover"
                        />
                        <Input
                          className="flex-1 h-7 text-xs bg-transparent border-transparent hover:border-input focus-visible:border-ring"
                          value={entry.data[f.key] || ''}
                          onChange={(e) =>
                            onUpdateEntry(entry.id, {
                              ...entry.data,
                              [f.key]: e.target.value,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <Input
                        className="w-full h-7 text-xs bg-transparent border-transparent hover:border-input focus-visible:border-ring"
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={entry.data[f.key] ?? ''}
                        onChange={(e) =>
                          onUpdateEntry(entry.id, {
                            ...entry.data,
                            [f.key]:
                              f.type === 'number'
                                ? Number(e.target.value)
                                : e.target.value,
                          })
                        }
                      />
                    )
                  )}
                </TableCell>
              ))}
              {!readOnly && (
                <TableCell className="py-2 text-right">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDeleteEntry(entry.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
          {filteredEntries.length === 0 && entries.length > 0 && (
            <TableRow>
              <TableCell
                colSpan={fields.length + (readOnly ? 0 : 1)}
                className="text-center py-8 text-muted-foreground"
              >
                No entries match your search.
              </TableCell>
            </TableRow>
          )}
          {entries.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={fields.length + (readOnly ? 0 : 1)}
                className="text-center py-8 text-muted-foreground"
              >
                {readOnly
                  ? 'No entries yet. Click "Refresh" to fetch data.'
                  : 'No entries yet. Click "+ Add Entry" to create one.'}
              </TableCell>
            </TableRow>
          )}
          {/* Inline add row (manual only) */}
          {!readOnly && (
            <TableRow className="border-dashed border-t-2 hover:bg-muted/50">
              <TableCell
                colSpan={fields.length + 1}
                className="py-1"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={onAddEntry}
                >
                  <Plus className="w-3.5 h-3.5" />
                  New row
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
