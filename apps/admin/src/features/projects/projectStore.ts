import { create } from 'zustand';

interface Project {
  id: string;
  name: string;
  guid: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { flows: number; members: number };
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (currentProject) => set({ currentProject }),
  addProject: (project) =>
    set({ projects: [...get().projects, project] }),
  removeProject: (id) =>
    set({ projects: get().projects.filter((p) => p.id !== id) }),
}));
