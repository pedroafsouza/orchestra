import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDashboardPage } from '@/pages/ProjectDashboardPage';
import { FlowEditorPage } from '@/pages/FlowEditorPage';
import { DatasourcesPage } from '@/pages/DatasourcesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/project/:projectId" element={<ProjectDashboardPage />} />
        <Route path="/project/:projectId/flow" element={<FlowEditorPage />} />
        <Route path="/project/:projectId/datasources" element={<DatasourcesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
