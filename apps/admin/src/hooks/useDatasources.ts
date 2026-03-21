import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
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
  };
}
