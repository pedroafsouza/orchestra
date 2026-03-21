import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  ArrowLeft,
  Plus,
  Trash2,
  X,
  Database,
  Search,
  Type,
  Hash,
  ToggleLeft,
  Calendar,
  Image,
  FileText,
  Link,
  MapPin,
  Settings2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { DatasourceField, DatasourceFieldType } from '@orchestra/shared';

interface Datasource {
  id: string;
  name: string;
  fields: DatasourceField[];
  _count?: { entries: number };
}

interface Entry {
  id: string;
  data: Record<string, any>;
}

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

export function DatasourcesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [selectedDs, setSelectedDs] = useState<Datasource | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFields, setNewFields] = useState<DatasourceField[]>([
    { key: 'title', label: 'Title', type: 'text' },
  ]);
  const { toast } = useToast();

  useEffect(() => {
    api(`/api/projects/${projectId}/datasources`)
      .then(setDatasources)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  // Reset search when switching datasources
  useEffect(() => {
    setSearchQuery('');
  }, [selectedDs?.id]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const query = searchQuery.toLowerCase();
    return entries.filter((entry) =>
      Object.values(entry.data).some((value) =>
        String(value ?? '').toLowerCase().includes(query)
      )
    );
  }, [entries, searchQuery]);

  const loadEntries = async (ds: Datasource) => {
    setSelectedDs(ds);
    const data = await api(
      `/api/projects/${projectId}/datasources/${ds.id}/entries`
    );
    setEntries(data);
  };

  const handleCreateDs = async () => {
    if (!newName.trim()) return;
    try {
      const ds = await api(`/api/projects/${projectId}/datasources`, {
        method: 'POST',
        body: { name: newName, fields: newFields },
      });
      setDatasources((prev) => [...prev, ds]);
      setNewName('');
      setNewFields([{ key: 'title', label: 'Title', type: 'text' }]);
      setShowCreate(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    }
  };

  const addField = () => {
    setNewFields((prev) => [
      ...prev,
      { key: `field_${prev.length}`, label: '', type: 'text' },
    ]);
  };

  const updateField = (index: number, updates: Partial<DatasourceField>) => {
    setNewFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  const removeField = (index: number) => {
    setNewFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddEntry = async () => {
    if (!selectedDs) return;
    const data: Record<string, any> = {};
    for (const field of selectedDs.fields) {
      data[field.key] = field.type === 'boolean' ? false : field.type === 'number' ? 0 : field.type === 'geolocation' ? { latitude: 0, longitude: 0 } : '';
    }
    const entry = await api(
      `/api/projects/${projectId}/datasources/${selectedDs.id}/entries`,
      { method: 'POST', body: { data } }
    );
    setEntries((prev) => [...prev, entry]);
  };

  const handleUpdateEntry = async (entryId: string, data: Record<string, any>) => {
    if (!selectedDs) return;
    await api(
      `/api/projects/${projectId}/datasources/${selectedDs.id}/entries`,
      { method: 'PUT', body: { entryId, data } }
    );
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, data } : e))
    );
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!selectedDs) return;
    await api(
      `/api/projects/${projectId}/datasources/${selectedDs.id}/entries?entryId=${entryId}`,
      { method: 'DELETE' }
    );
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  const handleAddFieldToDs = async (field: DatasourceField) => {
    if (!selectedDs || !projectId) return;
    const updatedFields = [...selectedDs.fields, field];
    try {
      await api(`/api/projects/${projectId}/datasources/${selectedDs.id}`, {
        method: 'PUT',
        body: { fields: updatedFields },
      });
      const updated = { ...selectedDs, fields: updatedFields };
      setSelectedDs(updated);
      setDatasources((prev) => prev.map((ds) => (ds.id === selectedDs.id ? updated : ds)));
      toast({ title: `Field "${field.label}" added`, variant: 'success' });
    } catch (err) {
      toast({ title: 'Failed to add field', description: String(err), variant: 'destructive' });
    }
  };

  const handleRemoveFieldFromDs = async (fieldKey: string) => {
    if (!selectedDs || !projectId) return;
    const updatedFields = selectedDs.fields.filter((f) => f.key !== fieldKey);
    try {
      await api(`/api/projects/${projectId}/datasources/${selectedDs.id}`, {
        method: 'PUT',
        body: { fields: updatedFields },
      });
      const updated = { ...selectedDs, fields: updatedFields };
      setSelectedDs(updated);
      setDatasources((prev) => prev.map((ds) => (ds.id === selectedDs.id ? updated : ds)));
      toast({ title: 'Field removed', variant: 'success' });
    } catch (err) {
      toast({ title: 'Failed to remove field', description: String(err), variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b flex items-center justify-between px-6 bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => navigate(`/project/${projectId}`)}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <span className="font-semibold text-sm">Datasources</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar: datasource list */}
        <div className="w-64 border-r bg-card">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Collections
                </h3>
                <Button
                  variant="ghost"
                  size="xs"
                  className="gap-1 text-primary"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus className="w-3 h-3" />
                  New
                </Button>
              </div>

              {datasources.map((ds) => (
                <button
                  key={ds.id}
                  className={`w-full text-left px-3 py-2 rounded-md mb-1 text-sm transition-colors ${
                    selectedDs?.id === ds.id
                      ? 'bg-secondary text-secondary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-secondary/50'
                  }`}
                  onClick={() => loadEntries(ds)}
                >
                  <span className="font-medium">{ds.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {ds._count?.entries ?? 0} rows
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          {showCreate && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">New Datasource</h3>
                <Input
                  className="mb-3"
                  placeholder="Collection name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Fields:
                </Label>
                {newFields.map((field, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      className="flex-1 h-8 text-xs"
                      placeholder="Key"
                      value={field.key}
                      onChange={(e) => updateField(i, { key: e.target.value })}
                    />
                    <Input
                      className="flex-1 h-8 text-xs"
                      placeholder="Label"
                      value={field.label}
                      onChange={(e) => updateField(i, { label: e.target.value })}
                    />
                    <select
                      className="rounded-md border border-input bg-background text-sm h-8 px-2"
                      value={field.type}
                      onChange={(e) => updateField(i, { type: e.target.value as any })}
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeField(i)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="xs"
                  className="gap-1 text-primary mb-3"
                  onClick={addField}
                >
                  <Plus className="w-3 h-3" />
                  Add Field
                </Button>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateDs}>
                    Create
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedDs ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">{selectedDs.name}</h2>
                  <Badge variant="secondary">
                    {entries.length} {entries.length === 1 ? 'row' : 'rows'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setShowSchema(!showSchema)}
                  >
                    <Settings2 className="w-3 h-3" />
                    Fields
                    {showSchema ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={handleAddEntry}>
                    <Plus className="w-3 h-3" />
                    Add Entry
                  </Button>
                </div>
              </div>

              {/* Schema editor */}
              {showSchema && (
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Collection Fields
                    </h3>
                    <div className="space-y-2 mb-3">
                      {(selectedDs.fields as DatasourceField[]).map((f) => {
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
                              onClick={() => handleRemoveFieldFromDs(f.key)}
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
                          handleAddFieldToDs({
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
              )}

              {/* Search bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {(selectedDs.fields as DatasourceField[]).map((f) => {
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
                      <TableHead className="text-right w-20 text-xs font-semibold uppercase">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        {(selectedDs.fields as DatasourceField[]).map((f) => (
                          <TableCell key={f.key} className="py-2">
                            {f.type === 'geolocation' ? (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <Input
                                  className="w-24 h-7 text-xs bg-transparent border-transparent hover:border-input focus-visible:border-ring"
                                  type="number"
                                  step="any"
                                  placeholder="Lat"
                                  value={entry.data[f.key]?.latitude ?? ''}
                                  onChange={(e) =>
                                    handleUpdateEntry(entry.id, {
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
                                    handleUpdateEntry(entry.id, {
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
                                  handleUpdateEntry(entry.id, {
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
                                    handleUpdateEntry(entry.id, {
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
                                  handleUpdateEntry(entry.id, {
                                    ...entry.data,
                                    [f.key]:
                                      f.type === 'number'
                                        ? Number(e.target.value)
                                        : e.target.value,
                                  })
                                }
                              />
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="py-2 text-right">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredEntries.length === 0 && entries.length > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={(selectedDs.fields as DatasourceField[]).length + 1}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No entries match your search.
                        </TableCell>
                      </TableRow>
                    )}
                    {entries.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={(selectedDs.fields as DatasourceField[]).length + 1}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No entries yet. Click &quot;+ Add Entry&quot; to create one.
                        </TableCell>
                      </TableRow>
                    )}
                    {/* Inline add row */}
                    <TableRow className="border-dashed border-t-2 hover:bg-muted/50">
                      <TableCell
                        colSpan={(selectedDs.fields as DatasourceField[]).length + 1}
                        className="py-1"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full gap-1.5 text-muted-foreground hover:text-foreground"
                          onClick={handleAddEntry}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          New row
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="rounded-full bg-muted p-6 mb-6">
                <Database className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Select a collection</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Choose from the sidebar or create a new one
              </p>
              <Button className="gap-1.5" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4" />
                Create Collection
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
