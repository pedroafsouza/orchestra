import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import type { DatasourceField, DatasourceFieldType, RestSourceConfig } from '@orchestra/shared';

export interface Datasource {
  id: string;
  name: string;
  fields: DatasourceField[];
  sourceType: 'manual' | 'rest';
  sourceConfig?: RestSourceConfig;
  lastFetchAt?: string;
  lastFetchStatus?: string | null;
  lastFetchError?: string | null;
  _count?: { entries: number };
}

export interface Entry {
  id: string;
  data: Record<string, any>;
}

export interface TestRestResponse {
  success: boolean;
  statusCode: number;
  responseTime: number;
  data: any[];
  rawResponse: any;
  detectedFields: Array<{ key: string; label: string; type: string }>;
  totalItems: number;
  error: string | null;
}

export function useDatasources(projectId: string | undefined) {
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

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardSourceType, setWizardSourceType] = useState<'manual' | 'rest'>('manual');
  const [restConfig, setRestConfig] = useState<RestSourceConfig | null>(null);
  const [testResult, setTestResult] = useState<TestRestResponse | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Edit REST config state
  const [editingRestConfig, setEditingRestConfig] = useState(false);

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

  const handleCreateRestDs = async (
    name: string,
    config: RestSourceConfig,
    fields: DatasourceField[]
  ) => {
    try {
      const ds = await api(`/api/projects/${projectId}/datasources`, {
        method: 'POST',
        body: {
          name,
          fields,
          sourceType: 'rest',
          sourceConfig: config,
        },
      });
      setDatasources((prev) => [...prev, ds]);
      resetWizard();

      // Immediately fetch data
      try {
        setFetchLoading(true);
        const result = await api(
          `/api/projects/${projectId}/datasources/${ds.id}/fetch`,
          { method: 'POST' }
        );
        // Reload datasources to get updated fetch status
        const updatedDs = await api(`/api/projects/${projectId}/datasources`);
        setDatasources(updatedDs);
        // Auto-select the new datasource
        const newDs = updatedDs.find((d: Datasource) => d.id === ds.id);
        if (newDs) {
          await loadEntries(newDs);
        }
        toast({ title: `Fetched ${result.entriesCreated} entries`, variant: 'success' });
      } catch (fetchErr) {
        toast({
          title: 'Datasource created, but initial fetch failed',
          description: String(fetchErr),
          variant: 'destructive',
        });
      } finally {
        setFetchLoading(false);
      }
    } catch (err) {
      toast({
        title: 'Failed to create datasource',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleTestRest = async (config: RestSourceConfig): Promise<TestRestResponse> => {
    setTestLoading(true);
    try {
      const result = await api<TestRestResponse>(
        `/api/projects/${projectId}/datasources/test-rest`,
        { method: 'POST', body: config }
      );
      setTestResult(result);
      return result;
    } finally {
      setTestLoading(false);
    }
  };

  const handleFetchDs = async (dsId: string) => {
    setFetchLoading(true);
    try {
      const result = await api(
        `/api/projects/${projectId}/datasources/${dsId}/fetch`,
        { method: 'POST' }
      );
      // Reload datasource list to update status
      const updatedDs = await api(`/api/projects/${projectId}/datasources`);
      setDatasources(updatedDs);
      // Refresh entries
      const ds = updatedDs.find((d: Datasource) => d.id === dsId);
      if (ds) {
        setSelectedDs(ds);
        const newEntries = await api(
          `/api/projects/${projectId}/datasources/${dsId}/entries`
        );
        setEntries(newEntries);
      }
      if (result.success) {
        toast({ title: `Fetched ${result.entriesCreated} entries`, variant: 'success' });
      } else {
        toast({ title: 'Fetch failed', description: result.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({
        title: 'Fetch failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleUpdateRestConfig = async (dsId: string, config: RestSourceConfig) => {
    try {
      await api(`/api/projects/${projectId}/datasources/${dsId}`, {
        method: 'PUT',
        body: { sourceConfig: config },
      });
      // Reload datasources
      const updatedDs = await api(`/api/projects/${projectId}/datasources`);
      setDatasources(updatedDs);
      const ds = updatedDs.find((d: Datasource) => d.id === dsId);
      if (ds) setSelectedDs(ds);
      setEditingRestConfig(false);
      toast({ title: 'REST configuration updated', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Failed to update config',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const resetWizard = () => {
    setWizardOpen(false);
    setWizardStep(0);
    setWizardSourceType('manual');
    setRestConfig(null);
    setTestResult(null);
    setNewName('');
    setNewFields([{ key: 'title', label: 'Title', type: 'text' }]);
    setShowCreate(false);
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

  return {
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
    setNewFields,
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
    // Multi-source
    wizardOpen,
    setWizardOpen,
    wizardStep,
    setWizardStep,
    wizardSourceType,
    setWizardSourceType,
    restConfig,
    setRestConfig,
    testResult,
    setTestResult,
    testLoading,
    fetchLoading,
    editingRestConfig,
    setEditingRestConfig,
    handleTestRest,
    handleCreateRestDs,
    handleFetchDs,
    handleUpdateRestConfig,
    resetWizard,
  };
}
