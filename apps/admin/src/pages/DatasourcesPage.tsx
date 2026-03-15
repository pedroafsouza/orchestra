import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPlus,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
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
      <div className="flex items-center justify-center h-screen bg-primary-50 dark:bg-primary-950 text-primary-500 dark:text-primary-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-950 text-primary-800 dark:text-white">
      <header className="h-14 border-b flex items-center justify-between px-6
        bg-white border-primary-200
        dark:bg-primary-900 dark:border-primary-700">
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1.5 text-primary-500 hover:text-primary-800 dark:text-primary-400 dark:hover:text-white text-sm transition-colors"
            onClick={() => navigate(`/project/${projectId}`)}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <span className="text-primary-300 dark:text-primary-600">/</span>
          <span className="font-semibold">Datasources</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar: datasource list */}
        <div className="w-64 p-4 overflow-y-auto border-r
          bg-white border-primary-200
          dark:bg-primary-800 dark:border-primary-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400">
              Collections
            </h3>
            <button
              className="flex items-center gap-1 text-xs text-accent-600 dark:text-accent-400 hover:text-accent-500"
              onClick={() => setShowCreate(true)}
            >
              <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
              New
            </button>
          </div>

          {datasources.map((ds) => (
            <button
              key={ds.id}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${
                selectedDs?.id === ds.id
                  ? 'bg-accent-100 text-accent-700 dark:bg-accent-600/20 dark:text-accent-300'
                  : 'text-primary-600 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-700'
              }`}
              onClick={() => loadEntries(ds)}
            >
              <span className="font-medium">{ds.name}</span>
              <span className="text-xs text-primary-400 dark:text-primary-500 ml-2">
                {ds._count?.entries ?? 0} rows
              </span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          {showCreate && (
            <div className="mb-6 p-5 rounded-xl border
              bg-white border-primary-200
              dark:bg-primary-800 dark:border-primary-700">
              <h3 className="font-semibold mb-3">New Datasource</h3>
              <input
                className="w-full px-3 py-2 rounded-lg text-sm border mb-3
                  bg-primary-50 border-primary-300 text-primary-800
                  dark:bg-primary-700 dark:border-primary-600 dark:text-white
                  focus:outline-none focus:ring-1 focus:ring-accent-500"
                placeholder="Collection name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <p className="text-xs text-primary-500 dark:text-primary-400 mb-2">Fields:</p>
              {newFields.map((field, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    className="flex-1 px-2 py-1 text-xs rounded-lg border
                      bg-primary-50 border-primary-300 text-primary-800
                      dark:bg-primary-700 dark:border-primary-600 dark:text-white"
                    placeholder="Key"
                    value={field.key}
                    onChange={(e) => updateField(i, { key: e.target.value })}
                  />
                  <input
                    className="flex-1 px-2 py-1 text-xs rounded-lg border
                      bg-primary-50 border-primary-300 text-primary-800
                      dark:bg-primary-700 dark:border-primary-600 dark:text-white"
                    placeholder="Label"
                    value={field.label}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                  />
                  <select
                    className="px-2 py-1 text-xs rounded-lg border
                      bg-primary-50 border-primary-300 text-primary-800
                      dark:bg-primary-700 dark:border-primary-600 dark:text-white"
                    value={field.type}
                    onChange={(e) => updateField(i, { type: e.target.value as any })}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    className="text-red-500 dark:text-red-400 hover:text-red-600"
                    onClick={() => removeField(i)}
                  >
                    <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                className="flex items-center gap-1 text-xs text-accent-600 dark:text-accent-400 hover:text-accent-500 mb-3"
                onClick={addField}
              >
                <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
                Add Field
              </button>
              <div className="flex gap-2">
                <button
                  className="px-4 py-1.5 text-sm bg-accent-600 hover:bg-accent-500 rounded-lg font-medium text-white transition-colors"
                  onClick={handleCreateDs}
                >
                  Create
                </button>
                <button
                  className="px-4 py-1.5 text-sm rounded-lg transition-colors
                    bg-primary-100 hover:bg-primary-200 text-primary-700
                    dark:bg-primary-700 dark:hover:bg-primary-600 dark:text-white"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent-600 hover:bg-accent-500 rounded-lg font-medium text-white transition-colors"
                  onClick={handleAddEntry}
                >
                  <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                  Add Entry
                </button>
              </div>

              <div className="rounded-xl border overflow-hidden
                bg-white border-primary-200
                dark:bg-primary-800 dark:border-primary-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-200 dark:border-primary-700">
                      {(selectedDs.fields as DatasourceField[]).map((f) => (
                        <th
                          key={f.key}
                          className="px-4 py-2.5 text-left text-xs font-semibold uppercase
                            text-primary-500 dark:text-primary-400"
                        >
                          {f.label}
                        </th>
                      ))}
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase text-primary-500 dark:text-primary-400 w-20">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-primary-100 dark:border-primary-700/50
                        hover:bg-primary-50 dark:hover:bg-primary-750">
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
                                  className="flex-1 px-2 py-0.5 text-xs rounded border
                                    bg-transparent border-primary-200 text-primary-800
                                    dark:border-primary-600 dark:text-white"
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
                                className="w-full px-2 py-0.5 text-xs rounded border outline-none
                                  bg-transparent border-transparent
                                  hover:border-primary-300 focus:border-accent-500
                                  dark:hover:border-primary-600 dark:focus:border-accent-500
                                  text-primary-800 dark:text-white"
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
                            className="text-red-500 dark:text-red-400 hover:text-red-600"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {entries.length === 0 && (
                      <tr>
                        <td
                          colSpan={(selectedDs.fields as DatasourceField[]).length + 1}
                          className="px-4 py-8 text-center text-primary-400 dark:text-primary-500 text-sm"
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
