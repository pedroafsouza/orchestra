import { useParams, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  ArrowLeft,
  Plus,
  X,
  Database,
  Search,
  Settings2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { DatasourceField } from '@orchestra/shared';
import { useDatasources } from '@/hooks/useDatasources';
import { DatasourceList } from '@/components/datasources/DatasourceList';
import { SchemaEditor, FIELD_TYPES } from '@/components/datasources/SchemaEditor';
import { EntryTable } from '@/components/datasources/EntryTable';

export function DatasourcesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const {
    datasources,
    selectedDs,
    entries,
    filteredEntries,
    loading,
    searchQuery,
    setSearchQuery,
    showCreate,
    setShowCreate,
    showSchema,
    setShowSchema,
    newName,
    setNewName,
    newFields,
    addField,
    updateField,
    removeField,
    loadEntries,
    handleCreateDs,
    handleAddEntry,
    handleUpdateEntry,
    handleDeleteEntry,
    handleAddFieldToDs,
    handleRemoveFieldFromDs,
  } = useDatasources(projectId);

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
        <DatasourceList
          datasources={datasources}
          selectedDsId={selectedDs?.id ?? null}
          onSelect={loadEntries}
          onShowCreate={() => setShowCreate(true)}
        />

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
                <SchemaEditor
                  fields={selectedDs.fields as DatasourceField[]}
                  onAddField={handleAddFieldToDs}
                  onRemoveField={handleRemoveFieldFromDs}
                />
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

              <EntryTable
                fields={selectedDs.fields as DatasourceField[]}
                entries={entries}
                filteredEntries={filteredEntries}
                onAddEntry={handleAddEntry}
                onUpdateEntry={handleUpdateEntry}
                onDeleteEntry={handleDeleteEntry}
              />
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
