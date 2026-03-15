import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
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

  // Create datasource state
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
      <div className="flex items-center justify-center h-screen bg-primary-950 text-primary-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-950 text-white">
      <header className="h-14 bg-primary-900 border-b border-primary-700 flex items-center px-6 gap-3">
        <button
          className="text-primary-400 hover:text-white text-sm transition-colors"
          onClick={() => navigate(`/project/${projectId}`)}
        >
          &larr; Dashboard
        </button>
        <span className="text-primary-600">/</span>
        <span className="font-semibold">Datasources</span>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar: datasource list */}
        <div className="w-64 bg-primary-800 border-r border-primary-700 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-400">
              Collections
            </h3>
            <button
              className="text-xs text-accent-400 hover:text-accent-300"
              onClick={() => setShowCreate(true)}
            >
              + New
            </button>
          </div>

          {datasources.map((ds) => (
            <button
              key={ds.id}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${
                selectedDs?.id === ds.id
                  ? 'bg-accent-600/20 text-accent-300'
                  : 'text-primary-300 hover:bg-primary-700'
              }`}
              onClick={() => loadEntries(ds)}
            >
              <span className="font-medium">{ds.name}</span>
              <span className="text-xs text-primary-500 ml-2">
                {ds._count?.entries ?? 0} rows
              </span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          {showCreate && (
            <div className="mb-6 p-5 bg-primary-800 rounded-xl border border-primary-700">
              <h3 className="font-semibold mb-3">New Datasource</h3>
              <input
                className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded text-sm text-white mb-3"
                placeholder="Collection name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <p className="text-xs text-primary-400 mb-2">Fields:</p>
              {newFields.map((field, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    className="flex-1 px-2 py-1 text-xs bg-primary-700 border border-primary-600 rounded text-white"
                    placeholder="Key"
                    value={field.key}
                    onChange={(e) => updateField(i, { key: e.target.value })}
                  />
                  <input
                    className="flex-1 px-2 py-1 text-xs bg-primary-700 border border-primary-600 rounded text-white"
                    placeholder="Label"
                    value={field.label}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                  />
                  <select
                    className="px-2 py-1 text-xs bg-primary-700 border border-primary-600 rounded text-white"
                    value={field.type}
                    onChange={(e) => updateField(i, { type: e.target.value as any })}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    className="text-xs text-red-400 hover:text-red-300"
                    onClick={() => removeField(i)}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                className="text-xs text-accent-400 hover:text-accent-300 mb-3"
                onClick={addField}
              >
                + Add Field
              </button>
              <div className="flex gap-2">
                <button
                  className="px-4 py-1.5 text-sm bg-accent-600 hover:bg-accent-500 rounded font-medium transition-colors"
                  onClick={handleCreateDs}
                >
                  Create
                </button>
                <button
                  className="px-4 py-1.5 text-sm bg-primary-700 hover:bg-primary-600 rounded transition-colors"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {selectedDs ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{selectedDs.name}</h2>
                <button
                  className="px-3 py-1.5 text-xs bg-accent-600 hover:bg-accent-500 rounded font-medium transition-colors"
                  onClick={handleAddEntry}
                >
                  + Add Entry
                </button>
              </div>

              {/* Table */}
              <div className="bg-primary-800 rounded-xl border border-primary-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-700">
                      {(selectedDs.fields as DatasourceField[]).map((f) => (
                        <th
                          key={f.key}
                          className="px-4 py-2 text-left text-xs font-semibold text-primary-400 uppercase"
                        >
                          {f.label}
                        </th>
                      ))}
                      <th className="px-4 py-2 text-right text-xs font-semibold text-primary-400 uppercase w-20">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-primary-700/50 hover:bg-primary-750">
                        {(selectedDs.fields as DatasourceField[]).map((f) => (
                          <td key={f.key} className="px-4 py-2">
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
                                <input
                                  className="flex-1 px-2 py-0.5 text-xs bg-primary-700 border border-primary-600 rounded text-white"
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
                              <input
                                className="w-full px-2 py-0.5 text-xs bg-transparent border border-transparent hover:border-primary-600 focus:border-accent-500 rounded text-white outline-none"
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
                          </td>
                        ))}
                        <td className="px-4 py-2 text-right">
                          <button
                            className="text-xs text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {entries.length === 0 && (
                      <tr>
                        <td
                          colSpan={(selectedDs.fields as DatasourceField[]).length + 1}
                          className="px-4 py-8 text-center text-primary-500 text-sm"
                        >
                          No entries yet. Click "+ Add Entry" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-primary-400">
              <p className="text-lg mb-2">Select a collection</p>
              <p className="text-sm">Or create a new one to start managing data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
