import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faDiagramProject, faUsers } from '@fortawesome/free-solid-svg-icons';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, setProjects, addProject } = useProjectStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/projects')
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const project = await api('/api/projects', {
        method: 'POST',
        body: { name: newName },
      });
      addProject(project);
      setNewName('');
      setShowCreate(false);
      navigate(`/project/${project.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary-50 dark:bg-primary-950 text-primary-500 dark:text-primary-400">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-950 text-primary-800 dark:text-white">
      <header className="h-14 border-b flex items-center justify-between px-6
        bg-white border-primary-200
        dark:bg-primary-900 dark:border-primary-700">
        <span className="text-lg font-bold text-accent-600 dark:text-accent-400">Orchestra</span>
        <ThemeToggle />
      </header>

      <main className="max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Projects</h1>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-500 rounded-lg text-sm font-medium text-white transition-colors"
            onClick={() => setShowCreate(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>

        {showCreate && (
          <div className="mb-6 p-4 rounded-lg border flex gap-3
            bg-white border-primary-200
            dark:bg-primary-800 dark:border-primary-700">
            <input
              className="flex-1 px-3 py-2 rounded-lg text-sm border
                bg-primary-50 border-primary-300 text-primary-800 placeholder-primary-400
                dark:bg-primary-700 dark:border-primary-600 dark:text-white dark:placeholder-primary-400
                focus:outline-none focus:ring-1 focus:ring-accent-500"
              placeholder="Project name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <button
              className="px-4 py-2 bg-accent-600 hover:bg-accent-500 rounded-lg text-sm font-medium text-white transition-colors"
              onClick={handleCreate}
            >
              Create
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm transition-colors
                bg-primary-100 hover:bg-primary-200 text-primary-700
                dark:bg-primary-700 dark:hover:bg-primary-600 dark:text-white"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-20 text-primary-400">
            <p className="text-lg mb-2">No projects yet</p>
            <p className="text-sm">Create your first project to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <button
                key={project.id}
                className="p-5 rounded-xl text-left transition-all group border
                  bg-white hover:shadow-md border-primary-200 hover:border-accent-500/50
                  dark:bg-primary-800 dark:border-primary-700 dark:hover:border-accent-500/50"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <h3 className="font-semibold group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors mb-1">
                  {project.name}
                </h3>
                <p className="text-xs text-primary-400 font-mono mb-3">
                  {project.guid}
                </p>
                <div className="flex gap-4 text-xs text-primary-500">
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faDiagramProject} className="w-3 h-3" />
                    {project._count?.flows ?? 0} flows
                  </span>
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
                    {project._count?.members ?? 0} members
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
