// File: src/hooks/useProjectState.ts

import { useState, useEffect } from "react";
import {
  getMostRecentProject,
  saveProject,
  deleteProject,
  getProject,
  ProjectData,
} from "@/utils/projectUtil";
import { MusicalGroup } from "@/interfaces/MusicalGroup";

export function useProjectState(initialName = "Untitled Project") {
  const [projectName, setProjectName] = useState(initialName);
  const [groups, setGroups] = useState<MusicalGroup[]>([]);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [timelineScroll, setTimelineScroll] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [activeTheme, setActiveTheme] = useState("system");

  // On mount, load the most recent project.
  useEffect(() => {
    const mostRecent = getMostRecentProject();
    if (mostRecent) {
      setProjectName(mostRecent.projectName);
      setGroups(mostRecent.groups || []);
      setVideoId(mostRecent.videoId);
      setYoutubeUrl(mostRecent.youtubeUrl);
      setTimelineScroll(mostRecent.timelineScroll);
      setZoomLevel(mostRecent.zoomLevel);
      setActiveTheme(mostRecent.activeTheme);
    }
  }, []);

  // Whenever project state changes, save to localStorage.
  useEffect(() => {
    const currentProject: ProjectData = {
      projectName,
      groups,
      videoId,
      youtubeUrl,
      timelineScroll,
      zoomLevel,
      activeTheme,
      lastEdited: new Date().toISOString(),
    };
    saveProject(currentProject);
  }, [
    projectName,
    groups,
    videoId,
    youtubeUrl,
    timelineScroll,
    zoomLevel,
    activeTheme,
  ]);

  // Reset state for a new project. Also, if the current project is the default,
  // delete it from localStorage.
  const newProject = () => {
    if (projectName === "Untitled Project") {
      deleteProject("Untitled Project");
    }
    setProjectName("Untitled Project");
    setGroups([]);
    setVideoId(null);
    setYoutubeUrl("");
    setTimelineScroll(0);
    setZoomLevel(2);
    setActiveTheme("system");
  };

  // Open a project by name.
  const openProject = (projName: string) => {
    const proj = getProject(projName);
    if (proj) {
      setProjectName(proj.projectName);
      setGroups(proj.groups || []);
      setVideoId(proj.videoId);
      setYoutubeUrl(proj.youtubeUrl);
      setTimelineScroll(proj.timelineScroll);
      setZoomLevel(proj.zoomLevel);
      setActiveTheme(proj.activeTheme);
    }
  };

  return {
    projectName,
    setProjectName,
    groups,
    setGroups,
    videoId,
    setVideoId,
    youtubeUrl,
    setYoutubeUrl,
    timelineScroll,
    setTimelineScroll,
    zoomLevel,
    setZoomLevel,
    activeTheme,
    setActiveTheme,
    newProject,
    openProject,
  };
}
