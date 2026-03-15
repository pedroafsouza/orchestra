import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { api } from '@/lib/api';

export function ProjectDashboardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject } = useProjectStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    api(`/api/projects/${projectId}`)
      .then(setCurrentProject)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary-950 text-primary-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-950 text-white">
      <header className="h-14 bg-primary-900 border-b border-primary-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            className="text-primary-400 hover:text-white text-sm transition-colors"
            onClick={() => navigate('/')}
          >
            &larr; Projects
          </button>
          <span className="text-primary-600">/</span>
          <span className="font-semibold text-white">{currentProject.name}</span>
        </div>
        <span className="text-xs text-primary-500 font-mono">
          GUID: {currentProject.guid}
        </span>
      </header>

      <main className="max-w-5xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Flow editor card */}
          <button
            className="p-6 bg-primary-800 border border-primary-700 hover:border-accent-500/50 rounded-xl text-left transition-all group"
            onClick={() => navigate(`/project/${projectId}/flow`)}
          >
            <div className="text-3xl mb-3">&#x1F3A8;</div>
            <h3 className="font-semibold group-hover:text-accent-400 transition-colors mb-1">
              Flow Editor
            </h3>
            <p className="text-xs text-primary-400">
              Design screen flows and navigation graphs
            </p>
          </button>

          {/* Datasources card */}
          <button
            className="p-6 bg-primary-800 border border-primary-700 hover:border-accent-500/50 rounded-xl text-left transition-all group"
            onClick={() => navigate(`/project/${projectId}/datasources`)}
          >
            <div className="text-3xl mb-3">&#x1F4BE;</div>
            <h3 className="font-semibold group-hover:text-accent-400 transition-colors mb-1">
              Datasources
            </h3>
            <p className="text-xs text-primary-400">
              Manage collections and content
            </p>
          </button>

          {/* Settings card */}
          <button
            className="p-6 bg-primary-800 border border-primary-700 hover:border-accent-500/50 rounded-xl text-left transition-all group"
            onClick={() => navigate(`/project/${projectId}/settings`)}
          >
            <div className="text-3xl mb-3">&#x2699;</div>
            <h3 className="font-semibold group-hover:text-accent-400 transition-colors mb-1">
              Settings
            </h3>
            <p className="text-xs text-primary-400">
              Team members, deploy config, API keys
            </p>
          </button>
        </div>

        {/* Project info */}
        <div className="bg-primary-800 rounded-xl border border-primary-700 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-400 mb-4">
            Deploy Endpoint
          </h2>
          <code className="block bg-primary-900 px-4 py-3 rounded-lg text-sm text-accent-400 font-mono">
            GET /api/flow/{currentProject.guid}/latest
          </code>
          <p className="text-xs text-primary-500 mt-2">
            Use this endpoint in your mobile app to fetch the published flow for this project.
          </p>
        </div>
      </main>
    </div>
  );
}
