import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { MusicalGroup } from "@/interfaces/MusicalGroup";

export interface ProjectData {
  projectName: string;
  groups: MusicalGroup[];
  videoId: string | null;
  youtubeUrl: string;
  timelineScroll: number;
  zoomLevel: number;
  activeTheme: string;
  lastEdited: string;
}

const DEFAULT_PROJECT: ProjectData = {
  projectName: "Untitled Project",
  groups: [],
  videoId: null,
  youtubeUrl: "",
  timelineScroll: 0,
  zoomLevel: 2,
  activeTheme: "system",
  lastEdited: new Date().toISOString(),
};

interface ProjectStore {
  activeProject: ProjectData;
  projects: Record<string, ProjectData>;
  isDirty: boolean; // This belongs here

  // Actions
  setProjectName: (name: string) => void;
  setGroups: (groups: MusicalGroup[]) => void;
  setVideoId: (id: string | null) => void;
  setYoutubeUrl: (url: string) => void;
  setTimelineScroll: (scroll: number) => void;
  setZoomLevel: (zoom: number) => void;
  setActiveTheme: (theme: string) => void;
  markClean: () => void; // This belongs here

  saveCurrentProject: () => void;
  newProject: () => void;
  openProject: (projectName: string) => void;
  deleteProject: (projectName: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
  devtools(
    persist(
      (set, get) => ({
        activeProject: {
          ...DEFAULT_PROJECT,
          lastEdited: new Date().toISOString(),
        },
        isDirty: false,
        projects: {},
        // Setters
        setProjectName: (projectName) => {
          if (
            projectName in get().projects &&
            projectName !== get().activeProject.projectName
          ) {
            throw new Error(`Project "${projectName}" already exists`);
          }
          set((state) => ({
            activeProject: {
              ...state.activeProject,
              projectName,
              lastEdited: new Date().toISOString(),
            },

            isDirty: true,
          }));
        },
        setGroups: (
          groups:
            | MusicalGroup[]
            | ((prevGroups: MusicalGroup[]) => MusicalGroup[])
        ) =>
          set((state) => ({
            activeProject: {
              ...state.activeProject,
              groups:
                typeof groups === "function"
                  ? groups(state.activeProject.groups)
                  : groups,
              lastEdited: new Date().toISOString(),
            },
          })),

        setVideoId: (id) =>
          set((state) => ({
            activeProject: {
              ...state.activeProject,
              videoId: id,
              lastEdited: new Date().toISOString(),
            },
          })),
        setYoutubeUrl: (url) =>
          set((state) => ({
            activeProject: {
              ...state.activeProject,
              youtubeUrl: url,
              lastEdited: new Date().toISOString(),
            },
          })),
        setTimelineScroll: (scroll) =>
          set((state) => ({
            activeProject: {
              ...state.activeProject,
              timelineScroll: scroll,
              lastEdited: new Date().toISOString(),
            },
          })),
        setZoomLevel: (zoom) =>
          set((state) => ({
            activeProject: {
              ...state.activeProject,
              zoomLevel: zoom,
              lastEdited: new Date().toISOString(),
            },
          })),
        setActiveTheme: (theme) =>
          set((state) => ({
            activeProject: {
              ...state.activeProject,
              activeTheme: theme,
              lastEdited: new Date().toISOString(),
            },
          })),

        saveCurrentProject: () => {
          const { activeProject, projects } = get();
          set({
            projects: {
              ...projects,
              [activeProject.projectName]: activeProject,
            },
            isDirty: false,
          });
        },

        newProject: () => {
          set({
            activeProject: {
              ...DEFAULT_PROJECT,
              lastEdited: new Date().toISOString(),
            },
            isDirty: false,
          });
        },

        openProject: (projectName: string) => {
          try {
            const { projects } = get();
            if (!projects[projectName]) {
              throw new Error(`Project "${projectName}" not found`);
            }
            set({ activeProject: projects[projectName] });
          } catch (error) {
            console.error(error);
            // Handle error (show notification, etc.)
          }
        },

        deleteProject: (projectName: string) => {
          const { projects, activeProject } = get();
          const updatedProjects = { ...projects };
          delete updatedProjects[projectName];

          set({ projects: updatedProjects });

          if (activeProject.projectName === projectName) {
            set({
              activeProject: {
                projectName: "Untitled Project",
                groups: [],
                videoId: null,
                youtubeUrl: "",
                timelineScroll: 0,
                zoomLevel: 2,
                activeTheme: "system",
                lastEdited: new Date().toISOString(),
              },
            });
          }
        },

        markClean: () => set({ isDirty: false }),
      }),
      {
        name: "museformer_project_store",
      }
    )
  )
);
