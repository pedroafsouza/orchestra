import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPenNib,
  faDatabase,
  faGear,
} from '@fortawesome/free-solid-svg-icons';

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
      <div className="flex items-center justify-center h-screen bg-primary-50 dark:bg-primary-950 text-primary-500 dark:text-primary-400">
        Loading...
      </div>
    );
  }

  const cards = [
    {
      icon: faPenNib,
      iconBg: 'bg-accent-100 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400',
      title: 'Flow Editor',
      desc: 'Design screen flows and navigation graphs',
      onClick: () => navigate(`/project/${projectId}/flow`),
    },
    {
      icon: faDatabase,
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
      title: 'Datasources',
      desc: 'Manage collections and content',
      onClick: () => navigate(`/project/${projectId}/datasources`),
    },
    {
      icon: faGear,
      iconBg: 'bg-primary-200 text-primary-600 dark:bg-primary-600/30 dark:text-primary-300',
      title: 'Settings',
      desc: 'Team members, deploy config, API keys',
      onClick: () => navigate(`/project/${projectId}/settings`),
    },
  ];

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-950 text-primary-800 dark:text-white">
      <header className="h-14 border-b flex items-center justify-between px-6
        bg-white border-primary-200
        dark:bg-primary-900 dark:border-primary-700">
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1.5 text-primary-500 hover:text-primary-800 dark:text-primary-400 dark:hover:text-white text-sm transition-colors"
            onClick={() => navigate('/')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
            Projects
          </button>
          <span className="text-primary-300 dark:text-primary-600">/</span>
          <span className="font-semibold">{currentProject.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-primary-400 dark:text-primary-500 font-mono">
            {currentProject.guid}
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cards.map((card) => (
            <button
              key={card.title}
              className="p-6 rounded-xl text-left transition-all group border
                bg-white hover:shadow-md border-primary-200 hover:border-accent-500/50
                dark:bg-primary-800 dark:border-primary-700 dark:hover:border-accent-500/50"
              onClick={card.onClick}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.iconBg}`}>
                <FontAwesomeIcon icon={card.icon} className="w-5 h-5" />
              </div>
              <h3 className="font-semibold group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors mb-1">
                {card.title}
              </h3>
              <p className="text-xs text-primary-500 dark:text-primary-400">
                {card.desc}
              </p>
            </button>
          ))}
        </div>

        <div className="rounded-xl border p-6
          bg-white border-primary-200
          dark:bg-primary-800 dark:border-primary-700">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400 mb-4">
            Deploy Endpoint
          </h2>
          <code className="block px-4 py-3 rounded-lg text-sm text-accent-600 dark:text-accent-400 font-mono
            bg-primary-50 dark:bg-primary-900">
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
