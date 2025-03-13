// File: src/utils/projectUtil.ts
import { MusicalGroup } from "@/interfaces/MusicalGroup";

export interface ProjectData {
  groups: MusicalGroup[]; // Replace with your specific MusicalGroup[] type if available.
  videoId: string | null;
  youtubeUrl: string;
  timelineScroll: number;
  zoomLevel: number;
  activeTheme: string;
  projectName: string;
  lastEdited: string;
}

const STORAGE_KEY = "museformer_projects";

export function getAllProjects(): Record<string, ProjectData> {
  if (typeof window === "undefined") return {}; // Return empty on server side
  const projectsStr = localStorage.getItem(STORAGE_KEY);
  return projectsStr ? JSON.parse(projectsStr) : {};
}

export function saveProject(projectData: ProjectData): void {
  const projects = getAllProjects();
  projects[projectData.projectName] = projectData;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function deleteProject(projectName: string): void {
  const projects = getAllProjects();
  if (projects[projectName]) {
    delete projects[projectName];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }
}

export function getProject(projectName: string): ProjectData | null {
  const projects = getAllProjects();
  return projects[projectName] || null;
}

export function getMostRecentProject(): ProjectData | null {
  const projects = getAllProjects();
  let mostRecent: ProjectData | null = null;
  let mostRecentTimestamp = 0;
  for (const key in projects) {
    const proj = projects[key];
    if (proj.lastEdited) {
      const ts = new Date(proj.lastEdited).getTime();
      if (ts > mostRecentTimestamp) {
        mostRecentTimestamp = ts;
        mostRecent = proj;
      }
    }
  }
  return mostRecent;
}
