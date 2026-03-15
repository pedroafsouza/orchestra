import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
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
];

export function DatasourcesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [selectedDs, setSelectedDs] = useState<Datasource | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFields, setNewFields] = useState<DatasourceField[]>([
    { key: 'title', label: 'Title', type: 'text' },
  ]);

  useEffect(() => {
    api(`/api/projects/${projectId}/datasources`)
      .then(setDatasources)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

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
      data[field.key] = field.type === 'boolean' ? false : field.type === 'number' ? 0 : '';
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
                <h2 className="text-lg font-semibold">{selectedDs.name}</h2>
                <Button size="sm" className="gap-1.5" onClick={handleAddEntry}>
                  <Plus className="w-3 h-3" />
                  Add Entry
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {(selectedDs.fields as DatasourceField[]).map((f) => (
                        <TableHead
                          key={f.key}
                          className="text-xs font-semibold uppercase"
                        >
                          {f.label}
                        </TableHead>
                      ))}
                      <TableHead className="text-right w-20 text-xs font-semibold uppercase">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        {(selectedDs.fields as DatasourceField[]).map((f) => (
                          <TableCell key={f.key} className="py-2">
                            {f.type === 'boolean' ? (
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
                    {entries.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={(selectedDs.fields as DatasourceField[]).length + 1}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No entries yet. Click "+ Add Entry" to create one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg mb-2">Select a collection</p>
              <p className="text-sm">Or create a new one to start managing data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
