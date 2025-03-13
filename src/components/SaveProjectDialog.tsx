"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "./ui/input";

type SaveProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSave: (newName: string) => void;
};

const SaveProjectDialog: React.FC<SaveProjectDialogProps> = ({
  open,
  onOpenChange,
  currentName,
  onSave,
}) => {
  const [projectName, setProjectName] = useState(currentName);

  // Update internal state when the dialog is reopened with a new currentName.
  React.useEffect(() => {
    setProjectName(currentName);
  }, [currentName]);

  const handleSave = () => {
    // If the current project is the default, remove it from localStorage.
    if (currentName === "Untitled Project") {
      const projectsStr = localStorage.getItem("museformer_projects");
      if (projectsStr) {
        try {
          const projects = JSON.parse(projectsStr);
          delete projects["Untitled Project"];
          localStorage.setItem("museformer_projects", JSON.stringify(projects));
        } catch (error) {
          console.error("Error deleting default project:", error);
        }
      }
    }
    // Then, call onSave with the new name.
    onSave(projectName);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-opacity-50" />
        <AlertDialogContent className="flex flex-col items-center justify-center">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Save Project
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Please enter a new name for your project:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="w-full my-4">
            <Input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Project Name"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-card">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSave}
              className="hover:bg-primary text-white"
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

export default SaveProjectDialog;
