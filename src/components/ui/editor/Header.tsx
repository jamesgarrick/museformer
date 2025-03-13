// File: src/components/Header.tsx
"use client";

import React from "react";
import {
  Menubar,
  MenubarContent,
  MenubarContextSubmenu,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import AboutDialog from "@/components/About";
import SaveProjectDialog from "@/components/SaveProjectDialog";
import { exportTimelineToJson } from "@/utils/exportTimeline";
import { useProjectState } from "@/hooks/useProjectState";
import { getAllProjects } from "@/utils/projectUtil";
import { ProjectData } from "@/utils/projectUtil";

type HeaderProps = {
  projectName: string;
  showAbout: boolean;
  setShowAbout: (open: boolean) => void;
  newProject: () => void;
  openProject: (projName: string) => void;
  projects: Record<string, ProjectData>; // your projects object from localStorage
  saveDialogOpen: boolean;
  setSaveDialogOpen: (open: boolean) => void;
  setTheme: (theme: string) => void;
  setActiveTheme: (theme: string) => void;
};

export const Header: React.FC<HeaderProps> = ({
  projectName,
  showAbout,
  setShowAbout,
  newProject,
  openProject,
  saveDialogOpen,
  setSaveDialogOpen,
  setTheme,
  setActiveTheme,
}) => {
  const {
    setProjectName,
    groups,
    // ...other state and functions
  } = useProjectState();

  const projects = getAllProjects();

  return (
    <header className="bg-background h-8 w-full flex items-center relative">
      <Menubar className="flex items-center justify-start border-none">
        <MenubarMenu>
          <MenubarTrigger className="font-bold text-foreground">
            Museformer
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setShowAbout(true)}>
              About Museformer
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="disabled">Preferences...</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <AboutDialog open={showAbout} onOpenChange={setShowAbout} />

        <MenubarMenu>
          <MenubarTrigger className="text-foreground">File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              className="text-foreground"
              onSelect={() => newProject()}
            >
              New...
            </MenubarItem>
            <MenubarItem className="text-foreground disabled">
              Open...
            </MenubarItem>
            <MenubarContextSubmenu trigger="Open Recent">
              {projects && Object.keys(projects).length > 0 ? (
                Object.keys(projects).map((projName) => (
                  <MenubarItem
                    key={projName}
                    className="text-foreground"
                    onSelect={() => openProject(projName)}
                  >
                    {projName}
                  </MenubarItem>
                ))
              ) : (
                <MenubarItem className="text-foreground disabled">
                  No recent projects
                </MenubarItem>
              )}
            </MenubarContextSubmenu>
            <MenubarSeparator />
            <MenubarItem className="text-foreground disabled">
              Close
            </MenubarItem>
            <MenubarItem
              onSelect={() => {
                if (projectName === "Untitled Project") {
                  setSaveDialogOpen(true);
                }
              }}
            >
              Save
            </MenubarItem>
            <MenubarItem className="text-foreground disabled">
              Save As...
            </MenubarItem>
            <MenubarContextSubmenu trigger="Export">
              <MenubarItem
                onClick={() => {
                  const jsonTimeline = exportTimelineToJson(groups);
                  navigator.clipboard
                    .writeText(jsonTimeline)
                    .then(() => {
                      alert("Timeline JSON copied to clipboard.");
                    })
                    .catch(() => {
                      alert("Failed to copy timeline JSON.");
                    });
                }}
              >
                Share Link
              </MenubarItem>
            </MenubarContextSubmenu>
          </MenubarContent>
          <SaveProjectDialog
            open={saveDialogOpen}
            onOpenChange={setSaveDialogOpen}
            currentName={projectName}
            onSave={(newName) => setProjectName(newName)}
          />
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="text-foreground">Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem className="disabled">
              Undo <MenubarShortcut className="px-4">ctrl+z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem className="disabled">
              Redo <MenubarShortcut className="px-4">ctrl+r</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="disabled">Cut</MenubarItem>
            <MenubarItem className="disabled">Copy</MenubarItem>
            <MenubarItem className="disabled">Paste</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="text-foreground">Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem className="disabled">Online Handbook</MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="disabled">View Logs</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="text-foreground">View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              onSelect={() => {
                setTheme("light");
                setActiveTheme("light");
              }}
            >
              Light
            </MenubarItem>
            <MenubarItem
              onSelect={() => {
                setTheme("dark");
                setActiveTheme("dark");
              }}
            >
              Dark
            </MenubarItem>
            <MenubarItem
              onSelect={() => {
                setTheme("system");
                setActiveTheme("system");
              }}
            >
              System
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <span className="text-foreground opacity-60 text-sm">
          {projectName}
        </span>
      </div>
    </header>
  );
};
