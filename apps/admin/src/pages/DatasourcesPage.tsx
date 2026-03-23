import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { RestSourceConfig } from '@orchestra/shared';
import type { TestRestResponse } from '@/hooks/useDatasources';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  ArrowLeft,
  Plus,
  Database,
  Search,
  Settings2,
  ChevronDown,
  ChevronUp,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { DatasourceField } from '@orchestra/shared';
import { useDatasources } from '@/hooks/useDatasources';
import { DatasourceList } from '@/components/datasources/DatasourceList';
import { SchemaEditor } from '@/components/datasources/SchemaEditor';
import { EntryTable } from '@/components/datasources/EntryTable';
import { DatasourceWizard } from '@/components/datasources/DatasourceWizard';
import { FetchStatusBar } from '@/components/datasources/FetchStatusBar';
import { RestConfigForm } from '@/components/datasources/RestConfigForm';
import { Card, CardContent } from '@/components/ui/card';

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
    showSchema,
    setShowSchema,
    loadEntries,
    handleCreateDs,
    handleAddEntry,
    handleUpdateEntry,
    handleDeleteEntry,
    handleAddFieldToDs,
    handleRemoveFieldFromDs,
    // Multi-source
    wizardOpen,
    setWizardOpen,
    testResult,
    testLoading,
    fetchLoading,
    editingRestConfig,
    setEditingRestConfig,
    handleTestRest,
    handleCreateRestDs,
    handleFetchDs,
    handleUpdateRestConfig,
    resetWizard,
    newName,
    setNewName,
    newFields,
    setNewFields,
  } = useDatasources(projectId);

  const isRest = selectedDs?.sourceType === 'rest';

  const openWizard = () => {
    resetWizard();
    setWizardOpen(true);
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
      <header className="h-14 border-b flex items-center justify-between px-6 bg-card/80 backdrop-blur-md sticky top-0 z-50">
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
          onShowCreate={openWizard}
        />

        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Wizard */}
          {wizardOpen && (
            <DatasourceWizard
              onCreateManual={async (name, fields) => {
                try {
                  const { api } = await import('@/lib/api');
                  const ds = await api(
                    `/api/projects/${projectId}/datasources`,
                    { method: 'POST', body: { name, fields } }
                  );
                  resetWizard();
                  window.location.reload();
                } catch (err) {
                  alert(err instanceof Error ? err.message : 'Failed');
                }
              }}
              onCreateRest={handleCreateRestDs}
              onTestRest={handleTestRest}
              testResult={testResult}
              testLoading={testLoading}
              onCancel={resetWizard}
            />
          )}

          {/* Edit REST config */}
          {editingRestConfig && selectedDs?.sourceConfig && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Edit REST Configuration</h3>
                <EditRestConfig
                  dsId={selectedDs.id}
                  initialConfig={selectedDs.sourceConfig as any}
                  onSave={handleUpdateRestConfig}
                  onCancel={() => setEditingRestConfig(false)}
                  onTest={handleTestRest}
                  testResult={testResult}
                  testLoading={testLoading}
                />
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
                  {isRest && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Globe className="w-3 h-3" />
                      REST
                    </Badge>
                  )}
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
                    {showSchema ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </Button>
                  {!isRest && (
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={handleAddEntry}
                    >
                      <Plus className="w-3 h-3" />
                      Add Entry
                    </Button>
                  )}
                </div>
              </div>

              {/* Fetch status bar for REST datasources */}
              {isRest && (
                <FetchStatusBar
                  datasource={selectedDs}
                  fetchLoading={fetchLoading}
                  onRefresh={() => handleFetchDs(selectedDs.id)}
                  onEditConfig={() => setEditingRestConfig(true)}
                />
              )}

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
                readOnly={isRest}
              />
            </>
          ) : !wizardOpen ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="rounded-full bg-muted p-6 mb-6">
                <Database className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Select a collection</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Choose from the sidebar or create a new one
              </p>
              <Button className="gap-1.5" onClick={openWizard}>
                <Plus className="w-4 h-4" />
                Create Collection
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Inline sub-component for editing REST config
function EditRestConfig({
  dsId,
  initialConfig,
  onSave,
  onCancel,
  onTest,
  testResult,
  testLoading,
}: {
  dsId: string;
  initialConfig: RestSourceConfig;
  onSave: (dsId: string, config: RestSourceConfig) => void;
  onCancel: () => void;
  onTest: (config: RestSourceConfig) => Promise<TestRestResponse>;
  testResult: TestRestResponse | null;
  testLoading: boolean;
}) {
  const [config, setConfig] = useState<RestSourceConfig>({ ...initialConfig });

  return (
    <div>
      <RestConfigForm
        config={config}
        onChange={setConfig}
        onTest={onTest}
        testResult={testResult}
        testLoading={testLoading}
      />
      <div className="flex gap-2 mt-4 pt-4 border-t">
        <Button size="sm" onClick={() => onSave(dsId, config)}>
          Save Configuration
        </Button>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
