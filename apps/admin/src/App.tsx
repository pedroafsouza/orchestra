import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDashboardPage } from '@/pages/ProjectDashboardPage';
import { FlowEditorPage } from '@/pages/FlowEditorPage';
import { DatasourcesPage } from '@/pages/DatasourcesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PreviewPage } from '@/pages/PreviewPage';
import { useThemeStore } from '@/store/themeStore';
import { Toaster } from '@/components/ui/toaster';

export default function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProjectsPage />} />
          <Route path="/project/:projectId" element={<ProjectDashboardPage />} />
          <Route path="/project/:projectId/flow" element={<FlowEditorPage />} />
          <Route path="/project/:projectId/datasources" element={<DatasourcesPage />} />
          <Route path="/project/:projectId/settings" element={<SettingsPage />} />
          <Route path="/project/:projectId/preview" element={<PreviewPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}
